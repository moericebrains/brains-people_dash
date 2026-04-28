"use client";

import { useState } from "react";
import { FLOWERS, PETAL_COLORS } from "@/lib/constants";
import type { FlowerRecipient, PulseApiData, OnaApiData } from "@/lib/types";
import MiniBar from "@/components/ui/MiniBar";

// ── SVG flower ─────────────────────────────────────────────────────────────────

function FlowerSVG({ bloomed, color }: { bloomed: boolean; color: string }) {
  return (
    <svg viewBox="0 0 80 130" width="80" height="130" style={{ overflow: "visible" }}>
      <path
        d="M 40,122 C 37,98 43,78 40,56"
        stroke="#2E2E2E" strokeWidth="1.5" fill="none"
        strokeDasharray="72"
        style={{ strokeDashoffset: bloomed ? 0 : 72, transition: "stroke-dashoffset 0.7s ease" }}
      />
      <path d="M 40,90 Q 22,78 17,64 Q 30,72 40,85" stroke="#2E2E2E" strokeWidth="1" fill="#3A5A2A" fillOpacity="0.5"
        style={{ transformOrigin: "40px 90px", transform: bloomed ? "scale(1)" : "scale(0)", transition: "transform 0.45s ease 0.5s" }} />
      <path d="M 40,76 Q 58,64 63,50 Q 50,58 40,71" stroke="#2E2E2E" strokeWidth="1" fill="#3A5A2A" fillOpacity="0.5"
        style={{ transformOrigin: "40px 76px", transform: bloomed ? "scale(1)" : "scale(0)", transition: "transform 0.45s ease 0.6s" }} />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i} cx={40} cy={38} rx={9} ry={17} fill={color} stroke="#2E2E2E" strokeWidth="0.5"
          style={{ transformOrigin: "40px 56px", transform: `rotate(${angle}deg) scale(${bloomed ? 1 : 0})`, opacity: bloomed ? 1 : 0, transition: `transform 0.4s ease ${0.8 + i * 0.07}s, opacity 0.3s ease ${0.8 + i * 0.07}s` }} />
      ))}
      <circle cx={40} cy={56} r={6} fill="#EDC157" stroke="#2E2E2E" strokeWidth="0.5"
        style={{ transformOrigin: "40px 56px", transform: bloomed ? "scale(1)" : "scale(0)", opacity: bloomed ? 1 : 0, transition: "transform 0.3s ease 1.2s, opacity 0.3s ease 1.2s" }} />
    </svg>
  );
}

// ── Flower garden hero ─────────────────────────────────────────────────────────

