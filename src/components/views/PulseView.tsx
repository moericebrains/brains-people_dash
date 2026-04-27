"use client";

import { PULSE_DATA } from "@/lib/constants";
import { pulseColor, delta } from "@/lib/utils";
import MiniBar from "@/components/ui/MiniBar";
import type { PulseApiData } from "@/lib/types";

interface PulseViewProps {
  pulseData?: PulseApiData | null;
}

export default function PulseView({ pulseData }: PulseViewProps) {
  const chartH = 80, chartW = 300;

  const pts = (key: "stress" | "fulfillment" | "joy") =>
    PULSE_DATA.trend.map((d, i) => {
      const x = (i / (PULSE_DATA.trend.length - 1)) * chartW;
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
    { label: "FEELING", val: feeling, prev: PULSE_DATA.prev.fulfillment, invert: false, max: 10, unit: "/10" },
    { label: "STRESS SOURCE", val: stressSource, prev: PULSE_DATA.prev.stress, invert: true, max: 10, unit: "/10", note: "1=work · 10=life" },
    { label: "WORK–LIFE BALANCE", val: balance, prev: PULSE_DATA.prev.balance, invert: false, max: 5, unit: "/5" },
    { label: "GREAT PLACE TO WORK", val: gptw, prev: PULSE_DATA.prev.recognition, invert: false, max: 5, unit: "/5" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 8, marginBottom: 8 }}>
        <div style={{ background: "#FFFFFF", padding: "20px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>PARTICIPATION</div>
          <div style={{ fontSize: 58, fontWeight: 900, color: participation >= 80 ? "#2E7354" : "#EDC157", lineHeight: 1 }}>{participation}%</div>
          <div style={{ fontSize: 15, color: "#6B6B6B", marginTop: 8 }}>of team responded this cycle</div>
          <MiniBar value={participation} max={100} color={participation >= 80 ? "#2E7354" : "#EDC157"} height={3} />
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>6-MONTH TREND</div>
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 20}`} style={{ overflow: "visible" }}>
            <polyline points={pts("fulfillment")} fill="none" stroke="#2E7354" strokeWidth={2} strokeLinejoin="round" />
            <polyline points={pts("joy")} fill="none" stroke="#EDC157" strokeWidth={2} strokeLinejoin="round" />
            <polyline points={pts("stress")} fill="none" stroke="#EA5B32" strokeWidth={1.5} strokeDasharray="4,3" strokeLinejoin="round" />
            {PULSE_DATA.trend.map((d, i) => {
              const x = (i / (PULSE_DATA.trend.length - 1)) * chartW;
              return <text key={i} x={x} y={chartH + 16} fill="#444" fontSize={9} textAnchor="middle" fontFamily="inherit">{d.month}</text>;
            })}
          </svg>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[["Fulfillment", "#2E7354"], ["Joy", "#EDC157"], ["Stress (dashed)", "#EA5B32"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 20, height: 2, background: c, borderRadius: 1 }} />
                <span style={{ fontSize: 13, color: "#7A7A7A", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* By Team */}
        {pulseData?.byTeam && Object.keys(pulseData.byTeam).length > 0 ? (
          <div style={{ background: "#FFFFFF", padding: "20px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>FEELING BY TEAM</div>
            {Object.entries(pulseData.byTeam).sort((a, b) => b[1] - a[1]).map(([team, score]) => (
              <div key={team} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 15, color: "#333" }}>{team}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#131313" }}>{score}</span>
                </div>
                <MiniBar value={score} max={10} color={pulseColor(score)} height={3} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", padding: "20px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>PULSE BY VALUE</div>
            {PULSE_DATA.byValue.map((v, i) => {
              const d = delta(v.score, v.prev);
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontSize: 15, color: "#333" }}>{v.value}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#131313" }}>{v.score} <span style={{ fontSize: 13, color: "#2E7354" }}>{d.dir}{d.val}</span></span>
                  </div>
                  <MiniBar value={v.score} color={pulseColor(v.score)} height={3} />
                </div>
              );
            })}
          </div>
        )}
        <div style={{ background: "#FFFFFF", padding: "20px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>PULSE BY MARKER OF EXCELLENCE</div>
          {PULSE_DATA.byMarker.map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: 15, color: "#333" }}>{m.marker}</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#131313" }}>{m.score}</span>
              </div>
              <MiniBar value={m.score} color={pulseColor(m.score)} height={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
