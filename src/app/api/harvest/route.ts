import { NextRequest, NextResponse } from "next/server";
import { STRESS_DATA } from "@/lib/constants";

// Week = 40 hours. Burnout risk = 82%+ billable sustained.
// Excluded: partners + ops leadership — they don't bill to client hours
const EXCLUDED = ["Ben Hart", "Gustavo Delgado", "Moe Rice", "Megan Cosgrove", "Mary-Susan Fiedler"];

// Harvest API v2 time report for team — returns per-user hours for date range.
// Harvest users have a `department` field that maps to Brains team names.

function toHarvestDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function rangeParams(range: string): { from: string; to: string; capacityHours: number } {
  const now = new Date();
  const to = toHarvestDate(now);
  let from: Date;
  let weeks: number;

  if (range === "3m") {
    from = new Date(now); from.setMonth(from.getMonth() - 3); weeks = 13;
  } else if (range === "6m") {
    from = new Date(now); from.setMonth(from.getMonth() - 6); weeks = 26;
  } else {
    // current month
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    weeks = Math.max(1, Math.ceil((now.getTime() - from.getTime()) / msPerWeek));
  }

  return { from: toHarvestDate(from), to, capacityHours: weeks * 40 };
}

interface HarvestTimeResult {
  user_name: string;
  total_hours: number;
  billable_hours: number;
}

interface HarvestUser {
  id: number;
  first_name: string;
  last_name: string;
  department?: string;
  is_active: boolean;
}

async function harvestFetch<T>(token: string, accountId: string, path: string): Promise<T> {
  const res = await fetch(`https://api.harvestapp.com/v2${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Harvest-Account-Id": accountId,
      "User-Agent": "Brains-PeopleDash/1.0",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Harvest ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") || "current";
  const token = process.env.HARVEST_TOKEN;
  const accountId = process.env.HARVEST_ACCOUNT_ID;

  if (!token || !accountId) {
    return NextResponse.json({ source: "mock", range, orgAvg: STRESS_DATA.orgAvg, teams: STRESS_DATA.teams });
  }

  try {
    const { from, to, capacityHours } = rangeParams(range);

    const [timeData, usersData] = await Promise.all([
      harvestFetch<{ results: HarvestTimeResult[] }>(token, accountId,
        `/reports/time/team?from=${from}&to=${to}&page=1&per_page=100`),
      harvestFetch<{ users: HarvestUser[] }>(token, accountId,
        "/users?is_active=true&page=1&per_page=100"),
    ]);

    // Build name → department map from users
    const deptMap: Record<string, string> = {};
    for (const u of usersData.users) {
      const fullName = `${u.first_name} ${u.last_name}`.trim();
      deptMap[fullName] = u.department || "Other";
    }

    // Filter excluded, compute per-person metrics
    const people = timeData.results
      .filter((r) => !EXCLUDED.includes(r.user_name) && r.total_hours > 0)
      .map((r) => ({
        name: r.user_name,
        team: deptMap[r.user_name] || "Other",
        totalHours: r.total_hours,
        billableHours: r.billable_hours,
        utilization: Math.round((r.total_hours / capacityHours) * 100),
        billable: r.total_hours > 0 ? Math.round((r.billable_hours / r.total_hours) * 100) : 0,
      }));

    // Org averages
    const avgUtil = people.length
      ? Math.round(people.reduce((s, p) => s + p.utilization, 0) / people.length)
      : 0;
    const avgBill = people.length
      ? Math.round(people.reduce((s, p) => s + p.billable, 0) / people.length)
      : 0;

    // Group by team
    const teamMap: Record<string, typeof people> = {};
    for (const p of people) {
      teamMap[p.team] = teamMap[p.team] ?? [];
      teamMap[p.team].push(p);
    }

    const teams = Object.entries(teamMap)
      .filter(([name]) => name !== "Other")
      .map(([name, members]) => {
        const util = Math.round(members.reduce((s, m) => s + m.utilization, 0) / members.length);
        const bill = Math.round(members.reduce((s, m) => s + m.billable, 0) / members.length);
        return {
          name,
          members: members.length,
          utilization: util,
          billable: bill,
          burnoutRisk: bill > 82,
          trend: "stable" as const, // would need previous cycle data to compute
          individuals: members.map((m) => ({ name: m.name, utilization: m.utilization, billable: m.billable })),
        };
      })
      .sort((a, b) => b.billable - a.billable);

    return NextResponse.json({
      source: "live",
      range,
      dateRange: { from, to },
      orgAvg: { utilization: avgUtil, billable: avgBill },
      teams,
    });
  } catch (e) {
    console.error("Harvest fetch failed:", e);
    return NextResponse.json({ source: "mock", range, orgAvg: STRESS_DATA.orgAvg, teams: STRESS_DATA.teams });
  }
}
