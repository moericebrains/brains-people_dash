"use client";

interface MiniBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export default function MiniBar({ value, max = 10, color = "#EA5B32", height = 4 }: MiniBarProps) {
  return (
    <div style={{ background: "#EBEBEB", height, width: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, height: "100%",
        width: `${(value / max) * 100}%`,
        background: color,
        transition: "width 1s ease",
      }} />
    </div>
  );
}