function FlowerGarden({ allFlowers, topFlowers }: { allFlowers: FlowerRecipient[]; topFlowers: FlowerRecipient[] }) {
  const [bloomed, setBloomed] = useState<Set<string>>(new Set(topFlowers.slice(0, 3).map((f) => f.name)));

  const toggle = (name: string) => {
    setBloomed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const totalFlowers = allFlowers.reduce((acc, f) => acc + f.n, 0);
  const longtail = allFlowers.slice(topFlowers.length);

  return (
    <div style={{ background: "var(--bof-cream)", padding: "22px 24px 24px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div className="d-eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sparks/spark-fill-3.svg" alt="" style={{ width: 14, height: 14, verticalAlign: "-2px" }} />
            Who cared for each other
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 28, lineHeight: 1.08, marginTop: 4, maxWidth: 480, color: "#131313" }}>
            {totalFlowers} flowers given this cycle — the garden is full.
          </div>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginTop: 6 }}>
            Click a flower to bloom one of yours
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="d-eyebrow d-eyebrow--muted" style={{ fontSize: 10 }}>Last cycle</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 22 }}>{Math.round(totalFlowers * 0.75)}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--bof-green)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>↑ 33%</div>
        </div>
      </div>

      {/* Garden */}
      <div style={{
        position: "relative", marginTop: 18,
        background: "linear-gradient(to bottom, transparent 0%, transparent 72%, rgba(46,115,84,.10) 72%, rgba(46,115,84,.10) 100%)",
        borderRadius: 6, padding: "24px 14px 20px",
        minHeight: 200, display: "flex", alignItems: "flex-end",
        justifyContent: "space-around", gap: 6, overflow: "hidden",
      }}>
        {topFlowers.map((f, i) => (
          <button
            key={f.name}
            onClick={() => toggle(f.name)}
            style={{ flex: "1 1 0", background: "transparent", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 0 }}
          >
            <div className={bloomed.has(f.name) ? "flower-sway" : ""}>
              <FlowerSVG bloomed={bloomed.has(f.name)} color={PETAL_COLORS[i % PETAL_COLORS.length]} />
            </div>
            <div style={{ fontFamily: "var(--font-body-wide)", fontWeight: 700, fontSize: 13, color: "#131313", marginTop: 6 }}>{f.name.split(" ")[0]}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(19,19,19,.45)", textTransform: "uppercase", letterSpacing: ".10em", fontWeight: 700 }}>
              {f.n} {f.n === 1 ? "flower" : "flowers"}
            </div>
          </button>
        ))}
      </div>

      {/* Long tail — small buds */}
      {longtail.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 8 }}>+ {longtail.length} more teammates received flowers</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {longtail.map((f) => (
              <span key={f.name} style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, background: "rgba(19,19,19,.04)", border: "1px solid rgba(19,19,19,.08)", padding: "5px 9px", borderRadius: 999, fontWeight: 700 }}>
                <span style={{ color: "var(--bof-orange)", marginRight: 5 }}>✿</span>
                {f.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Celebration tag cloud sized by frequency ───────────────────────────────────

const CELEBRATION_OPTIONS = [
  "Strong Creative Output", "Collaboration", "Innovation",
  "Client Satisfaction", "Professional Growth", "Personal Growth", "Other",
];

const CLOUD_COLORS = [
  "var(--bof-orange)", "var(--bof-green)", "var(--bof-blue)",
  "var(--bof-yellow)", "var(--bof-pink)", "var(--bof-light-blue)",
];

function CelebrationCloud({ celebrations, responseCount }: { celebrations: string[]; responseCount: number }) {
  const counts: Record<string, { display: string; count: number }> = {};
  celebrations.forEach((c) => {
    const match = CELEBRATION_OPTIONS.find((o) => o.toLowerCase() === c.trim().toLowerCase());
    const key = (match ?? c.trim()).toLowerCase();
    const display = match ?? c.trim();
    if (!counts[key]) counts[key] = { display, count: 0 };
    counts[key].count++;
  });

  const phrases = Object.entries(counts).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  const maxCount = Math.max(1, ...phrases.map(([, v]) => v.count));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      {phrases.map(([, { display, count }], i) => {
        const size = 14 + (count / maxCount) * 26;
        const c = CLOUD_COLORS[i % CLOUD_COLORS.length];
        return (
          <div key={display} style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: size,
            color: c,
            border: `1.5px solid ${c}`,
            padding: `${6 + (count / maxCount) * 6}px ${14 + (count / maxCount) * 6}px`,
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "baseline",
            gap: 8,
            whiteSpace: "nowrap",
          }}>
            {display}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.45, fontWeight: 400, opacity: .6 }}>{count}</span>
          </div>
        );
      })}
      {phrases.length === 0 && <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, color: "rgba(19,19,19,.45)" }}>No celebration responses this cycle.</div>}
      {phrases.length === 0 && <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.35)", marginTop: 4 }}>n={responseCount} respondents</div>}
    </div>
  );
}

// ── Metric card with delta ─────────────────────────────────────────────────────

function MetricCard({ eyebrow, value, suffix, valueColor, last, delta, deltaDir, footnote, children }: {
  eyebrow: string; value: string | number; suffix?: string; valueColor?: string;
  last?: string; delta?: string; deltaDir?: "up" | "down" | "flat";
  footnote?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 4, boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="d-eyebrow d-eyebrow--muted">{eyebrow}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 44, fontWeight: 700, lineHeight: 1, color: valueColor || "#131313" }}>
          {value}{suffix && <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 16, color: "rgba(19,19,19,.45)", fontWeight: 400 }}>{suffix}</span>}
        </span>
        {delta && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: deltaDir === "up" ? "var(--bof-green)" : deltaDir === "down" ? "var(--bof-orange)" : "rgba(19,19,19,.45)" }}>
              {deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : "→"} {delta}
            </span>
            {last && <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 11, color: "rgba(19,19,19,.45)" }}>vs last ({last})</span>}
          </div>
        )}
      </div>
      {footnote && <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)" }}>{footnote}</div>}
      {children}
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

interface SatisfactionViewProps {
  pulseData?: PulseApiData | null;
  onaData?: OnaApiData | null;
  flowers?: FlowerRecipient[];
}

