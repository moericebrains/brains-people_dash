import { MBTI_GROUPS } from "./constants";

export const mbtiGroup = (t: string): string =>
  Object.entries(MBTI_GROUPS).find(([, v]) => v.includes(t))?.[0] || "Unknown";

export const mbtiColor = (t: string): string =>
  ({ Analyst: "#3565E3", Diplomat: "#2E7354", Sentinel: "#EDC157", Explorer: "#EA5B32" })[mbtiGroup(t)] || "#555";

export const stressColor = (v: number): string =>
  v > 82 ? "#EA5B32" : v >= 60 ? "#2E7354" : "#EDC157";

export const stressLabel = (v: number): string =>
  v > 82 ? "BURNOUT RISK" : v >= 60 ? "HEALTHY" : "UNDER";

export const pulseColor = (v: number): string =>
  v >= 7.5 ? "#2E7354" : v >= 6 ? "#EDC157" : "#EA5B32";

export const delta = (curr: number, prev: number) => {
  const d = curr - prev;
  return { val: Math.abs(d).toFixed(1), dir: d >= 0 ? "↑" : "↓", pos: d >= 0 };
};
