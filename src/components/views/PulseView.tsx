"use client";

import { useState, useEffect } from "react";
import { PULSE_DATA } from "@/lib/constants";
import { pulseColor, delta } from "@/lib/utils";
import MiniBar from "@/components/ui/MiniBar";
import type { PulseApiData } from "@/lib/types";

// ── Option-counting helpers ────────────────────────────────────────────────────

const SUPPORT_OPTIONS = [
  "Assistance Prioritizing Workload",
  "Increased Flexibility",
  "Constructive Feedback",
  "Additional Skills Development",
  "Space for Mental Health Challenges",
  "Other",
];

const STRESS_OPTIONS = [
  "Heavy Workload",
  "Meeting Overload",
  "Lack of Focus Time",
  "Conflicting Deadlines",
  "Learning Curve/New Project",
  "Communication Challenges",
  "My Own Self-Imposed Pressure",
  "Work/Life Balance Challenges",
  "Other",
];

function countOptions(responses: string[], options: string[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  options.forEach((o) => { counts[o] = 0; });
  responses.forEach((r) => {
    r.split(",").map((s) => s.trim()).forEach((item) => {
      const match = options.find((o) => o.toLowerCase() === item.toLowerCase());
      if (match) counts[match]++;
      else if (item) counts["Other"] = (counts["Other"] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

const countStressOptions = (r: string[]) => countOptions(r, STRESS_OPTIONS);
const countSupportOptions = (r: string[]) => countOptions(r, SUPPORT_OPTIONS);

// ── Participation donut ─────────────────────────────────────────────────────────

function ParticipationPie({ responded, total }: { responded: number; total: number }) {
  const pct = Math.min(1, responded / Math.max(1, total));
  const r = 54, cx = 70, cy = 70, stroke = 12;
  const circumference = 2 * Math.PI * r;
  const filled = pct * circumference;
  const color = pct >= 0.8 ? "var(--bof-green)" : "var(--bof-yellow)";
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(19,19,19,.08)" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{Math.round(pct * 100)}%</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", marginTop: 3 }}>{responded}/{total}</div>
      </div>
    </div>
  );
}

// ── Stressors + support panels ─────────────────────────────────────────────────

function StressorsPanel({ responses }: { responses: string[] }) {
  const options = countStressOptions(responses);
  const maxCount = options[0]?.count ?? 1;
  return (
    <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
      <div className="d-eyebrow d-eyebrow--muted">If mostly work stress — what&apos;s up?</div>
      <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginBottom: 14 }}>{responses.length} responses · anonymous</div>
      {options.length === 0 ? (
        <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, color: "rgba(19,19,19,.45)" }}>No responses this cycle.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map(({ label, count }) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(19,19,19,.06)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                <MiniBar value={count} max={maxCount} color="var(--bof-orange)" height={4} />
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--bof-orange)" }}>{count}×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportPanel({ responses }: { responses: string[] }) {
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const options = countSupportOptions(responses);
  const maxCount = options[0]?.count ?? 1;

  useEffect(() => {
    if (!options.length || teamMessage) return;
    fetch("/api/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "action",
        prompt: `Based on these support needs from our team's pulse survey, write a warm, direct 3-4 sentence message addressed to the full Brains team about how we can show up for each other better this cycle. Speak as "we" — not leadership talking down, but the team talking to itself. Ground it in our value "We Care for Each Other" but make it feel human and specific.\n\nSupport needs selected:\n${options.map((o) => `- ${o.label}: ${o.count} people`).join("\n")}`,
      }),
    })
      .then((r) => r.json())
      .then((d: { text: string }) => setTeamMessage(d.text ?? null))
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses.length]);

  return (
    <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
      <div className="d-eyebrow d-eyebrow--muted">How can we support you better?</div>
      <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginBottom: 14 }}>{responses.length} responses · anonymous</div>
      {options.length === 0 ? (
        <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, color: "rgba(19,19,19,.45)" }}>No responses this cycle.</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {options.map(({ label, count }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(19,19,19,.06)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <MiniBar value={count} max={maxCount} color="var(--bof-blue)" height={4} />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--bof-blue)" }}>{count}×</span>
              </div>
            ))}
          </div>
          {teamMessage ? (
            <div style={{ padding: "12px 14px", background: "var(--bof-cream)", borderRadius: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 11, height: 11 }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--bof-orange)" }}>Team message</span>
              </div>
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, lineHeight: 1.6, color: "#131313" }}>&ldquo;{teamMessage}&rdquo;</div>
            </div>
          ) : (
            <div style={{ background: "rgba(19,19,19,.04)", padding: "10px 12px", borderRadius: 4, fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)" }}>Generating team message…</div>
          )}
        </>
      )}
    </div>
  );
}

