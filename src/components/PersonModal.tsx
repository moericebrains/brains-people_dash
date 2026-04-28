"use client";

import { useState } from "react";
import { ENNEAGRAM_LABELS, STRENGTHS_DOMAINS } from "@/lib/constants";
import { mbtiGroup, mbtiColor } from "@/lib/utils";

function getTimezone(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("mountain") || l.includes("mt") || l.includes("denver") || l.includes("colorado") || l.includes("salt lake") || l.includes("phoenix")) return "MT";
  if (l.includes("central") || l.includes("ct") || l.includes("chicago") || l.includes("dallas") || l.includes("houston") || l.includes("austin") || l.includes("minneapolis")) return "CT";
  if (l.includes("pacific") || l.includes("pt") || l.includes("los angeles") || l.includes("seattle") || l.includes("san francisco") || l.includes("portland")) return "PT";
  return "ET";
}
import type { Person, Role } from "@/lib/types";

interface PersonModalProps {
  person: Person;
  onClose: () => void;
  role: Role;
  people?: Person[];
}

const initials = (name: string) => {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

function Field({ label, value }: { label: string; value?: string | string[] }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(" · ") : value;
  return (
    <div style={{ paddingBottom: 10, borderBottom: "1px solid rgba(19,19,19,.06)", marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: "rgba(19,19,19,.55)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: "#333", lineHeight: 1.5 }}>{display}</div>
    </div>
  );
}

export default function PersonModal({ person, onClose, role, people = [] }: PersonModalProps) {
  const [narrative, setNarrative] = useState("");
  const [narrativeError, setNarrativeError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSeeSensitive = role === "leadership" || role === "coach";

  const currentIndex = people.findIndex((p) => p.id === person.id);

  const navigateTo = (dir: -1 | 1) => {
    if (!people.length) return;
    const nextIndex = (currentIndex + dir + people.length) % people.length;
    // We need to call onClose and then reopen — but we don't have that mechanism.
    // Instead we use window event. For now: we'll refresh by closing then dispatching.
    // Simple approach: navigate through window.location won't work. Let's just
    // find a way to update the selected person from here.
    // We'll use a custom event that Dashboard listens to.
    window.dispatchEvent(new CustomEvent("peopledash:selectperson", { detail: people[nextIndex] }));
  };

  const generateNarrative = async () => {
    setLoading(true);
    setNarrativeError("");
    try {
      const richContext = [
        person.superpower && `Natural strengths: ${person.superpower}`,
        person.working_on && `Working on: ${person.working_on}`,
        person.growth_areas && `Growth areas: ${person.growth_areas}`,
        person.burnout_triggers && `Burnout triggers: ${person.burnout_triggers}`,
        person.burnout_support && `Burnout support: ${person.burnout_support}`,
        person.feedback_pref && `Feedback preference: ${person.feedback_pref}`,
        person.intro_extro && `Intro/extro: ${person.intro_extro}`,
      ].filter(Boolean).join("\n");

      const prompt = `Name: ${person.name}
Role: ${person.role}
Pod: ${person.pod}
StrengthsFinder Top 5: ${person.strengths.join(", ")} (domains: ${person.strengthDomains.join(", ")})
Enneagram: Type ${person.enneagram} (${ENNEAGRAM_LABELS[person.enneagram]})
Myers-Briggs: ${person.mbti} (${mbtiGroup(person.mbti)})
Harvest utilization signal: ${person.stress} (low = healthy, medium = watch, high = burnout risk)
Coach: ${person.coach}
${richContext}

Generate the coaching narrative.`;

      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "person", prompt }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok || data.error) {
        setNarrativeError(data.error ?? `API error ${res.status} — check ANTHROPIC_API_KEY in Vercel`);
      } else {
        setNarrative(data.text || "Unable to generate narrative.");
      }
    } catch (e) {
      setNarrativeError(e instanceof Error ? e.message : "Network error — please try again.");
    }
    setLoading(false);
  };

  const hue = person.enneagram * 40;
  const hasPrev = people.length > 1;
  const hasNext = people.length > 1;

  // Voice quote — pull first richest free-text field
  const voiceQuote = person.superpower || person.working_on || person.delight_trigger;

  return (
    <>
      {/* Backdrop — clicking it closes */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(19,19,19,.55)", zIndex: 200 }}
      />

      {/* Drawer */}
      <div
        className="drawer-enter"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
          background: "#FFFFFF",
          boxShadow: "-12px 0 40px rgba(0,0,0,.30)",
          zIndex: 201,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer top bar */}
        <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid rgba(19,19,19,.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--bof-orange)", display: "flex", alignItems: "center", gap: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sparks/spark-fill-2.svg" alt="" style={{ width: 12, height: 12 }} />
            Working with {person.name.split(" ")[0]}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {hasPrev && (
              <button onClick={() => navigateTo(-1)} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 9px", borderRadius: 3, cursor: "pointer" }}>← Prev</button>
            )}
            {hasNext && (
              <button onClick={() => navigateTo(1)} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 9px", borderRadius: 3, cursor: "pointer" }}>Next →</button>
            )}
            <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "rgba(19,19,19,.55)", fontFamily: "var(--font-body)", fontSize: 14, padding: "5px 10px", borderRadius: 3, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
        </div>

        <div style={{ padding: "20px 22px 28px", flex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bof-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "var(--font-body)" }}>
              {initials(person.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 28, lineHeight: 1.05, margin: "0 0 4px", letterSpacing: ".01em", color: "#131313" }}>
                {person.name}
              </h2>
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.65)", marginBottom: 5 }}>
                {person.role} · {person.pod} · {person.location} · {getTimezone(person.location)}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(19,19,19,.45)" }}>
                Coach: <span style={{ color: "#131313" }}>{person.coach}</span>
                {person.tenure && <> · Tenure: <span style={{ color: "#131313" }}>{person.tenure}</span></>}
              </div>
            </div>
          </div>

          {/* Voice quote — if available */}
          {voiceQuote && (
            <div style={{ background: "var(--bof-cream)", padding: "16px 18px", borderRadius: 4, marginBottom: 18, position: "relative" }}>
              <div style={{ position: "absolute", top: 6, left: 12, fontFamily: "var(--font-display)", fontSize: 36, color: "var(--bof-orange)", lineHeight: 1, opacity: .5, pointerEvents: "none" }}>&ldquo;</div>
              <p style={{ margin: "0 0 6px 16px", fontSize: 14, lineHeight: 1.55, fontStyle: "italic", color: "#131313", fontFamily: "var(--font-body-wide)" }}>
                {voiceQuote}
              </p>
              <div style={{ marginLeft: 16, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)" }}>
                — {person.name.split(" ")[0]}
              </div>
            </div>
          )}

          {/* Assessments */}
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.55)", marginBottom: 8 }}>Assessments</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {/* Myers-Briggs */}
            <div style={{ background: "#fff", border: "1px solid rgba(19,19,19,.10)", padding: "12px 14px", borderRadius: 4, borderTop: `2px solid ${mbtiColor(person.mbti)}` }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", marginBottom: 5 }}>Myers-Briggs</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 26, fontWeight: 700, color: mbtiColor(person.mbti) }}>{person.mbti || "—"}</div>
              <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 11, color: "rgba(19,19,19,.55)" }}>{mbtiGroup(person.mbti)}</div>
            </div>

            {/* Enneagram */}
            {person.enneagram === 0 ? (
              <div style={{ background: "#fff", border: "1px dashed rgba(19,19,19,.20)", padding: "12px 14px", borderRadius: 4 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", marginBottom: 6 }}>Enneagram</div>
                <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.55)", lineHeight: 1.4, marginBottom: 8 }}>
                  {person.name.split(" ")[0]} hasn&apos;t shared this yet.
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--bof-orange)" }}>Ask in next 1:1 →</div>
              </div>
            ) : (
              <div style={{ background: "#fff", border: "1px solid rgba(19,19,19,.10)", padding: "12px 14px", borderRadius: 4 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", marginBottom: 5 }}>Enneagram</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 30, fontWeight: 700, color: `hsl(${hue},60%,45%)` }}>{person.enneagram}</div>
                <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 11, color: "rgba(19,19,19,.55)" }}>{ENNEAGRAM_LABELS[person.enneagram]}</div>
              </div>
            )}
          </div>

          {/* StrengthsFinder */}
          <div style={{ background: "#fff", border: "1px solid rgba(19,19,19,.10)", padding: "12px 14px", borderRadius: 4, marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", marginBottom: 8 }}>StrengthsFinder · Top {person.strengths.length}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {person.strengths.map((s, i) => {
                const domainColor = STRENGTHS_DOMAINS[person.strengthDomains[i]] || "#888";
                return (
                  <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${domainColor}`, color: domainColor, padding: "4px 9px", borderRadius: 999, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: .6 }}>{i + 1}</span>
                    {s}
                  </span>
                );
              })}
            </div>
            {/* Domain bar */}
            <div style={{ display: "flex", gap: 4 }}>
              {Object.entries(STRENGTHS_DOMAINS).map(([domain, color]) => {
                const count = person.strengthDomains.filter((d) => d === domain).length;
                return count > 0 ? (
                  <div key={domain} style={{ flex: count, background: color, color: domain === "Influencing" ? "#131313" : "#fff", padding: "5px 6px", fontSize: 9, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", fontFamily: "var(--font-body)", display: "flex", justifyContent: "space-between", borderRadius: 2 }}>
                    <span>{domain}</span><span>{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* How to work with me */}
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.55)", marginBottom: 10 }}>How to work with me</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Field label="Professional communication" value={person.prof_comms} />
            <Field label="Personal communication" value={person.pers_comms} />
            <Field label="Peak performance hours" value={person.peak_hours} />
            <Field label="Recognition style" value={person.recognition_style} />
            <Field label="Feedback preference" value={person.feedback_pref} />
            <Field label="Ideation style" value={person.ideation_style} />
            <Field label="Lights me up" value={person.project_loves} />
            <Field label="Surefire way to delight me" value={person.delight_trigger} />
            <Field label="Surefire way to frustrate me" value={person.grumpy_trigger} />
            <Field label="Working on" value={person.working_on} />
            <Field label="Growing toward" value={person.growth_areas} />
            <Field label="What burns me out" value={person.burnout_triggers} />
            <Field label="How to support me" value={person.burnout_support} />
          </div>

          {/* Coaching narrative — gated */}
          {canSeeSensitive && (
            <div style={{ marginTop: 18, borderTop: "1px solid rgba(19,19,19,.08)", paddingTop: 18 }}>
              {narrativeError && (
                <div style={{ background: "#FEF0EE", border: "1px solid #F4A99A", padding: "12px 14px", marginBottom: 12, fontFamily: "var(--font-body-wide)", fontSize: 13, color: "#B94A3A", lineHeight: 1.6, borderRadius: 4 }}>
                  ⚠ {narrativeError}
                </div>
              )}
              {narrative ? (
                <div style={{ background: "var(--bof-off-black)", color: "var(--bof-off-white)", padding: "16px 18px", borderRadius: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 13, height: 13, filter: "invert(1)" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,245,245,.55)" }}>Coaching narrative</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13.5, lineHeight: 1.6 }}>{narrative}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={generateNarrative} style={{ background: "var(--bof-orange)", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 3, cursor: "pointer" }}>Regenerate</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateNarrative}
                  disabled={loading}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(19,19,19,.25)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "12px 16px", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 3, opacity: loading ? .7 : 1, transition: "all .15s" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 13, height: 13 }} />
                  {loading ? "Generating…" : "Generate coaching narrative"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(19,19,19,.08)", display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          {canSeeSensitive && (
            <button style={{ background: "var(--bof-orange)", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "10px 14px", borderRadius: 3, cursor: "pointer" }}>Start a 1:1 note</button>
          )}
          <button
            onClick={() => alert(`Slack handles coming soon! Add ${person.name}'s handle to the directory sheet.`)}
            style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "10px 14px", borderRadius: 3, cursor: "pointer" }}
          >Send a Slack 🎬</button>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "10px 14px", borderRadius: 3, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </>
  );
}
