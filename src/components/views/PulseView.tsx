"use client";

import { useState } from "react";
import { PULSE_DATA } from "@/lib/constants";
import { pulseColor, delta } from "@/lib/utils";
import MiniBar from "@/components/ui/MiniBar";
import type { PulseApiData } from "@/lib/types";

interface Theme { theme: string; count: number; insight: string; }

function OpenTextPanel({ title, responses, accentColor }: { title: string; responses: string[]; accentColor: string }) {
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [loading, setLoading] = useState(false);

  const extractThemes = async () => {
    if (!responses.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "themes",
          prompt: `Survey responses:\n${responses.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
        }),
      });
      const data = await res.json() as { themes: Theme[] };
      setThemes(data.themes ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
      <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#BBBBB5", marginBottom: 16 }}>{responses.length} {responses.length === 1 ? "response" : "responses"} · verbatim · anonymous</div>

      {responses.length === 0 ? (
        <div style={{ fontSize: 14, color: "#BBBBB5" }}>No responses this cycle.</div>
      ) : (
        <>
          {themes ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {themes.slice(0, 5).map((t, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#131313" }}>{t.theme}</span>
                    <span style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>{t.count} responses</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#777", marginTop: 2, lineHeight: 1.5 }}>{t.insight}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
              {responses.map((text, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${accentColor}20`, paddingLeft: 10, fontSize: 12, color: "#555", lineHeight: 1.5 }}>{text}</div>
              ))}
            </div>
          )}

          <button
            onClick={extractThemes}
            disabled={loading}
            style={{ fontSize: 11, color: accentColor, background: "transparent", border: `1px solid ${accentColor}`, padding: "5px 12px", cursor: loading ? "default" : "pointer", letterSpacing: "0.05em", textTransform: "uppercase", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}
          >
            {loading ? "EXTRACTING..." : themes ? "RE-EXTRACT THEMES" : "EXTRACT TOP THEMES"}
          </button>
        </>
      )}
    </div>
  );
}