// ── Leadership framework ────────────────────────────────────────────────────────

function LeadershipFramework({ stressors, supportNeeds }: { stressors: string[]; supportNeeds: string[] }) {
  const [framework, setFramework] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Work stress signals from the team:\n${stressors.map((s, i) => `${i + 1}. ${s}`).join("\n") || "(no data)"}\n\nSupport needs expressed:\n${supportNeeds.map((s, i) => `${i + 1}. ${s}`).join("\n") || "(no data)"}`;
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "framework", prompt }),
      });
      if (!res.ok) { setError(`API error ${res.status}`); return; }
      const data = await res.json() as { text?: string; error?: string };
      if (data.error) { setError(data.error); return; }
      setFramework(data.text ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bof-off-black)", padding: "20px", marginBottom: 8, borderRadius: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: framework ? 16 : 0 }}>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,245,.55)" }}>Leadership framework</div>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(245,245,245,.35)", marginTop: 2 }}>Generated from this cycle&apos;s signals · rooted in markers of excellence</div>
        </div>
        <button onClick={generate} disabled={loading} style={{ background: loading ? "rgba(255,255,255,.1)" : "var(--bof-orange)", color: "#fff", border: "none", padding: "10px 18px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", borderRadius: 3, opacity: loading ? .7 : 1 }}>
          {loading ? "Sparking…" : "Click for Sparks"}
        </button>
      </div>
      {error && <div style={{ marginTop: 12, fontFamily: "var(--font-body-wide)", fontSize: 13, color: "var(--bof-orange)" }}>Error: {error}</div>}
      {framework && (
        <div style={{ borderTop: "1px solid rgba(245,245,245,.10)", paddingTop: 16 }}>
          {framework.split("\n").filter(Boolean).map((line, i) => (
            <div key={i} style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, color: line.match(/^[A-Z].*:$/) ? "var(--bof-yellow)" : "rgba(245,245,245,.85)", lineHeight: 1.7, fontWeight: line.match(/^[A-Z].*:$/) ? 700 : 400, marginTop: line.match(/^[A-Z].*:$/) ? 14 : 0 }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team coaching nudges ────────────────────────────────────────────────────────

const MARKERS = [
  { name: "Pivot with Purpose", color: "var(--bof-blue)",
    high: "[Team] is moving fast and adapting well — pull them in when you need to shift direction.",
    mid: "[Team] is finding their footing — share context early so they can flex with you, not react to change.",
    low: "[Team] may be feeling scattered — give them clear asks and stable timelines right now." },
  { name: "Brave Ideas, Bold Action", color: "var(--bof-yellow)",
    high: "[Team] is in bold mode — bring them your half-baked ideas. They'll push them somewhere great.",
    mid: "[Team] is warming up — ask them 'what would you try if it couldn't fail?' in your next collab.",
    low: "[Team] needs psychological safety right now — celebrate their ideas loudly, even the small ones." },
  { name: "Speak Fluent Client", color: "var(--bof-pink)",
    high: "[Team] is client-sharp — loop them in on client conversations where fresh perspective helps.",
    mid: "[Team] is steady — share client feedback with them directly so they stay close to the why.",
    low: "[Team] may feel disconnected — share client stories with them, not just deliverables." },
  { name: "Work Out Loud", color: "var(--bof-green)",
    high: "[Team] is sharing openly — follow their lead. Cross-pollination builds better work.",
    mid: "[Team] is showing up — invite them to your stand-up or share your work-in-progress with them this week.",
    low: "[Team] may be heads-down — a genuine 'what are you working on?' goes a long way right now." },
  { name: "Enjoy the Ride", color: "var(--bof-orange)",
    high: "[Team] is full of energy — plan something fun with them this cycle. Their joy is contagious.",
    mid: "[Team] is steady — find one moment to mark something together. Recognition doesn't have to be big.",
    low: "[Team] might need a lift — send a note of appreciation or acknowledge their work publicly this week." },
];

function nudgeForScore(score: number, team: string, markerIdx: number) {
  const m = MARKERS[markerIdx % MARKERS.length];
  const idea = score >= 7.5 ? m.high : score >= 5 ? m.mid : m.low;
  return { marker: m.name, color: m.color, idea: idea.replace(/\[Team\]/g, team) };
}

function TeamCoaching({ byTeam, fallbackByTeam }: { byTeam: Record<string, number>; fallbackByTeam: Record<string, number> }) {
  const teams = Object.entries(Object.keys(byTeam).length ? byTeam : fallbackByTeam).sort((a, b) => b[1] - a[1]);
  if (!teams.length) return null;

  return (
    <div style={{ background: "#FFFFFF", padding: "20px 22px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <div className="d-eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 14, height: 14, verticalAlign: "-2px" }} />
            How to show up for each other
          </div>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.55)" }}>Team nudges · rooted in markers of excellence</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "1px solid rgba(19,19,19,.10)" }}>
        {teams.map(([team, score], i) => {
          const nudge = nudgeForScore(score, team, i);
          return (
            <div key={team} style={{
              padding: "14px 16px",
              borderRight: i % 3 !== 2 ? "1px solid rgba(19,19,19,.10)" : "none",
              borderBottom: Math.floor(i / 3) < Math.floor((teams.length - 1) / 3) ? "1px solid rgba(19,19,19,.10)" : "none",
              borderTop: `3px solid ${pulseColor(score)}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-body-wide)", fontWeight: 700, fontSize: 16 }}>{team}</span>
                <span style={{ fontFamily: "var(--font-body-wide)", fontWeight: 700, fontSize: 18, color: pulseColor(score) }}>{score}</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: nudge.color, marginBottom: 6 }}>{nudge.marker}</div>
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.65)", lineHeight: 1.5 }}>{nudge.idea}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

