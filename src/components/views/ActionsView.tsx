"use client";

import { useState } from "react";
import { ACTIONS, PEOPLE, ENNEAGRAM_LABELS } from "@/lib/constants";
import { pulseColor, mbtiGroup } from "@/lib/utils";
import type { Person, Role } from "@/lib/types";
import Tag from "@/components/ui/Tag";

interface ActionsViewProps {
  role: Role;
  onSelectPerson: (p: Person) => void;
}

const urgencyColor = (u: string) => u === "high" ? "#EA5B32" : u === "medium" ? "#EDC157" : "#2E7354";

export default function ActionsView({ role, onSelectPerson }: ActionsViewProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const [generated, setGenerated] = useState<Record<number, string>>({});

  const filtered = ACTIONS.filter((a) =>
    role === "leadership" ? true : role === "coach" ? a.audience !== "leadership" : a.audience === "ic"
  );

  const generateNarrative = async (idx: number) => {
    setLoading(idx);
    const action = filtered[idx];
    const relPerson = PEOPLE.find((p) =>
      action.title.includes(p.name.split(" ")[0]) || action.body.includes(p.name.split(" ")[0])
    );

    const personContext = relPerson
      ? `StrengthsFinder top-5: ${relPerson.strengths.join(", ")}, Enneagram ${relPerson.enneagram} (${ENNEAGRAM_LABELS[relPerson.enneagram]}), MBTI ${relPerson.mbti} (${mbtiGroup(relPerson.mbti)})`
      : undefined;

    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "action",
          prompt: `Signal: "${action.title}"\nContext: ${action.body}\nAudience: ${action.audience}\nValue: ${action.value}\n\nWrite the coaching narrative.`,
          personContext,
        }),
      });
      const data = await res.json() as { text?: string };
      setGenerated((g) => ({ ...g, [idx]: data.text || "" }));
    } catch {
      setGenerated((g) => ({ ...g, [idx]: "Unable to generate. Please try again." }));
    }
    setLoading(null);
  };

  return (
    <div>
      <div style={{ background: "#FFFFFF", padding: "16px 20px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase" }}>ACTION CENTER</div>
          <div style={{ fontSize: 15, color: "#7A7A7A", marginTop: 2 }}>
            Showing {filtered.length} actions for {role === "leadership" ? "Leadership" : role === "coach" ? "Coaches" : "Everyone"}
          </div>
        </div>
        <Tag color="#EA5B32">{filtered.filter((a) => a.urgency === "high").length} HIGH PRIORITY</Tag>
      </div>

      {filtered.map((a, i) => {
        const relPerson = PEOPLE.find((p) =>
          a.title.includes(p.name.split(" ")[0]) || a.body.includes(p.name.split(" ")[0])
        );
        return (
          <div key={i} style={{ background: "#FFFFFF", padding: "24px 20px", marginBottom: 1, borderLeft: `3px solid ${urgencyColor(a.urgency)}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Tag color={urgencyColor(a.urgency)}>{a.urgency}</Tag>
              <Tag color="#D8D8D4">{a.value}</Tag>
              <Tag color="#1a1a2e">{a.audience}</Tag>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#131313", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{a.title}</div>
            <div style={{ fontSize: 17, color: "#555", lineHeight: 1.7, marginBottom: 16 }}>{a.body}</div>

            {relPerson && (
              <div
                onClick={() => onSelectPerson(relPerson)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8E8E5", padding: "6px 12px", marginBottom: 14, cursor: "pointer", border: "1px solid #222" }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#D8D8D4", border: `1px solid ${pulseColor(relPerson.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#131313" }}>
                  {relPerson.avatar}
                </div>
                <span style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.04em" }}>VIEW {relPerson.name.toUpperCase()} PROFILE →</span>
              </div>
            )}

            {generated[i] ? (
              <div style={{ background: "#EAF4EE", border: "1px solid #C0DCC9", padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#2E7354", letterSpacing: "0.05em", marginBottom: 8 }}>✦ COACHING NARRATIVE</div>
                <div style={{ fontSize: 17, color: "#555", lineHeight: 1.7 }}>{generated[i]}</div>
              </div>
            ) : (
              <button
                onClick={() => generateNarrative(i)}
                disabled={loading === i}
                style={{ background: "transparent", border: "1px solid #333", color: "#6B6B6B", fontSize: 14, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 14px", cursor: "pointer", marginBottom: 16, fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget).style.borderColor = "#2E7354"; (e.currentTarget).style.color = "#2E7354"; }}
                onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "#333"; (e.currentTarget).style.color = "#666"; }}
              >
                {loading === i ? "GENERATING..." : "✦ GENERATE COACHING NARRATIVE"}
              </button>
            )}

            <div>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 8 }}>SUGGESTED ACTIONS</div>
              {a.actions.map((act, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 4, height: 4, background: "#EA5B32", flexShrink: 0 }} />
                  <span style={{ fontSize: 16, color: "#7A7A7A" }}>{act}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