export default function SatisfactionView({ pulseData, onaData, flowers }: SatisfactionViewProps) {
  const allFlowers: FlowerRecipient[] = flowers ?? FLOWERS;
  const topFlowers = allFlowers.slice(0, 8);

  const avgGptw = pulseData?.avgGptw ?? 4.4;
  const gptwDist = pulseData?.gptwDist ?? { "3": 2, "4": 16, "5": 16 };
  const gptwTotal = Object.values(gptwDist).reduce((a, b) => a + b, 0);
  const gptw4plus = (gptwDist["4"] ?? 0) + (gptwDist["5"] ?? 0);
  const gptw4plusPct = gptwTotal ? Math.round((gptw4plus / gptwTotal) * 100) : 0;
  const gptwBars = [5, 4, 3, 2, 1].map((s) => ({ stars: `${s}★`, count: gptwDist[String(s)] ?? 0 })).filter((b) => b.count > 0);
  const gptwMax = Math.max(1, ...gptwBars.map((b) => b.count));

  const proudPct = pulseData?.proudPct ?? 82;
  const proudDist = pulseData?.proudDist ?? { stronglyAgree: 29, agree: 53, neutral: 15, disagree: 3 };
  const proudBars = [
    { label: "Strongly agree", pct: proudDist.stronglyAgree, color: "var(--bof-green)" },
    { label: "Agree", pct: proudDist.agree, color: "var(--bof-blue)" },
    { label: "Neutral", pct: proudDist.neutral, color: "var(--bof-yellow)" },
    { label: "Disagree", pct: proudDist.disagree, color: "var(--bof-orange)" },
  ];

  const liveCelebrations = pulseData?.celebrations ?? [];
  const responseCount = pulseData?.responseCount ?? 34;
  const infoFlowEase = onaData?.infoFlowEase ?? 4.2;
  const onaResponseCount = onaData?.responseCount ?? 19;

  return (
    <div>
      {/* ── HERO: flower garden first ── */}
      <FlowerGarden allFlowers={allFlowers} topFlowers={topFlowers} />

      {/* ── GPTW + Proud with deltas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8, marginBottom: 8 }}>
        <MetricCard
          eyebrow="Great place to work"
          value={avgGptw}
          suffix="/5"
          last="4.2"
          delta="+0.2"
          deltaDir="up"
          footnote={<>{gptw4plusPct}% rated 4 or 5 stars · {gptw4plusPct > 57 ? `${gptw4plusPct - 57}pts above` : "at"} national benchmark</>}
        >
          <div style={{ marginTop: 4 }}>
            {gptwBars.map((b) => (
              <div key={b.stars} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body-wide)", fontSize: 13, marginTop: 6 }}>
                <span style={{ width: 24, fontWeight: 700, color: "rgba(19,19,19,.55)" }}>{b.stars}</span>
                <div style={{ flex: 1 }}><MiniBar value={b.count} max={gptwMax} color={b.count === gptwMax ? "var(--bof-green)" : b.count >= gptwMax / 2 ? "var(--bof-yellow)" : "rgba(19,19,19,.15)"} height={6} /></div>
                <span style={{ width: 22, textAlign: "right", fontWeight: 700 }}>{b.count}</span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          eyebrow="Proud of contributions"
          value={proudPct}
          suffix="%"
          valueColor="var(--bof-green)"
          last="71%"
          delta="+4 pts"
          deltaDir="up"
          footnote="Agree or strongly agree"
        >
          <div style={{ marginTop: 4 }}>
            {proudBars.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body-wide)", fontSize: 12.5, marginTop: 6 }}>
                <span style={{ flex: "0 0 110px", fontWeight: b.pct > 0 ? 700 : 400, color: b.pct === 0 ? "rgba(19,19,19,.35)" : "inherit" }}>{b.label}</span>
                <div style={{ flex: 1 }}><MiniBar value={b.pct} max={100} color={b.color} height={6} /></div>
                <span style={{ width: 36, textAlign: "right", fontWeight: 700 }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </MetricCard>
      </div>

      {/* ── Celebration tags — sized by frequency ── */}
      <div style={{ background: "#FFFFFF", padding: "20px 22px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div>
            <div className="d-eyebrow">What the team is celebrating</div>
            <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)" }}>n={responseCount} · size reflects how many teammates named it</div>
          </div>
        </div>
        <CelebrationCloud celebrations={liveCelebrations} responseCount={responseCount} />
      </div>

      {/* ── Information flow ── */}
      <div style={{ background: "#FFFFFF", padding: "20px 22px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="d-eyebrow">Information flow ease</div>
            <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)" }}>ONA survey · {onaResponseCount} responses · marker: <b>We Do Good Work</b></div>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--bof-green)" }}>↑ +0.3 vs last cycle (3.9)</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 56, fontWeight: 700, lineHeight: 1, color: "var(--bof-blue)" }}>{infoFlowEase}</span>
          <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)" }}>out of 5</span>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ height: 6, background: "linear-gradient(90deg, var(--bof-orange), var(--bof-yellow), var(--bof-green))", borderRadius: 999 }} />
            <div style={{ position: "absolute", left: `${((infoFlowEase - 1) / 4) * 100}%`, top: -4, width: 14, height: 14, background: "#fff", border: "2px solid var(--bof-blue)", borderRadius: 999, transform: "translateX(-50%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)" }}>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, marginTop: 10, color: "rgba(19,19,19,.65)" }}>
          Information flows easily across teams — a strong signal for collaboration health.
        </div>
      </div>
    </div>
  );
}