function LeadershipFramework({ stressors, supportNeeds }: { stressors: string[]; supportNeeds: string[] }) {
  const [framework, setFramework] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Work stress signals from the team:\n${stressors.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSupport needs expressed:\n${supportNeeds.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "framework", prompt }),
      });
      const data = await res.json() as { text: string };
      setFramework(data.text ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#131313", padding: "20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: framework ? 16 : 0 }}>
        <div>
          <div style={{ fontSize: 13, color: "#607D85", letterSpacing: "0.06em", textTransform: "uppercase" }}>LEADERSHIP FRAMEWORK</div>
          <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>Generated from this cycle&apos;s signals · rooted in markers of excellence</div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{ background: loading ? "#222" : "#EA5B32", color: "#fff", border: "none", padding: "10px 20px", fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "GENERATING..." : framework ? "REGENERATE" : "GENERATE FRAMEWORK"}
        </button>
      </div>
      {framework && (
        <div style={{ borderTop: "1px solid #222", paddingTop: 16 }}>
          {framework.split("\n").filter(Boolean).map((line, i) => (
            <div key={i} style={{ fontSize: 14, color: line.match(/^[A-Z].*:$/) ? "#EDC157" : "#C8C8C4", lineHeight: 1.7, fontWeight: line.match(/^[A-Z].*:$/) ? 700 : 400, marginTop: line.match(/^[A-Z].*:$/) ? 14 : 0 }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MARKERS: { name: string; color: string; highCoach: string; midCoach: string; lowCoach: string }[] = [
  {
    name: "Pivot with Purpose",
    color: "#3565E3",
    highCoach: "Momentum is strong — use it to drive a bold direction shift on a current project.",
    midCoach: "Prompt the team to name one thing they'd do differently if starting fresh. Small pivots build agility.",
    lowCoach: "Before pivoting anything externally, stabilise internally — check in 1:1 and remove blockers first.",
  },
  {
    name: "Brave Ideas, Bold Action",
    color: "#EDC157",
    highCoach: "High energy — challenge them with a stretch brief or a 'what if we...' provocation this sprint.",
    midCoach: "Create a low-stakes space for wild ideas — a 15-min 'bad idea brainstorm' can unlock bolder thinking.",
    lowCoach: "Safety before bravery. Make sure the team feels psychologically safe before pushing for bold moves.",
  },
  {
    name: "Speak Fluent Client",
    color: "#EEB1D2",
    highCoach: "The team is client-confident — consider pairing them with a junior member to build that muscle wider.",
    midCoach: "Run a quick 'client empathy' exercise: what does our client worry about at 2am?",
    lowCoach: "Focus on listening over presenting — schedule a client listening session with no agenda.",
  },
  {
    name: "Work Out Loud",
    color: "#2E7354",
    highCoach: "Great visibility — encourage the team to document a win publicly this week.",
    midCoach: "Start stand-ups with 'what did you share externally this week?' to normalise working out loud.",
    lowCoach: "Visibility may feel risky when energy is low. Celebrate imperfect sharing to reduce fear of judgment.",
  },
  {
    name: "Enjoy the Ride",
    color: "#EA5B32",
    highCoach: "Joy is high — protect it. Ask what's creating it and do more of that intentionally.",
    midCoach: "Add one moment of delight to the team's week — a small surprise, a shared laugh, a win worth marking.",
    lowCoach: "Something is draining the fun. A candid team retro focused on energy, not output, is worth the time.",
  },
];

function coachingForScore(score: number, markerIdx: number) {
  const m = MARKERS[markerIdx % MARKERS.length];
  if (score >= 7.5) return { marker: m.name, color: m.color, idea: m.highCoach };
  if (score >= 5) return { marker: m.name, color: m.color, idea: m.midCoach };
  return { marker: m.name, color: m.color, idea: m.lowCoach };
}

function TeamCoaching({ byTeam, fallbackByTeam }: { byTeam: Record<string, number>; fallbackByTeam: Record<string, number> }) {
  const teams = Object.entries(Object.keys(byTeam).length ? byTeam : fallbackByTeam).sort((a, b) => b[1] - a[1]);
  if (!teams.length) return null;

  return (
    <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)", marginBottom: 8 }}>
      <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>FEELING BY TEAM + COACHING NUDGE</div>
      <div style={{ fontSize: 13, color: "#BBBBB5", marginBottom: 20 }}>Based on markers of excellence · scores 1–10</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {teams.map(([team, score], i) => {
          const coaching = coachingForScore(score, i);
          return (
            <div key={team} style={{ borderLeft: `3px solid ${pulseColor(score)}`, paddingLeft: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#131313" }}>{team}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: pulseColor(score) }}>{score}</span>
              </div>
              <MiniBar value={score} max={10} color={pulseColor(score)} height={3} />
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: coaching.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{coaching.marker}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>{coaching.idea}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const VALUES = [
  { label: "WE CARE FOR EACH OTHER", key: "care", color: "#EEB1D2" },
  { label: "WE DO GOOD WORK", key: "work", color: "#2E7354" },
  { label: "WE LOOK FOR MAGIC", key: "magic", color: "#EDC157" },
  { label: "WE SPARK JOY", key: "joy", color: "#3565E3" },
];

interface CycleSummaryProps {
  feeling: number;
  gptw: number;
  balance: number;
  proudPct?: number;
  byTeam?: Record<string, number>;
  participation: number;
}

function CycleSummary({ feeling, gptw, balance, proudPct, byTeam, participation }: CycleSummaryProps) {
  const topTeam = byTeam ? Object.entries(byTeam).sort((a, b) => b[1] - a[1])[0] : null;
  const lowTeam = byTeam ? Object.entries(byTeam).sort((a, b) => a[1] - b[1])[0] : null;
  const needsAttention = lowTeam && lowTeam[1] < 6;

  const insights: { text: string; color: string }[] = [
    feeling >= 7
      ? { text: `Team feeling strong at ${feeling}/10 — energy is high this cycle.`, color: "#2E7354" }
      : feeling >= 5
      ? { text: `Team feeling is steady at ${feeling}/10 — worth watching.`, color: "#EDC157" }
      : { text: `Team feeling at ${feeling}/10 — this cycle needs attention.`, color: "#EA5B32" },

    gptw >= 4.5
      ? { text: `${gptw}/5 GPTW score — the team genuinely loves working here.`, color: "#2E7354" }
      : { text: `GPTW sits at ${gptw}/5 — room to grow on culture.`, color: "#EDC157" },

    proudPct !== undefined
      ? proudPct >= 75
        ? { text: `${proudPct}% feel proud of their contributions — a strong marker of excellence.`, color: "#2E7354" }
        : { text: `${proudPct}% feel proud of their work — keep building recognition.`, color: "#EDC157" }
      : { text: "Contribution pride data loading...", color: "#BBBBB5" },

    balance >= 3.5
      ? { text: `Work–life balance at ${balance}/5 — people feel supported.`, color: "#2E7354" }
      : { text: `Balance at ${balance}/5 — worth checking in on capacity.`, color: "#EDC157" },

    topTeam
      ? { text: `${topTeam[0]} leads team morale at ${topTeam[1]}/10.`, color: "#3565E3" }
      : { text: `${participation}% participation — great signal of trust.`, color: "#3565E3" },

    needsAttention
      ? { text: `${lowTeam![0]} at ${lowTeam![1]}/10 — consider a check-in.`, color: "#EA5B32" }
      : { text: "No teams showing critical morale flags this cycle.", color: "#2E7354" },
  ];

  return (
    <div style={{ background: "#131313", padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)", height: "100%" }}>
      <div style={{ fontSize: 11, color: "#607D85", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>CYCLE SUMMARY</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {VALUES.map((v) => (
          <div key={v.key} style={{ fontSize: 9, color: v.color, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${v.color}`, paddingBottom: 1 }}>{v.label}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: ins.color, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color: "#C8C8C4", lineHeight: 1.5 }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PulseViewProps {
  pulseData?: PulseApiData | null;
  role?: string;
}

export default function PulseView({ pulseData, role }: PulseViewProps) {
  const chartH = 70, chartW = 260, padX = 20;

  const trendData = PULSE_DATA.trend.slice(-3);

  const pts = (key: "stress" | "fulfillment" | "joy") =>
    trendData.map((d, i) => {
      const x = padX + (i / (trendData.length - 1)) * chartW;
      const y = chartH - (d[key] / 10) * chartH;
      return `${x},${y}`;
    }).join(" ");

  // Live KPI values (fall back to mock)
  const feeling = pulseData?.avgFeeling ?? PULSE_DATA.current.fulfillment;
  const stressSource = pulseData?.avgStressSource ?? PULSE_DATA.current.stress;
  const balance = pulseData?.avgBalance ?? PULSE_DATA.current.balance;
  const gptw = pulseData?.avgGptw ?? PULSE_DATA.current.recognition;
  const participation = pulseData?.participation ?? PULSE_DATA.participation;
  const isLive = !!pulseData;

  const kpis = [
    { label: "STRESS", val: feeling, prev: PULSE_DATA.prev.fulfillment, invert: true, max: 10, unit: "/10", note: "1 = low stress · 10 = high stress" },
    { label: "STRESS SOURCE", val: stressSource, prev: PULSE_DATA.prev.stress, invert: true, max: 10, unit: "/10", note: "1 = mostly work · 10 = mostly life" },
    { label: "WORK–LIFE BALANCE", val: balance, prev: PULSE_DATA.prev.balance, invert: false, max: 5, unit: "/5" },
    { label: "GREAT PLACE TO WORK", val: gptw, prev: PULSE_DATA.prev.recognition, invert: false, max: 5, unit: "/5" },
  ];

  const TEAM_CANONICAL: Record<string, string> = {
    "web pod": "Web Pod", "web": "Web Pod",
    "strategy": "Strategy",
    "projects": "Projects", "project management": "Projects", "project mgmt": "Projects", "pm": "Projects",
    "accounts": "Accounts", "account": "Accounts",
    "creative": "Creative",
    "admin": "Admin", "administration": "Admin", "ops": "Admin", "operations": "Admin",
    "pod 1": "Pod 1", "pod1": "Pod 1",
    "pod 2": "Pod 2", "pod2": "Pod 2",
    "brand pod": "Brand Pod", "brand": "Brand Pod",
  };
  const ALLOWED_TEAMS = ["Web Pod", "Strategy", "Projects", "Accounts", "Creative", "Admin", "Pod 1", "Pod 2", "Brand Pod"];

  // Normalize + merge team scores from live data
  const normalizedByTeam: Record<string, number[]> = {};
  Object.entries(pulseData?.byTeam ?? {}).forEach(([raw, score]) => {
    const canonical = TEAM_CANONICAL[raw.toLowerCase().trim()];
    if (canonical) {
      normalizedByTeam[canonical] = normalizedByTeam[canonical] ?? [];
      normalizedByTeam[canonical].push(score);
    }
  });
  const cleanByTeam = Object.fromEntries(
    ALLOWED_TEAMS
      .filter((t) => normalizedByTeam[t])
      .map((t) => [t, Math.round((normalizedByTeam[t].reduce((a, b) => a + b, 0) / normalizedByTeam[t].length) * 10) / 10])
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {/* Row 1: KPI cards */}
        {kpis.map((m, i) => {
          const d = delta(m.val, m.prev);
          const good = m.invert ? !d.pos : d.pos;
          return (
            <div key={i} style={{ background: "#FFFFFF", padding: "20px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#131313", lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 16, color: "#BBBBB5" }}>{m.unit}</div>
              </div>
              {m.note && <div style={{ fontSize: 12, color: "#BBBBB5", marginTop: 4 }}>{m.note}</div>}
              {isLive
                ? <div style={{ fontSize: 13, marginTop: 6, color: "#607D85" }}>{pulseData!.responseCount} responses</div>
                : <div style={{ fontSize: 14, marginTop: 6, color: good ? "#2E7354" : "#EA5B32" }}>{d.dir} {d.val} vs last month</div>
              }
            </div>
          );
        })}

        {/* Row 2: Participation (col 1) + Trend (col 2) + Summary (cols 3–4) */}
        <div style={{ background: "#FFFFFF", padding: "12px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>PARTICIPATION</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: participation >= 80 ? "#2E7354" : "#EDC157", lineHeight: 1 }}>{participation}%</div>
          <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 6 }}>of team responded</div>
          <MiniBar value={participation} max={100} color={participation >= 80 ? "#2E7354" : "#EDC157"} height={3} />
        </div>

        <div style={{ gridColumn: "span 2", background: "#FFFFFF", padding: "12px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>3-MONTH TREND</div>
          <svg width="100%" viewBox={`0 0 ${chartW + padX * 2} ${chartH + 32}`}>
            {/* Y-axis gridlines */}
            {[2, 4, 6, 8, 10].map((v) => {
              const y = chartH - (v / 10) * chartH;
              return (
                <g key={v}>
                  <line x1={padX} x2={padX + chartW} y1={y} y2={y} stroke="#E8E8E5" strokeWidth={0.5} />
                  <text x={padX - 4} y={y + 3} fill="#BBBBB5" fontSize={7} textAnchor="end" fontFamily="inherit">{v}</text>
                </g>
              );
            })}
            {/* X-axis baseline */}
            <line x1={padX} x2={padX + chartW} y1={chartH} y2={chartH} stroke="#D8D8D4" strokeWidth={1} />
            <polyline points={pts("stress")} fill="none" stroke="#EA5B32" strokeWidth={2} strokeLinejoin="round" />
            {trendData.map((d, i) => {
              const x = padX + (i / (trendData.length - 1)) * chartW;
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={chartH} y2={chartH + 4} stroke="#D8D8D4" strokeWidth={1} />
                  <text x={x} y={chartH + 14} fill="#555" fontSize={9} textAnchor="middle" fontFamily="inherit">{d.month}</text>
                </g>
              );
            })}
            <text x={padX + chartW / 2} y={chartH + 28} fill="#BBBBB5" fontSize={8} textAnchor="middle" fontFamily="inherit" letterSpacing="0.05em">SCALE 1–10</text>
          </svg>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 2, background: "#EA5B32", borderRadius: 1 }} />
              <span style={{ fontSize: 11, color: "#7A7A7A", textTransform: "uppercase", letterSpacing: "0.04em" }}>Stress</span>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: "span 1" }}>
          <CycleSummary feeling={feeling} gptw={gptw} balance={balance} proudPct={pulseData?.proudPct} byTeam={cleanByTeam} participation={participation} />
        </div>
      </div>

      {(role === "coach" || role === "leadership") && (
        <TeamCoaching byTeam={cleanByTeam} fallbackByTeam={pulseData ? {} : Object.fromEntries(PULSE_DATA.byValue.map((v) => [v.value, v.score]))} />
      )}

      {(role === "coach" || role === "leadership") && (pulseData?.stressors?.length || pulseData?.supportNeeds?.length) && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <OpenTextPanel
              title="IF MOSTLY WORK STRESS — WHAT'S UP?"
              responses={pulseData?.stressors ?? []}
              accentColor="#EA5B32"
            />
            <OpenTextPanel
              title="HOW CAN WE SUPPORT YOU BETTER?"
              responses={pulseData?.supportNeeds ?? []}
              accentColor="#3565E3"
            />
          </div>
          {role === "leadership" && (
            <LeadershipFramework stressors={pulseData?.stressors ?? []} supportNeeds={pulseData?.supportNeeds ?? []} />
          )}
        </>
      )}
    </div>
  );
}
