"use client";

import { pulseColor } from "@/lib/utils";

interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ value, max = 10, size = 64, label }: ScoreRingProps) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const color = pulseColor(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#D8D8D4" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text
          x={size / 2} y={size / 2} fill="#fff" fontSize={14} fontWeight={800}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontFamily: "inherit" }}
        >
          {value}
        </text>
      </svg>
      {label && (
        <span style={{
          fontSize: 13, color: "#6B6B6B", textTransform: "uppercase",
          letterSpacing: "0.05em", textAlign: "center", maxWidth: size,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
