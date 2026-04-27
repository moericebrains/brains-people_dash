"use client";

import { useState } from "react";
import { FLOWERS, TEAM_COLORS, PETAL_COLORS } from "@/lib/constants";
import type { FlowerRecipient, PulseApiData, OnaApiData } from "@/lib/types";
import MiniBar from "@/components/ui/MiniBar";

// ── Celebration word cloud ─────────────────────────────────────────────────────

const CLOUD_COLORS = ["#EA5B32", "#2E7354", "#3565E3", "#EDC157", "#EEB1D2", "#C0DFEC", "#7A5CCC", "#E07B39"];

function CelebrationCloud({ celebrations }: { celebrations: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const counts: Record<string, { display: string; count: number }> = {};
  celebrations.forEach((c) => {
    const key = c.trim().toLowerCase();
    if (!counts[key]) counts[key] = { display: c.trim(), count: 0 };
    counts[key].count++;
  });

  const phrases = Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count);

  const maxCount = Math.max(1, ...phrases.map(([, v]) => v.count));

  const selectedPhrase = selected ? counts[selected] : null;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", lineHeight: 2.2 }}>
        {phrases.map(([key, { display, count }], i) => {
          const size = 13 + Math.round((count / maxCount) * 13);
          const color = CLOUD_COLORS[i % CLOUD_COLORS.length];
          const isSelected = selected === key;
          return (
            <span
              key={key}
              onClick={() => setSelected(isSelected ? null : key)}
              style={{
                fontSize: size,
                fontWeight: count > 1 ? 800 : 500,
                color: isSelected ? "#fff" : color,
                background: isSelected ? color : `${color}18`,
                border: `1.5px solid ${color}`,
                borderRadius: 6,
                padding: "3px 12px",
                cursor: "pointer",
                transition: "all 0.15s",
                userSelect: "none",
                letterSpacing: "-0.01em",
              }}
            >
              {display}
            </span>
          );
        })}
      </div>
      {selectedPhrase && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#F7F7F5", borderLeft: "3px solid #EA5B32", display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#131313", lineHeight: 1 }}>{selectedPhrase.count}</span>
          <span style={{ fontSize: 14, color: "#555" }}>
            {selectedPhrase.count === 1 ? "teammate is" : "teammates are"} proud of <strong>{selectedPhrase.display}</strong> this cycle
          </span>
        </div>
      )}
    </div>
  );
}

// ── Animated SVG flower ────────────────────────────────────────────────────────

interface FlowerSVGProps {
  bloomed: boolean;
  color: string;
}

function FlowerSVG({ bloomed, color }: FlowerSVGProps) {
  return (
    <svg viewBox="0 0 80 130" width="80" height="130" style={{ overflow: "visible" }}>
      {/* Stem */}
      <path
        d="M 40,122 C 37,98 43,78 40,56"
        stroke="#2E2E2E" strokeWidth="1.5" fill="none"
        strokeDasharray="72"
        style={{
          strokeDashoffset: bloomed ? 0 : 72,
          transition: "stroke-dashoffset 0.7s ease",
        }}
      />
      {/* Left leaf */}
      <path
        d="M 40,90 Q 22,78 17,64 Q 30,72 40,85"
        stroke="#2E2E2E" strokeWidth="1" fill="#3A5A2A" fillOpacity="0.5"
        style={{
          transformOrigin: "40px 90px",
          transform: bloomed ? "scale(1)" : "scale(0)",
          transition: "transform 0.45s ease 0.5s",
        }}
      />
      {/* Right leaf */}
      <path
        d="M 40,76 Q 58,64 63,50 Q 50,58 40,71"
        stroke="#2E2E2E" strokeWidth="1" fill="#3A5A2A" fillOpacity="0.5"
        style={{
          transformOrigin: "40px 76px",
          transform: bloomed ? "scale(1)" : "scale(0)",
          transition: "transform 0.45s ease 0.6s",
        }}
      />
      {/* 5 petals rotating around center (40, 56) */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={40} cy={38} rx={9} ry={17}
          fill={color} stroke="#2E2E2E" strokeWidth="0.5"
          style={{
            transformOrigin: "40px 56px",
            transform: `rotate(${angle}deg) scale(${bloomed ? 1 : 0})`,
            opacity: bloomed ? 1 : 0,
            transition: `transform 0.4s ease ${0.8 + i * 0.07}s, opacity 0.3s ease ${0.8 + i * 0.07}s`,
          }}
        />
      ))}
      {/* Center */}
      <circle
        cx={40} cy={56} r={6}
        fill="#EDC157" stroke="#2E2E2E" strokeWidth="0.5"
        style={{
          transformOrigin: "40px 56px",
          transform: bloomed ? "scale(1)" : "scale(0)",
          opacity: bloomed ? 1 : 0,
          transition: "transform 0.3s ease 1.2s, opacity 0.3s ease 1.2s",
        }}
      />
    </svg>
  );
}

