"use client";

import { STRESS_DATA } from "@/lib/constants";
import { stressColor, stressLabel } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import MiniBar from "@/components/ui/MiniBar";
import type { OnaNode } from "@/lib/types";

interface StressViewProps {
  onaNodes?: OnaNode[];
  onaAlerts?: Array<{ type: string; message: string }>;
}

export default function StressView({ onaNodes = [], onaAlerts = [] }: StressViewProps) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { label: "ORG AVG UTILIZATION", val: STRESS_DATA.orgAvg.utilization, unit: "%", sub: "of 40hr week" },
          { label: "ORG AVG BILLABLE", val: STRESS_DATA.orgAvg.billable, unit: "%", sub: "target: 75–80%" },
          { label: "TEAMS AT BURNOUT RISK", val: STRESS_DATA.teams.filter((t) => t.burnoutRisk).length, unit: "", sub: "above 82% billable sustained" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#FFFFFF", padding: "20px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: i === 2 ? (s.val > 0 ? "#EA5B32" : "#2E7354") : stressColor(s.val as number), lineHeight: 1 }}>
              {s.val}<span style={{ fontSize: 20, fontWeight: 400 }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 14, color: "#7A7A7A", marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#FFFFFF", padding: "20px 20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>STRESS BY TEAM</div>
        {STRESS_DATA.teams.map((t, i) => (
          <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < STRESS_DATA.teams.length - 1 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#131313" }}>{t.name}</span>
                <span style={{ fontSize: 14, color: "#6B6B6B", marginLeft: 8 }}>{t.members} people</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag color={t.burnoutRisk ? "#EA5B32" : stressColor(t.billable)}>
                  {t.burnoutRisk ? "BURNOUT RISK" : stressLabel(t.billable)}
                </Tag>
                <span style={{ fontSize: 15, color: t.trend === "up" ? "#EA5B32" : t.trend === "down" ? "#2E7354" : "#666" }}>
                  {t.trend === "up" ? "↑ rising" : t.trend === "down" ? "↓ easing" : "→ stable"}
                </span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: "#7A7A7A", marginBottom: 4, letterSpacing: "0.04em" }}>UTILIZATION {t.utilization}% <span style={{ color: "#555" }}>of 40hrs</span></div>
                <MiniBar value={t.utilization} max={100} color={stressColor(t.utilization)} height={6} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#7A7A7A", marginBottom: 4, letterSpacing: "0.04em" }}>
                  BILLABLE {t.billable}% <span style={{ color: t.billable > 82 ? "#EA5B32" : t.billable >= 60 ? "#2E7354" : "#EDC157" }}>target 75–80%</span>
                </div>
                <MiniBar value={t.billable} max={100} color={t.billable > 82 ? "#EA5B32" : t.billable >= 60 ? "#2E7354" : "#EDC157"} height={6} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#FFFFFF", padding: "20px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>ORGANIZATIONAL NETWORK ANALYSIS</div>
        <div style={{ fontSize: 15, color: "#7A7A7A", marginBottom: 20 }}>Connection centrality + isolation signals from this cycle&apos;s ONA survey</div>
        <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          {onaNodes.map((n, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 6px",
                background: n.isolation_risk ? "#1a0a0a" : n.bridge ? "#0a1a0a" : "#FFFFFF",
                border: `2px solid ${n.isolation_risk ? "#EA5B32" : n.bridge ? "#2E7354" : "#333"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800,
                color: n.isolation_risk ? "#EA5B32" : n.bridge ? "#2E7354" : "#fff",
              }}>
                {Math.round(n.centrality * 100)}
              </div>
              <div style={{ fontSize: 13, color: "#7A7A7A", maxWidth: 64, textAlign: "center", lineHeight: 1.3 }}>{n.name}</div>
              {n.isolation_risk && <div style={{ fontSize: 11, color: "#EA5B32", marginTop: 2 }}>ISOLATED</div>}
              {n.bridge && <div style={{ fontSize: 11, color: "#2E7354", marginTop: 2 }}>BRIDGE</div>}
              {n.overload && <div style={{ fontSize: 11, color: "#EDC157", marginTop: 2 }}>OVERLOAD</div>}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
          {onaAlerts.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <Tag color={a.type === "isolation" ? "#EA5B32" : "#EDC157"}>{a.type}</Tag>
              <span style={{ fontSize: 15, color: "#7A7A7A", lineHeight: 1.5 }}>{a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
