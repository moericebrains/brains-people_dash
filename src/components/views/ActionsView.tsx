"use client";

import { useState } from "react";
import { ACTIONS, PEOPLE, ENNEAGRAM_LABELS } from "@/lib/constants";
import { pulseColor, mbtiGroup } from "@/lib/utils";
import type { Person, Role } from "@/lib/types";

interface ActionsViewProps {
  role: Role;
  onSelectPerson: (p: Person) => void;
  dateRange?: { from: string; to: string } | null;
}

// Map action value → marker variant
const VALUE_TO_MARKER: Record<string, { bg: string; color: string; label: string }> = {
  "We Care For Each Other": { bg: "var(--bof-pink)",   color: "#131313", label: "We Care For Each Other" },
  "We Do Good Work":        { bg: "var(--bof-green)",  color: "#F5F5F5", label: "We Do Good Work" },
  "We Look For Magic":      { bg: "var(--bof-yellow)", color: "#131313", label: "We Look For Magic" },
  "We Spark Joy":           { bg: "var(--bof-orange)", color: "#F5F5F5", label: "We Spark Joy" },
};

const PRIORITY_SPINE: Record<string, string> = {
  high:   "var(--bof-orange)",
  medium: "var(--bof-yellow)",
  low:    "var(--bof-green)",
};

// ── Action card v2 ─────────────────────────────────────────────────────────────

interface ActionCardProps {
  action: typeof ACTIONS[0];
  cardIndex: number;
  relPerson?: Person;
  onSelectPerson: (p: Person) => void;
  narrative?: string;
  loading?: boolean;
  onGenerate: () => void;
}