interface BigFlowerProps {
  recipient: FlowerRecipient;
  color: string;
  bloomed: boolean;
  onToggle: () => void;
}

function BigFlower({ recipient, color, bloomed, onToggle }: BigFlowerProps) {
  return (
    <div onClick={onToggle} style={{ textAlign: "center", cursor: "pointer", userSelect: "none", padding: "0 8px" }}>
      <div className={bloomed ? "flower-sway" : ""}>
        <FlowerSVG bloomed={bloomed} color={color} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#131313", marginTop: 6, lineHeight: 1.3 }}>
        {recipient.name.split(" ")[0]}
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
        {recipient.n} {recipient.n === 1 ? "flower" : "flowers"}
      </div>
      {!bloomed && (
        <div style={{ fontSize: 11, color: "#BBBBB5", marginTop: 4, letterSpacing: "0.04em" }}>CLICK TO BLOOM</div>
      )}
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
  const [bloomed, setBloomed] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setBloomed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // Flower data: use live (sorted by count) or fall back to mock
  const allFlowers: FlowerRecipient[] = flowers ?? FLOWERS;
  const topFlowers = allFlowers.slice(0, 5);

  // GPTW data
  const avgGptw = pulseData?.avgGptw ?? 4.4;
  const gptwDist = pulseData?.gptwDist ?? { "3": 2, "4": 16, "5": 16 };
  const gptwTotal = Object.values(gptwDist).reduce((a, b) => a + b, 0);
  const gptw4plus = ((gptwDist["4"] ?? 0) + (gptwDist["5"] ?? 0));
  const gptw4plusPct = gptwTotal ? Math.round((gptw4plus / gptwTotal) * 100) : 0;
  const gptwBars = [5, 4, 3, 2, 1]
    .map((s) => ({ stars: `${s}★`, count: gptwDist[String(s)] ?? 0 }))
    .filter((b) => b.count > 0);
  const gptwMax = Math.max(1, ...gptwBars.map((b) => b.count));

  // Proud data
  const proudPct = pulseData?.proudPct ?? 82;
  const proudDist = pulseData?.proudDist ?? { stronglyAgree: 29, agree: 53, neutral: 15, disagree: 3 };
  const proudBars = [
    { label: "Strongly agree", pct: proudDist.stronglyAgree, color: "#2E7354" },
    { label: "Agree", pct: proudDist.agree, color: "#3565E3" },
    { label: "Neutral", pct: proudDist.neutral, color: "#EDC157" },
    { label: "Disagree", pct: proudDist.disagree, color: "#EA5B32" },
  ];

  // Celebrations: live text or mock category counts
  const liveCelebrations = pulseData?.celebrations ?? [];
  const responseCount = pulseData?.responseCount ?? 34;

  // Info flow
  const infoFlowEase = onaData?.infoFlowEase ?? 4.2;
  const onaResponseCount = onaData?.responseCount ?? 19;

  return (
    <div>
      {/* ── Section 1: GPTW + Proud ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {/* GPTW */}
        <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>GREAT PLACE TO WORK</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: "#131313", lineHeight: 1 }}>{avgGptw}</span>
            <span style={{ fontSize: 18, color: "#7A7A7A" }}>/5</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#2E7354", marginLeft: 8 }}>{gptw4plusPct}%</span>
          </div>
          <div style={{ fontSize: 14, color: "#2E7354", fontWeight: 700, marginBottom: 4 }}>rated 4 or 5 stars</div>
          <div style={{ fontSize: 11, color: "#BBBBB5", marginBottom: 20 }}>Avg. American company scores 57% — you&apos;re {gptw4plusPct > 57 ? `${gptw4plusPct - 57}pts above` : gptw4plusPct === 57 ? "right at" : `${57 - gptw4plusPct}pts below`} the national benchmark</div>
          {gptwBars.map((b) => (
            <div key={b.stars} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: "#555" }}>{b.stars}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#131313" }}>{b.count}</span>
              </div>
              <MiniBar value={b.count} max={gptwMax} color={b.count === gptwMax ? "#2E7354" : b.count >= gptwMax / 2 ? "#EDC157" : "#D8D8D4"} height={6} />
            </div>
          ))}
        </div>

        {/* Proud */}
        <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>PROUD OF CONTRIBUTIONS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: "#2E7354", lineHeight: 1 }}>{proudPct}%</span>
            <span style={{ fontSize: 15, color: "#7A7A7A" }}>agree or strongly agree</span>
          </div>
          {proudBars.map((b) => (
            <div key={b.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: "#555" }}>{b.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#131313" }}>{b.pct}%</span>
              </div>
              <MiniBar value={b.pct} max={100} color={b.color} height={6} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: What the Team is Celebrating ── */}
      <div style={{ background: "#FFFFFF", padding: "20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>WHAT THE TEAM IS CELEBRATING</div>
        <div style={{ fontSize: 14, color: "#BBBBB5", marginBottom: 20 }}>n={responseCount} respondents · click a phrase to see how many teammates share it</div>
        {liveCelebrations.length > 0 ? (
          <CelebrationCloud celebrations={liveCelebrations} />
        ) : (
          <div style={{ color: "#BBBBB5", fontSize: 14 }}>No celebration responses this cycle.</div>
        )}
      </div>

      {/* ── Section 3: Information Flow Ease ── */}
      <div style={{ background: "#FFFFFF", padding: "20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>INFORMATION FLOW EASE</div>
        <div style={{ fontSize: 14, color: "#BBBBB5", marginBottom: 16 }}>ONA survey · {onaResponseCount} responses</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#3565E3", lineHeight: 1 }}>{infoFlowEase}</div>
            <div style={{ fontSize: 15, color: "#7A7A7A", marginTop: 4 }}>out of 5</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7A7A7A", marginBottom: 6 }}>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
            <div style={{ height: 12, borderRadius: 6, background: "linear-gradient(to right, #EA5B32, #EDC157, #2E7354)", position: "relative" }}>
              <div style={{
                position: "absolute",
                left: `${((infoFlowEase - 1) / 4) * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 18, height: 18, borderRadius: "50%",
                background: "#FFFFFF", border: "3px solid #3565E3",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }} />
            </div>
            <div style={{ fontSize: 14, color: "#555", marginTop: 10 }}>
              Information flows easily across teams — a strong signal for collaboration health.
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Flowers ── */}
      <div style={{ background: "#FFFFFF", padding: "20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>WHO CARED FOR YOU RECENTLY?</div>
        <div style={{ fontSize: 14, color: "#BBBBB5", marginBottom: 28 }}>Click a flower to make it bloom</div>

        {/* Top 5 animated flowers */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid #E8E8E5" }}>
          {topFlowers.map((f, i) => (
            <BigFlower
              key={f.name}
              recipient={f}
              color={PETAL_COLORS[i % PETAL_COLORS.length]}
              bloomed={bloomed.has(f.name)}
              onToggle={() => toggle(f.name)}
            />
          ))}
        </div>

        {/* All recipient grid */}
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>ALL RECIPIENTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
          {allFlowers.map((f) => {
            const teamColor = TEAM_COLORS[f.team] || "#D8D8D4";
            return (
              <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "#F7F7F5", padding: "10px 12px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: teamColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#131313", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "#7A7A7A" }}>{f.n} {f.n === 1 ? "flower" : "flowers"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
