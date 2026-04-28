"use client";

import type { OnaNode, HarvestData, Role } from "@/lib/types";
import { stressColor } from "@/lib/utils";
import Tag from "@/components/ui/Tag";

interface StressViewProps {
  onaNodes?: OnaNode[];
  onaAlerts?: Array<{ type: string; message: string }>;
  harvestData: HarvestData;
  role?: Role;
  dateRange?: { from: string; to: string } | null;
}

// ── Target-band bar ─────────────────────────────────────────────────────────────
function TargetBar({ pct, danger }: { pct: number; danger?: boolean }) {
  return (
    <div style={{ position: "relative", height: 8, background: "rgba(19,19,19,.06)", borderRadius: 2 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: danger ? "var(--bof-orange)" : "var(--bof-green)", borderRadius: 2 }} />
      {/* dashed bracket at 75–80% target band */}
      <div style={{
        position: "absolute", top: -3, bottom: -3,
        left: "75%", width: "5%",
        border: "1.5px dashed rgba(19,19,19,.40)",
        borderLeft: "1.5px dashed rgba(19,19,19,.40)",
        borderRight: "1.5px dashed rgba(19,19,19,.40)",
        borderTop: "none",
        borderBottom: "none",
      }} />
    </div>
  );
}

export default function StressView({ onaNodes = [], harvestData, role = "ic" }: StressViewProps) {
  const { orgAvg, teams } = harvestData;
  const burnoutCount = teams.filter((t) => t.burnoutRisk).length;

  // ONA story-sort
  const ONA_GROUPS = [
    { key: "bridge",   label: "Bridges — high-traffic connectors",  color: "var(--bof-yellow)",     bg: "rgba(237,193,87,.12)",  textDark: true  },
    { key: "healthy",  label: "Healthy connection",                  color: "var(--bof-green)",      bg: "rgba(46,115,84,.08)",   textDark: false },
    { key: "isolated", label: "Isolated — low cross-team contact",   color: "var(--bof-orange)",     bg: "rgba(234,91,50,.08)",   textDark: false },
    { key: "overload", label: "Overload — burnout watch",            color: "var(--bof-orange-deep)", bg: "rgba(234,91,50,.16)", textDark: false },
  ];

  // Derive ONA group from node boolean flags + centrality score
  type OnaGroup = "bridge" | "healthy" | "isolated" | "overload";
  const onaGrouped: Record<OnaGroup, { name: string; n: number }[]> = { bridge: [], healthy: [], isolated: [], overload: [] };
  onaNodes.forEach((node) => {
    const pct = Math.round(node.centrality * 100);
    const group: OnaGroup = node.overload ? "overload" : node.bridge ? "bridge" : node.isolation_risk ? "isolated" : "healthy";
    onaGrouped[group].push({ name: node.name, n: pct });
  });

  const hasOna = onaNodes.length > 0;

  return (
    <div>
      {/* ── Top tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { label: "Org avg utilization", val: orgAvg.utilization, unit: "%", sub: "of 40hr week", colorFn: (v: number) => stressColor(v) },
          { label: "Org avg billable", val: orgAvg.billable, unit: "%", sub: "target: 75–80%", colorFn: (v: number) => stressColor(v) },
          { label: "Teams at burnout risk", val: burnoutCount, unit: "", sub: "above 82% billable sustained", colorFn: (v: number) => v > 0 ? "var(--bof-orange)" : "var(--bof-green)" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#FFFFFF", padding: "20px 16px", borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
            <div className="d-eyebrow d-eyebrow--muted">{s.label}</div>
            <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 48, fontWeight: 700, lineHeight: 1, color: s.colorFn(s.val), marginTop: 4 }}>
              {s.val}<span style={{ fontFamily: "var(--font-body-wide)", fontSize: 20, fontWeight: 400, color: "rgba(19,19,19,.45)" }}>{s.unit}</span>
            </div>
            <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Billable utilization by team w/ target-band bars ── */}
      <div style={{ background: "#FFFFFF", padding: "20px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <div className="d-eyebrow">Billable utilization by team</div>
          {harvestData.source === "live" && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--bof-green)", letterSpacing: ".10em", textTransform: "uppercase", fontWeight: 700 }}>● Live · Harvest</div>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginBottom: 16 }}>Dashed band = healthy 75–80%</div>
        {teams.map((t, i) => (
          <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < teams.length - 1 ? "1px solid rgba(19,19,19,.08)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 18, fontWeight: 700, color: "#131313" }}>{t.name}</span>
                <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", marginLeft: 8 }}>{t.members} {t.members === 1 ? "person" : "people"}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag color={t.burnoutRisk ? "var(--bof-orange)" : stressColor(t.billable)}>
                  {t.burnoutRisk ? "Burnout risk" : "Healthy"}
                </Tag>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: t.trend === "up" ? "var(--bof-orange)" : t.trend === "down" ? "var(--bof-green)" : "rgba(19,19,19,.35)" }}>
                  {t.trend === "up" ? "↑ rising" : t.trend === "down" ? "↓ easing" : "→ stable"}
                </span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 6 }}>Utilization {t.utilization}% of 40hrs</div>
                <TargetBar pct={t.utilization} danger={t.utilization > 82} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 6 }}>
                  Billable {t.billable}% <span style={{ color: t.billable > 80 ? "var(--bof-orange)" : "rgba(19,19,19,.30)" }}>target 75–80%</span>
                </div>
                <TargetBar pct={t.billable} danger={t.billable > 80} />
              </div>
            </div>

            {/* Individual breakdown (coach/leadership) */}
            {role !== "ic" && t.individuals && t.individuals.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(19,19,19,.06)" }}>
                {t.individuals.map((ind, j) => (
                  <div key={j} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, fontWeight: 700, color: "#131313" }}>{ind.name}</span>
                    <TargetBar pct={ind.billable} danger={ind.billable > 80} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: ind.billable > 80 ? "var(--bof-orange)" : "rgba(19,19,19,.45)", textAlign: "right" }}>{ind.billable}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── ONA — story-sorted ── */}
      {hasOna && (
        <div style={{ background: "#FFFFFF", padding: "20px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <div className="d-eyebrow">Organizational network analysis</div>
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)" }}>Sorted by status — read left to right like a story</div>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase" }}>{onaNodes.length} of 34 surveyed</div>
          </div>

          {ONA_GROUPS.map((g) => {
            const items = onaGrouped[g.key as OnaGroup] ?? [];
            if (!items.length) return null;
            return (
              <div key={g.key} style={{ background: g.bg, padding: "12px 14px", borderRadius: 4, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: g.color }}>{g.label}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.45)", fontWeight: 700 }}>{items.length} people</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {items.map((p) => (
                    <div key={p.name} style={{ background: "#fff", border: `1.5px solid ${g.color}`, borderRadius: 999, padding: "4px 10px 4px 4px", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body-wide)", fontSize: 12 }}>
                      <span style={{ background: g.color, color: g.textDark ? "#131313" : "#fff", borderRadius: 999, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, padding: "2px 7px" }}>{p.n}</span>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Suggested moves */}
          <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--bof-cream)", borderRadius: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 11, height: 11 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--bof-orange)" }}>Suggested moves</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "var(--font-body-wide)", fontSize: 13.5, lineHeight: 1.7 }}>
              <li>Pair each <b>isolated</b> teammate with a <b>bridge</b> — bridges can host a coffee chat or collaboration session.</li>
              <li>Watch <b>overload</b> signals alongside stress scores on the Stress page.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
