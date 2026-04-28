import { NextRequest, NextResponse } from "next/server";
import { PULSE_DATA, ONA_DATA } from "@/lib/constants";

// Now reads from Google Sheets (pulse survey + ONA survey) instead of Rippling.
// Pulse cols (0-based): 0=RoleID, 1=FullName, 2=SubmittedAt, 3=Team,
//   4=feeling(1-10), 5=stressSource(1=work,10=life), 6=stressors(text),
//   7=balance(1-5), 8=proud(text), 9=celebrating(text),
//   10=supportNeeds(text), 11=caredForNames(csv), 12=gptw(1-5),
//   13=suggestions, 14=name(optional)
//
// ONA cols: 0=RoleID, 1=FullName, 2=SubmittedAt,
//   3=advice(csv names), 4=infoFlowEase(1-5), 5=stuck(csv names)

async function fetchSheet(id: string, key: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Sheets ${id} error ${res.status}`);
  const json = await res.json() as { values?: string[][] };
  return json.values ?? [];
}

function parseNames(csv: string): string[] {
  return csv.split(",").map((n) => n.trim()).filter(Boolean);
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1); // m-1 is current month (0-based), m-2 is prev
  return monthKey(d);
}

export async function GET(req: NextRequest) {
  const monthParam = req.nextUrl.searchParams.get("month"); // YYYY-MM, e.g. "2026-04"

  const key     = process.env.GOOGLE_SHEETS_API_KEY;
  const pulseId = process.env.GOOGLE_PULSE_SHEET_ID;
  const onaId   = process.env.GOOGLE_ONA_SHEET_ID;

  if (!key || !pulseId || !onaId) {
    return NextResponse.json({ source: "mock", pulse: PULSE_DATA, ona: ONA_DATA });
  }

  try {
    const [pulseRows, onaRows] = await Promise.all([
      fetchSheet(pulseId, key, "A1:O"),
      fetchSheet(onaId, key, "A1:F"),
    ]);

    // ── Pulse aggregation ────────────────────────────────────────────────────
    const allPulseData = pulseRows.slice(1).filter((r) => r[4]); // skip header, skip empty

    // Build month map from all data (used for trend + available months list)
    const byMonthMap: Record<string, { feelings: number[]; stressSources: number[]; balances: number[]; date: Date }> = {};
    allPulseData.forEach((r) => {
      const date = new Date(r[2]);
      if (isNaN(date.getTime())) return;
      const key = monthKey(date);
      if (!byMonthMap[key]) byMonthMap[key] = { feelings: [], stressSources: [], balances: [], date };
      const f = parseFloat(r[4]), s = parseFloat(r[5]), b = parseFloat(r[7]);
      if (!isNaN(f)) byMonthMap[key].feelings.push(f);
      if (!isNaN(s)) byMonthMap[key].stressSources.push(s);
      if (!isNaN(b)) byMonthMap[key].balances.push(b);
    });

    const sortedMonthKeys = Object.keys(byMonthMap).sort();
    const availableMonths = sortedMonthKeys.map((k) => ({
      key: k,
      label: byMonthMap[k].date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      short: byMonthMap[k].date.toLocaleDateString("en-US", { month: "short" }),
    }));

    // Determine active month: use param if provided, otherwise auto-detect
    const now = new Date();
    const autoMonth = monthKey(new Date(now.getFullYear(), now.getDate() >= 20 ? now.getMonth() : now.getMonth() - 1, 1));
    const activeMonth = (monthParam && byMonthMap[monthParam]) ? monthParam : autoMonth;
    const cycleLabel = byMonthMap[activeMonth]
      ? byMonthMap[activeMonth].date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : activeMonth;

    // Filter to active month
    const cycleData = allPulseData.filter((r) => {
      const d = new Date(r[2]);
      return !isNaN(d.getTime()) && monthKey(d) === activeMonth;
    });

    // Use all data as fallback if no responses in selected month
    const usedData = cycleData.length > 0 ? cycleData : allPulseData;

    // Prev month for comparison (always the month immediately before activeMonth)
    const prevKey = prevMonthKey(activeMonth);
    const prevPeriodData = allPulseData.filter((r) => {
      const d = new Date(r[2]);
      return !isNaN(d.getTime()) && monthKey(d) === prevKey;
    });

    const prevCycle = prevPeriodData.length > 0 ? {
      feeling:      avg(prevPeriodData.map((r) => parseFloat(r[4])).filter((n) => !isNaN(n))),
      stressSource: avg(prevPeriodData.map((r) => parseFloat(r[5])).filter((n) => !isNaN(n))),
      balance:      avg(prevPeriodData.map((r) => parseFloat(r[7])).filter((n) => !isNaN(n))),
    } : undefined;

    // Date range label from actual submitted dates in cycle
    const submittedDates = usedData.map((r) => new Date(r[2])).filter((d) => !isNaN(d.getTime()));
    submittedDates.sort((a, b) => a.getTime() - b.getTime());
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const dateRange = submittedDates.length
      ? { from: fmt(submittedDates[0]), to: fmt(submittedDates[submittedDates.length - 1]) }
      : null;

    const feelings      = usedData.map((r) => parseFloat(r[4])).filter((n) => !isNaN(n));
    const stressSources = usedData.map((r) => parseFloat(r[5])).filter((n) => !isNaN(n));
    const balances      = usedData.map((r) => parseFloat(r[7])).filter((n) => !isNaN(n));
    const gptwScores    = usedData.map((r) => parseFloat(r[12])).filter((n) => !isNaN(n));

    const proudCounts = { "Strongly Agree": 0, Agree: 0, Neutral: 0, Disagree: 0, "Strongly Disagree": 0 };
    usedData.forEach((r) => {
      const v = r[8]?.trim() as keyof typeof proudCounts;
      if (v in proudCounts) proudCounts[v]++;
    });
    const proudTotal = Object.values(proudCounts).reduce((a, b) => a + b, 0);

    const gptwDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    gptwScores.forEach((g) => { if (g >= 1 && g <= 5) gptwDist[Math.round(g)]++; });

    const flowerCounts: Record<string, number> = {};
    usedData.forEach((r) => {
      parseNames(r[11] ?? "").forEach((name) => {
        flowerCounts[name] = (flowerCounts[name] ?? 0) + 1;
      });
    });

    const celebrations = usedData.flatMap((r) =>
      (r[9] ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    );

    const stressors    = usedData.map((r) => r[6]).filter(Boolean);
    const supportNeeds = usedData.map((r) => r[10]).filter(Boolean);

    const monthEntries = sortedMonthKeys.map((k) => ({
      month:       byMonthMap[k].date.toLocaleDateString("en-US", { month: "short" }),
      stress:      avg(byMonthMap[k].feelings),
      feeling:     avg(byMonthMap[k].feelings),
      balance:     avg(byMonthMap[k].balances),
      stressSource: avg(byMonthMap[k].stressSources),
    }));

    const byTeam: Record<string, number[]> = {};
    usedData.forEach((r) => {
      const team = r[3]?.trim();
      const feeling = parseFloat(r[4]);
      if (team && !isNaN(feeling)) {
        byTeam[team] = byTeam[team] ?? [];
        byTeam[team].push(feeling);
      }
    });

    // ── ONA aggregation ──────────────────────────────────────────────────────
    const onaData = onaRows.slice(1).filter((r) => r[3] || r[5]);

    const infoEaseScores = onaData.map((r) => parseFloat(r[4])).filter((n) => !isNaN(n));

    const mentions: Record<string, number> = {};
    onaData.forEach((r) => {
      [...parseNames(r[3] ?? ""), ...parseNames(r[5] ?? "")].forEach((name) => {
        mentions[name] = (mentions[name] ?? 0) + 1;
      });
    });
    const maxMentions = Math.max(1, ...Object.values(mentions));
    const nodes = Object.entries(mentions)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        id: i + 1,
        name,
        centrality: Math.round((count / maxMentions) * 100) / 100,
        team: "",
        bridge: count / maxMentions > 0.6,
        overload: count / maxMentions > 0.85,
        isolation_risk: count / maxMentions < 0.2,
      }));

    return NextResponse.json({
      source: "sheets",
      pulse: {
        avgFeeling:      avg(feelings),
        avgStressSource: avg(stressSources),
        avgBalance:      avg(balances),
        avgGptw:         avg(gptwScores),
        cycleLabel,
        activeMonth,
        availableMonths,
        participation:   Math.round((usedData.length / 27) * 100),
        proudPct: proudTotal
          ? Math.round(((proudCounts["Strongly Agree"] + proudCounts.Agree) / proudTotal) * 100)
          : 0,
        proudDist: {
          stronglyAgree: proudTotal ? Math.round((proudCounts["Strongly Agree"] / proudTotal) * 100) : 0,
          agree:         proudTotal ? Math.round((proudCounts.Agree / proudTotal) * 100) : 0,
          neutral:       proudTotal ? Math.round((proudCounts.Neutral / proudTotal) * 100) : 0,
          disagree:      proudTotal ? Math.round(((proudCounts.Disagree + proudCounts["Strongly Disagree"]) / proudTotal) * 100) : 0,
        },
        gptwDist,
        flowerCounts,
        celebrations,
        stressors,
        supportNeeds,
        byTeam: Object.fromEntries(
          Object.entries(byTeam).map(([team, scores]) => [team, avg(scores)])
        ),
        responseCount: usedData.length,
        teamSize: 27,
        dateRange,
        trend: monthEntries.map(({ month, stress, feeling, balance }) => ({ month, stress, feeling, balance })),
        prevCycle,
      },
      ona: {
        nodes,
        infoFlowEase: avg(infoEaseScores),
        responseCount: onaData.length,
        alerts: [
          ...nodes.filter((n) => n.isolation_risk).map((n) => ({
            type: "isolation",
            message: `${n.name} shows reduced cross-team connections this cycle`,
          })),
          ...nodes.filter((n) => n.overload).map((n) => ({
            type: "overload",
            message: `${n.name} is a high-traffic connector — watch for network overload`,
          })),
        ],
      },
    });
  } catch (e) {
    console.error("Rippling/Sheets fetch failed:", e);
    return NextResponse.json({ source: "mock", pulse: PULSE_DATA, ona: ONA_DATA });
  }
}