interface PulseViewProps {
  pulseData?: PulseApiData | null;
  role?: string;
}

export default function PulseView({ pulseData, role }: PulseViewProps) {
  const chartH = 70, chartW = 260, padX = 20;
  const trendData = pulseData?.trend?.length
    ? pulseData.trend.slice(-3)
    : PULSE_DATA.trend.slice(-3).map((d) => ({ month: d.month, stress: d.stress, feeling: d.fulfillment, balance: 0 }));

  const pts = (key: "stress" | "feeling") =>
    trendData.map((d, i) => {
      const x = padX + (i / (trendData.length - 1)) * chartW;
      const y = chartH - (d[key] / 10) * chartH;
      return `${x},${y}`;
    }).join(" ");

  const feeling = pulseData?.avgFeeling ?? PULSE_DATA.current.fulfillment;
  const stressSource = pulseData?.avgStressSource ?? PULSE_DATA.current.stress;
  const balance = pulseData?.avgBalance ?? PULSE_DATA.current.balance;
  const gptw = pulseData?.avgGptw ?? PULSE_DATA.current.recognition;
  const participation = pulseData?.participation ?? PULSE_DATA.participation;
  const isLive = !!pulseData;

  const prevFeeling = pulseData?.prevCycle?.feeling ?? PULSE_DATA.prev.fulfillment;
  const prevStressSource = pulseData?.prevCycle?.stressSource ?? PULSE_DATA.prev.stress;
  const prevBalance = pulseData?.prevCycle?.balance ?? PULSE_DATA.prev.balance;
  const hasPrev = !!pulseData?.prevCycle;

  const kpis = [
    { label: "Stress", val: feeling, prev: prevFeeling, invert: true, unit: "/10", note: "1 = low stress · 10 = high stress", showPrev: true },
    { label: "Stress source", val: stressSource, prev: prevStressSource, invert: true, unit: "/10", note: "1 = mostly work · 10 = mostly life", showPrev: true },
    { label: "Work–life balance", val: balance, prev: prevBalance, invert: false, unit: "/5", showPrev: true },
    { label: "Great place to work", val: gptw, prev: PULSE_DATA.prev.recognition, invert: false, unit: "/5", showPrev: !isLive },
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

  const responded = pulseData?.responseCount ?? PULSE_DATA.participation;
  const teamSize = pulseData?.teamSize ?? 34;

  const topStressor = countStressOptions(pulseData?.stressors ?? [])[0] ?? null;
  const topSupport = countSupportOptions(pulseData?.supportNeeds ?? [])[0] ?? null;

  // Build editorial cycle summary
  const topTeam = Object.entries(cleanByTeam).sort((a, b) => b[1] - a[1])[0];
  const lowTeam = Object.entries(cleanByTeam).sort((a, b) => a[1] - b[1])[0];
  const cycleSentence = (() => {
    if (feeling >= 7) return `The team is feeling strong at ${feeling}/10 — energy is high this cycle.`;
    if (feeling >= 5) return `The team is feeling steady at ${feeling}/10 — worth watching for shifts.`;
    return `The team is at ${feeling}/10 this cycle — this needs a check-in.`;
  })();

  const cycleAddendum = [
    topTeam && `${topTeam[0]} leads morale at ${topTeam[1]}/10.`,
    lowTeam && lowTeam[1] < 6 && `${lowTeam[0]} is at ${lowTeam[1]}/10 and could use a check-in.`,
    topStressor && `Workload is the loudest signal we're hearing back.`,
  ].filter(Boolean).slice(0, 1).join(" ");

  return (
    <div>

      {/* ── Editorial hero — cycle summary ── */}
      <div style={{ background: "#FFFFFF", padding: "22px 26px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sparks/spark-fill-hero.svg" alt="" style={{ width: 54, height: 48, flexShrink: 0, marginTop: 4 }} />
          <div>
            <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 6 }}>Cycle summary</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 24, lineHeight: 1.22, margin: 0, letterSpacing: ".01em", color: "#131313" }}>
              {cycleSentence}{cycleAddendum ? ` ${cycleAddendum}` : ""}
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
              <span>Stress <b style={{ color: "#131313" }}>{feeling}</b></span>
              <span>GPTW <b style={{ color: "#131313" }}>{gptw}</b></span>
              {pulseData?.proudPct !== undefined && <span>Proud <b style={{ color: "#131313" }}>{pulseData.proudPct}%</b></span>}
              <span>Balance <b style={{ color: "#131313" }}>{balance}</b></span>
              <span>Participation <b style={{ color: "#131313" }}>{Math.round((responded / teamSize) * 100)}%</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── How to show up — promoted hero ── */}
      <TeamCoaching byTeam={cleanByTeam} fallbackByTeam={pulseData ? {} : Object.fromEntries(PULSE_DATA.byValue.map((v) => [v.value, v.score]))} />

      {/* ── KPI tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {kpis.map((m, i) => {
          const d = delta(m.val, m.prev);
          const good = m.invert ? !d.pos : d.pos;
          return (
            <div key={i} style={{ background: "#FFFFFF", padding: "18px 16px", borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
              <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 6 }}>{m.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 44, fontWeight: 700, color: "#131313", lineHeight: 1 }}>{m.val}</span>
                <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 16, color: "rgba(19,19,19,.45)" }}>{m.unit}</span>
              </div>
              {"note" in m && m.note && <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginTop: 4 }}>{m.note as string}</div>}
              {m.showPrev && (isLive ? hasPrev : true)
                ? <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, marginTop: 6, color: good ? "var(--bof-green)" : "var(--bof-orange)" }}>{d.dir} {d.val} vs last</div>
                : isLive && !m.showPrev
                  ? <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, marginTop: 6, color: "rgba(19,19,19,.35)" }}>No prev cycle data</div>
                  : <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, marginTop: 6, color: "rgba(19,19,19,.45)" }}>{pulseData?.responseCount ?? "—"} responses</div>
              }
            </div>
          );
        })}
      </div>

      {/* ── Second row: participation + trend + spotlight ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 8, marginBottom: 8 }}>
        {/* Participation */}
        <div style={{ background: "#FFFFFF", padding: "14px 16px", borderRadius: 4, boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div className="d-eyebrow d-eyebrow--muted" style={{ alignSelf: "flex-start" }}>Participation</div>
          <ParticipationPie responded={responded} total={teamSize} />
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(19,19,19,.45)", letterSpacing: ".10em", textTransform: "uppercase" }}>Pulse survey</div>
        </div>

        {/* 3-month trend */}
        <div style={{ background: "#FFFFFF", padding: "14px 16px", borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
          <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 4 }}>3-month trend</div>
          <svg width="100%" viewBox={`0 0 ${chartW + padX * 2} ${chartH + 24}`}>
            {[2, 4, 6, 8, 10].map((v) => {
              const y = chartH - (v / 10) * chartH;
              return (
                <g key={v}>
                  <line x1={padX} x2={padX + chartW} y1={y} y2={y} stroke="rgba(19,19,19,.06)" strokeWidth={0.5} />
                  <text x={padX - 4} y={y + 3} fill="rgba(19,19,19,.35)" fontSize={6} textAnchor="end" fontFamily="inherit">{v}</text>
                </g>
              );
            })}
            <line x1={padX} x2={padX + chartW} y1={chartH} y2={chartH} stroke="rgba(19,19,19,.15)" strokeWidth={1} />
            <polyline points={pts("stress")} fill="none" stroke="var(--bof-orange)" strokeWidth={2} strokeLinejoin="round" />
            {trendData.map((d, i) => {
              const x = padX + (i / (trendData.length - 1)) * chartW;
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={chartH} y2={chartH + 3} stroke="rgba(19,19,19,.15)" strokeWidth={1} />
                  <text x={x} y={chartH + 11} fill="rgba(19,19,19,.45)" fontSize={7} textAnchor="middle" fontFamily="inherit">{d.month}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <div style={{ width: 14, height: 2, background: "var(--bof-orange)", borderRadius: 1 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(19,19,19,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>Stress</span>
          </div>
        </div>

        {/* Spotlight */}
        <div style={{ background: "#FFFFFF", padding: "16px", borderRadius: 4, boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="d-eyebrow d-eyebrow--muted">If mostly work stress — what&apos;s up?</div>
            {topStressor ? (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 18, color: "var(--bof-orange)", lineHeight: 1.2, marginBottom: 4, marginTop: 4 }}>{topStressor.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)" }}>{topStressor.count} responses flagged this</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", marginTop: 4 }}>No data yet</div>
            )}
          </div>
          <div style={{ borderTop: "1px solid rgba(19,19,19,.08)", paddingTop: 14 }}>
            <div className="d-eyebrow d-eyebrow--muted">#1 support need</div>
            {topSupport ? (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 18, color: "var(--bof-blue)", lineHeight: 1.2, marginBottom: 4, marginTop: 4 }}>{topSupport.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)" }}>{topSupport.count} responses flagged this</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", marginTop: 4 }}>No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Visibility strip ── */}
      <div style={{ background: "var(--bof-off-black)", padding: "14px 18px", marginBottom: 8, borderRadius: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="d-eyebrow d-eyebrow--inverse" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sparks/spark-fill-2.svg" alt="" style={{ width: 12, height: 12, filter: "invert(1)", opacity: .7 }} />
            What each role sees
          </div>
          <div style={{ display: "flex", gap: 20, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(245,245,245,.45)", fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", flexWrap: "wrap" }}>
            <span><span style={{ color: "rgba(245,245,245,.85)" }}>Everyone:</span> aggregate scores · pod nudges</span>
            <span><span style={{ color: "rgba(245,245,245,.85)" }}>+ Coaches:</span> flagged ICs · 1:1 prompts</span>
            <span><span style={{ color: "rgba(245,245,245,.85)" }}>+ Leadership:</span> per-person stress · watchlist</span>
          </div>
        </div>
      </div>

      {/* ── Expanded data (coach/leadership gated) ── */}
      {(role === "coach" || role === "leadership") && (pulseData?.stressors?.length || pulseData?.supportNeeds?.length) ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <StressorsPanel responses={pulseData?.stressors ?? []} />
            <SupportPanel responses={pulseData?.supportNeeds ?? []} />
          </div>
          {role === "leadership" && (
            <LeadershipFramework stressors={pulseData?.stressors ?? []} supportNeeds={pulseData?.supportNeeds ?? []} />
          )}
        </>
      ) : null}
    </div>
  );
}
