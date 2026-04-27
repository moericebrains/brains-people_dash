"use client";

import { useState } from "react";
import { ENNEAGRAM_LABELS, STRENGTHS_DOMAINS } from "@/lib/constants";
import { pulseColor, stressColor, mbtiGroup, mbtiColor } from "@/lib/utils";
import type { Person, Role } from "@/lib/types";
import Tag from "./ui/Tag";
import ScoreRing from "./ui/ScoreRing";

interface PersonModalProps {
  person: Person;
  onClose: () => void;
  role: Role;
}

export default function PersonModal({ person, onClose, role }: PersonModalProps) {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const canSeeSensitive = role === "leadership" || role === "coach";
  const hue = person.enneagram * 40;

  const generateNarrative = async () => {
    setLoading(true);
    try {
      const prompt = `Name: ${person.name}
Role: ${person.role}
Pod: ${person.pod}
StrengthsFinder Top 5: ${person.strengths.join(", ")} (domains: ${person.strengthDomains.join(", ")})
Enneagram: Type ${person.enneagram} (${ENNEAGRAM_LABELS[person.enneagram]})
Myers-Briggs: ${person.mbti} (${mbtiGroup(person.mbti)})
Current pulse score: ${person.pulse}/10
Harvest utilization signal: ${person.stress} (low = under 60% billable, medium = 60–82% healthy range, high = over 82% sustained = burnout risk)
Coach: ${person.coach}

Generate the coaching narrative.`;

      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "person", prompt }),
      });
      const data = await res.json() as { text?: string };
      setNarrative(data.text || "Unable to generate narrative.");
    } catch {
      setNarrative("Unable to generate narrative. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", borderTop: "3px solid #FF4500" }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#D8D8D4", border: `2px solid ${pulseColor(person.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#131313" }}>
              {person.avatar}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#131313", letterSpacing: "-0.02em" }}>{person.name}</div>
              <div style={{ fontSize: 14, color: "#7A7A7A", marginTop: 2 }}>{person.role} · {person.pod} · {person.location}</div>
              <div style={{ fontSize: 14, color: "#7A7A7A", marginTop: 2 }}>Coach: {person.coach} · Tenure: {person.tenure}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#7A7A7A", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Personality grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {/* Strengths */}
            <div style={{ background: "#F7F7F5", padding: "14px 12px" }}>
              <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 10 }}>STRENGTHSFINDER</div>
              {person.strengths.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: STRENGTHS_DOMAINS[person.strengthDomains[i]], flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#333", fontWeight: i === 0 ? 800 : 400 }}>{s}</span>
                </div>
              ))}
            </div>
            {/* Enneagram */}
            <div style={{ background: "#F7F7F5", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 8 }}>ENNEAGRAM</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: `hsl(${hue},60%,55%)`, lineHeight: 1 }}>{person.enneagram}</div>
              <div style={{ fontSize: 15, color: "#7A7A7A", marginTop: 4, textAlign: "center" }}>{ENNEAGRAM_LABELS[person.enneagram]}</div>
            </div>
            {/* MBTI */}
            <div style={{ background: "#F7F7F5", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderTop: `2px solid ${mbtiColor(person.mbti)}` }}>
              <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 8 }}>MYERS-BRIGGS</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: mbtiColor(person.mbti), lineHeight: 1 }}>{person.mbti}</div>
              <div style={{ fontSize: 14, color: "#7A7A7A", marginTop: 4 }}>{mbtiGroup(person.mbti)}</div>
            </div>
          </div>

          {/* Domain breakdown */}
          <div style={{ background: "#FAFAFA", padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 10 }}>STRENGTH DOMAINS</div>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(STRENGTHS_DOMAINS).map(([domain, color]) => {
                const count = person.strengthDomains.filter((d) => d === domain).length;
                return count > 0 ? (
                  <div key={domain} style={{ flex: count, background: color, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#131313" }}>{count}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{domain.slice(0, 3).toUpperCase()}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Pulse + stress (gated) */}
          {canSeeSensitive && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: "#FAFAFA", padding: "14px", display: "flex", alignItems: "center", gap: 16 }}>
                <ScoreRing value={person.pulse} size={60} label="Pulse" />
                <div>
                  <div style={{ fontSize: 11, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 4 }}>PULSE SCORE</div>
                  <div style={{ fontSize: 14, color: pulseColor(person.pulse), fontWeight: 700 }}>
                    {person.pulse >= 7.5 ? "Thriving" : person.pulse >= 6 ? "Watch" : "Needs attention"}
                  </div>
                </div>
              </div>
              <div style={{ background: "#FAFAFA", padding: "14px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag color={stressColor(person.stress === "high" ? 90 : person.stress === "medium" ? 65 : 40)}>
                    {person.stress.toUpperCase()} STRESS
                  </Tag>
                </div>
                <div style={{ fontSize: 15, color: "#7A7A7A", lineHeight: 1.6 }}>
                  {person.stress === "high"
                    ? "Harvest data shows sustained high billable hours. Review workload before adding scope."
                    : person.stress === "medium"
                    ? "Harvest utilization is within healthy range. No action needed."
                    : "Harvest utilization is healthy. No burnout signals."}
                </div>
              </div>
            </div>
          )}

          {/* AI Coaching Narrative */}
          {canSeeSensitive && (
            <div>
              {narrative ? (
                <div style={{ background: "#EAF4EE", border: "1px solid #C0DCC9", padding: "16px" }}>
                  <div style={{ fontSize: 13, color: "#2E7354", letterSpacing: "0.05em", marginBottom: 10, fontWeight: 700 }}>✦ COACHING NARRATIVE — POWERED BY BRAINS VALUES + PERSONALITY PROFILE</div>
                  <div style={{ fontSize: 16, color: "#7A7A7A", lineHeight: 1.8 }}>{narrative}</div>
                  <button onClick={generateNarrative} style={{ marginTop: 12, background: "transparent", border: "1px solid #C0DCC9", color: "#2E7354", fontSize: 13, letterSpacing: "0.04em", padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>↺ REGENERATE</button>
                </div>
              ) : (
                <button
                  onClick={generateNarrative}
                  disabled={loading}
                  style={{ width: "100%", background: "transparent", border: "1px solid #333", color: "#6B6B6B", fontSize: 14, letterSpacing: "0.05em", textTransform: "uppercase", padding: "14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2E7354"; (e.currentTarget as HTMLButtonElement).style.color = "#2E7354"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#333"; (e.currentTarget as HTMLButtonElement).style.color = "#666"; }}
                >
                  {loading ? "GENERATING COACHING NARRATIVE..." : "✦ GENERATE COACHING NARRATIVE — STRENGTHS + PULSE + STRESS"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
