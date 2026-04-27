"use client";

interface TagProps {
  children: React.ReactNode;
  color?: string;
}

export default function Tag({ children, color = "#EA5B32" }: TagProps) {
  return (
    <span style={{
      background: color,
      color: "#131313",
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.04em",
      padding: "2px 8px",
      textTransform: "uppercase",
      fontFamily: "inherit",
    }}>
      {children}
    </span>
  );
}