function ActionCardV2({ action, relPerson, onSelectPerson, narrative, loading, onGenerate }: ActionCardProps) {
  const [checked, setChecked] = useState<boolean[]>(action.actions.map(() => false));
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [done, setDone] = useState(false);

  const marker = VALUE_TO_MARKER[action.value] ?? { bg: "rgba(19,19,19,.08)", color: "#131313", label: action.value };
  const spineColor = PRIORITY_SPINE[action.urgency] ?? "var(--bof-green)";

  if (done) return null;
  if (snoozed) return (
    <div style={{ background: "#FFFFFF", borderRadius: 4, padding: "12px 16px", marginBottom: 1, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: .45 }}>
      <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.55)" }}>{action.title} — snoozed</span>
      <button onClick={() => setSnoozed(false)} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.15)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 8px", borderRadius: 3, cursor: "pointer", color: "#131313" }}>Unsnooze</button>
    </div>
  );

  const handleGenerate = () => {
    setNarrativeOpen(true);
    if (!narrative) onGenerate();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "6px 1fr", background: "#FFFFFF", borderRadius: 4, overflow: "hidden", marginBottom: 1, boxShadow: "var(--shadow-sm)" }}>
      {/* Priority spine */}
      <div style={{ background: spineColor }} title={`${action.urgency} priority`} />

      <div style={{ padding: "18px 20px 20px" }}>
        {/* Header row: marker + priority label + ghost buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: marker.bg, color: marker.color,
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
              letterSpacing: ".16em", textTransform: "uppercase",
              padding: "5px 10px", borderRadius: 999,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sparks/spark-fill-2.svg" alt="" style={{ width: 11, height: 11, filter: marker.color === "#F5F5F5" ? "invert(1)" : "none" }} />
              {marker.label}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: spineColor }}>
              ● {action.urgency}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setSnoozed(true)} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 8px", borderRadius: 3, cursor: "pointer" }}>Snooze</button>
            <button onClick={() => setDone(true)} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 8px", borderRadius: 3, cursor: "pointer" }}>Mark complete</button>
          </div>
        </div>

        {/* Title + body */}
        <h3 style={{ fontFamily: "var(--font-body-wide)", fontWeight: 700, fontSize: 20, lineHeight: 1.22, margin: "0 0 8px", letterSpacing: "-0.01em", color: "#131313" }}>
          {action.title}
        </h3>
        <p style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, lineHeight: 1.55, color: "rgba(19,19,19,.75)", margin: "0 0 12px", maxWidth: 640 }}>
          {action.body}
        </p>

        {/* Related person link */}
        {relPerson && (
          <button
            onClick={() => onSelectPerson(relPerson)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(19,19,19,.04)", border: "1px solid rgba(19,19,19,.12)", padding: "6px 10px", marginBottom: 12, cursor: "pointer", borderRadius: 3 }}
          >
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bof-green)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "#fff" }}>
              {relPerson.avatar}
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: "rgba(19,19,19,.55)" }}>View {relPerson.name} →</span>
          </button>
        )}

        {/* Suggested actions — interactive checklist */}
        {action.actions.length > 0 && (
          <div>
            <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 6 }}>Suggested actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {action.actions.map((s, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={() => setChecked((c) => c.map((v, j) => j === i ? !v : v))}
                    style={{ marginTop: 2, width: 14, height: 14, accentColor: "var(--bof-green)", flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: "var(--font-body-wide)", fontSize: 13.5, color: checked[i] ? "rgba(19,19,19,.35)" : "#131313", textDecoration: checked[i] ? "line-through" : "none" }}>{s}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Inline narrative reveal */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(19,19,19,.08)", paddingTop: 14 }}>
          {!narrativeOpen ? (
            <button onClick={handleGenerate} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 12, height: 12 }} />
              Generate Click for Sparks
            </button>
          ) : (
            <div style={{ background: "var(--bof-off-black)", color: "var(--bof-off-white)", padding: "16px 18px", borderRadius: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 13, height: 13, filter: "invert(1)" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,245,.45)" }}>Click for Sparks</span>
                </div>
                <button onClick={() => setNarrativeOpen(false)} style={{ background: "transparent", border: 0, color: "rgba(245,245,245,.45)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
              {loading ? (
                <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(245,245,245,.45)", fontStyle: "italic" }}>Generating…</div>
              ) : narrative ? (
                <>
                  <p style={{ fontFamily: "var(--font-body-wide)", margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{narrative}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={onGenerate} style={{ background: "transparent", border: "1px solid rgba(245,245,245,.25)", color: "rgba(245,245,245,.85)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 9px", borderRadius: 3, cursor: "pointer" }}>Regenerate</button>
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(245,245,245,.45)", fontStyle: "italic" }}>No narrative generated yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

export default function ActionsView({ role, onSelectPerson }: ActionsViewProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const [generated, setGenerated] = useState<Record<number, string>>({});

  const filtered = ACTIONS.filter((a) =>
    role === "leadership" ? true : role === "coach" ? a.audience !== "leadership" : a.audience === "ic"
  );

  const highCount = filtered.filter((a) => a.urgency === "high").length;
  const medCount = filtered.filter((a) => a.urgency === "medium").length;
  const lowCount = filtered.filter((a) => a.urgency === "low").length;

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
          prompt: `Signal: "${action.title}"\nContext: ${action.body}\nAudience: ${action.audience}\nValue: ${action.value}\n\nWrite the Click for Sparks.`,
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
      {/* Header card */}
      <div style={{ background: "#FFFFFF", padding: "16px 20px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="d-eyebrow">Action center</div>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 14, color: "rgba(19,19,19,.55)", marginTop: 2 }}>
            {filtered.length} actions for {role === "leadership" ? "Leadership" : role === "coach" ? "Coaches" : "Everyone"} · sorted by priority
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {highCount > 0 && <span className="pill pill--orange">{highCount} high</span>}
          {medCount > 0 && <span className="pill pill--yellow">{medCount} medium</span>}
          {lowCount > 0 && <span className="pill pill--green">{lowCount} low</span>}
        </div>
      </div>

      {filtered.map((a, i) => {
        const relPerson = PEOPLE.find((p) =>
          a.title.includes(p.name.split(" ")[0]) || a.body.includes(p.name.split(" ")[0])
        );
        return (
          <ActionCardV2
            key={i}
            action={a}
            cardIndex={i}
            relPerson={relPerson}
            onSelectPerson={onSelectPerson}
            narrative={generated[i]}
            loading={loading === i}
            onGenerate={() => generateNarrative(i)}
          />
        );
      })}

      {filtered.length === 0 && (
        <div style={{ background: "#FFFFFF", padding: "40px 20px", borderRadius: 4, textAlign: "center", boxShadow: "var(--shadow-md)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 32, height: 32, marginBottom: 12, opacity: .3 }} />
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 15, color: "rgba(19,19,19,.45)" }}>No actions for this view.</div>
        </div>
      )}
    </div>
  );
}
