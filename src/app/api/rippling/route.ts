import { NextResponse } from "next/server";
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

export async function GET() {
  const key = process.env.GOOGLE_SHEETS_API_KEY;
  const pulseId = process.env.GOOGLE_PULSE_SHEET_ID;
  const onaId = process.env.GOOGLE_ONA_SHEET_ID;

  if (!key || !pulseId || !onaId) {
    return NextResponse.json({ source: "mock", pulse: PULSE_DATA, ona: ONA_DATA });
  }

  try {
    const [pulseRows, onaRows] = await Promise.all([
      fetchSheet(pulseId, key, "A1:O"),
      fetchSheet(onaId, key, "A1:F"),
    ]);

    // ── Pulse aggregation ────────────────────────────────────────────────────
    const pulseData = pulseRows.slice(1).filter((r) => r[4]); // skip header, skip empty

    // date range from SubmittedAt col (index 2)
    const submittedDates = pulseData.map((r) => new Date(r[2])).filter((d) => !isNaN(d.getTime()));
    submittedDates.sort((a, b) => a.getTime() - b.getTime());
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const dateRange = submittedDates.length
      ? { from: fmt(submittedDates[0]), to: fmt(submittedDates[submittedDates.length - 1]) }
      : null;

    const feelings = pulseData.map((r) => parseFloat(r[4])).filter((n) => !isNaN(n));
    const stressSources = pulseData.map((r) => parseFloat(r[5])).filter((n) => !isNaN(n));
    const balances = pulseData.map((r) => parseFloat(r[7])).filter((n) => !isNaN(n));
    const gptwScores = pulseData.map((r) => parseFloat(r[12])).filter((n) => !isNaN(n));

    // proud distribution
    const proudCounts = { "Strongly Agree": 0, Agree: 0, Neutral: 0, Disagree: 0, "Strongly Disagree": 0 };
    pulseData.forEach((r) => {
      const v = r[8]?.trim() as keyof typeof proudCounts;
      if (v in proudCounts) proudCounts[v]++;
    });
    const proudTotal = Object.values(proudCounts).reduce((a, b) => a + b, 0);

    // GPTW distribution
    const gptwDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    gptwScores.forEach((g) => { if (g >= 1 && g <= 5) gptwDist[Math.round(g)]++; });

    // flower recipients (who cared for you)
    const flowerCounts: Record<string, number> = {};
    pulseData.forEach((r) => {
      parseNames(r[11] ?? "").forEach((name) => {
        flowerCounts[name] = (flowerCounts[name] ?? 0) + 1;
      });
    });

    // celebrations — split comma-separated entries into individual items
    const celebrations = pulseData.flatMap((r) =>
      (r[9] ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    );

    // open text: stressors + support needs
    const stressors = pulseData.map((r) => r[6]).filter(Boolean);
    const supportNeeds = pulseData.map((r) => r[10]).filter(Boolean);

    // Monthly trend — group by month from SubmittedAt
    const byMonthMap: Record<string, { feelings: number[]; stressSources: number[]; balances: number[]; date: Date }> = {};
    pulseData.forEach((r) => {
      const date = new Date(r[2]);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonthMap[key]) byMonthMap[key] = { feelings: [], stressSources: [], balances: [], date };
      const f = parseFloat(r[4]), s = parseFloat(r[5]), b = parseFloat(r[7]);
      if (!isNaN(f)) byMonthMap[key].feelings.push(f);
      if (!isNaN(s)) byMonthMap[key].stressSources.push(s);
      if (!isNaN(b)) byMonthMap[key].balances.push(b);
    });
    const monthEntries = Object.entries(byMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => ({
        month: data.date.toLocaleDateString("en-US", { month: "short" }),
        stress: avg(data.feelings),
        feeling: avg(data.feelings),
        balance: avg(data.balances),
        stressSource: avg(data.stressSources),
      }));
    const prevCycle = monthEntries.length >= 2 ? {
      feeling: monthEntries[monthEntries.length - 2].feeling,
      stressSource: monthEntries[monthEntries.length - 2].stressSource,
      balance: monthEntries[monthEntries.length - 2].balance,
    } : undefined;

    // by-team feeling
    const byTeam: Record<string, number[]> = {};
    pulseData.forEach((r) => {
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

    // In-degree centrality: count mentions per person across advice + stuck cols
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
        avgFeeling: avg(feelings),
        avgStressSource: avg(stressSources),
        avgBalance: avg(balances),
        avgGptw: avg(gptwScores),
        participation: Math.round((pulseData.length / 54) * 100), // 2 pulses × 27 members = 54 potential responses
        proudPct: proudTotal
          ? Math.round(((proudCounts["Strongly Agree"] + proudCounts.Agree) / proudTotal) * 100)
          : 0,
        proudDist: {
          stronglyAgree: proudTotal ? Math.round((proudCounts["Strongly Agree"] / proudTotal) * 100) : 0,
          agree: proudTotal ? Math.round((proudCounts.Agree / proudTotal) * 100) : 0,
          neutral: proudTotal ? Math.round((proudCounts.Neutral / proudTotal) * 100) : 0,
          disagree: proudTotal ? Math.round(((proudCounts.Disagree + proudCounts["Strongly Disagree"]) / proudTotal) * 100) : 0,
        },
        gptwDist,
        flowerCounts,
        celebrations,
        stressors,
        supportNeeds,
        byTeam: Object.fromEntries(
          Object.entries(byTeam).map(([team, scores]) => [team, avg(scores)])
        ),
        responseCount: pulseData.length,
        teamSize: 54,
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
