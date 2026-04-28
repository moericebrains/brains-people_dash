"use client";

interface MarkerProps {
  variant: "care" | "good" | "magic" | "joy" | "ghost";
  children: React.ReactNode;
}

const VARIANTS = {
  care:  { bg: "#EEB1D2", color: "#131313" },
  good:  { bg: "#2E7354", color: "#F5F5F5" },
  magic: { bg: "#EDC157", color: "#131313" },
  joy:   { bg: "#EA5B32", color: "#F5F5F5" },
  ghost: { bg: "rgba(19,19,19,.06)", color: "#131313" },
};

export default function Marker({ variant, children }: MarkerProps) {
  const { bg, color } = VARIANTS[variant];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: bg,
      color,
      fontFamily: "var(--font-body, 'Barlow Condensed', sans-serif)",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: ".16em",
      textTransform: "uppercase",
      padding: "5px 10px",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sparks/spark-fill-2.svg"
        alt=""
        aria-hidden="true"
        style={{ width: 11, height: 11, filter: color === "#F5F5F5" ? "invert(1)" : "none" }}
      />
      {children}
    </span>
  );
}
