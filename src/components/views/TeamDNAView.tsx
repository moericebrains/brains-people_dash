"use client";

import { useState, useMemo } from "react";
import { PEOPLE, STRENGTHS_DOMAINS, ENNEAGRAM_LABELS, MBTI_GROUPS } from "@/lib/constants";
import { pulseColor, mbtiGroup, mbtiColor } from "@/lib/utils";
import type { Person } from "@/lib/types";
import MiniBar from "@/components/ui/MiniBar";

interface TeamDNAViewProps {
  onSelectPerson: (p: Person) => void;
  people?: Person[];
}

const initials = (name: string) => {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const ALLOWED_PODS = ["Pod 1", "Pod 2", "Brand Pod", "Admin", "Web Pod", "Production", "Creative", "Accounts", "Strategy", "Projects"];
const POD_CANONICAL: Record<string, string> = {
  "pod 1": "Pod 1", "pod1": "Pod 1",
  "pod 2": "Pod 2", "pod2": "Pod 2",
  "brand pod": "Brand Pod", "brand": "Brand Pod",
  "admin": "Admin", "administration": "Admin",
  "web pod": "Web Pod", "web": "Web Pod",
  "production": "Production", "prod": "Production",
  "creative": "Creative",
  "accounts": "Accounts", "account": "Accounts",
  "strategy": "Strategy",
  "projects": "Projects", "project management": "Projects", "pm": "Projects",
};
function personPods(raw: string): string[] {
  return raw.split(",")
    .map((s) => POD_CANONICAL[s.trim().toLowerCase()] ?? "")
    .filter((s) => ALLOWED_PODS.includes(s));
}

function strengthSimilarity(a: Person, b: Person): number {
  return a.strengths.filter((s) => b.strengths.includes(s)).length;
}

function findSimilarAndDifferent(person: Person, others: Person[]): { similar: Person | null; different: Person | null } {
  const rest = others.filter((p) => p.id !== person.id);
  if (!rest.length) return { similar: null, different: null };
  const scored = rest.map((p) => ({ p, score: strengthSimilarity(person, p) }));
  scored.sort((a, b) => b.score - a.score);
  return { similar: scored[0].p, different: scored[scored.length - 1].p };
}

function getDomainCounts(people: Person[]) {
  const counts: Record<string, number> = { Executing: 0, Influencing: 0, Relationship: 0, Thinking: 0 };
  people.forEach((p) => p.strengthDomains.forEach((d) => { if (counts[d] !== undefined) counts[d]++; }));
  return counts;
}

function getTopStrengths(people: Person[], n = 8) {
  const counts: Record<string, number> = {};
  people.forEach((p) => p.strengths.forEach((s, i) => { counts[s] = (counts[s] || 0) + (5 - i); }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([s]) => s);
}

function getEnneagramCounts(people: Person[]) {
  const counts: Record<number, number> = {};
  people.forEach((p) => { counts[p.enneagram] = (counts[p.enneagram] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function getMbtiCounts(people: Person[]) {
  const counts: Record<string, number> = {};
  people.forEach((p) => { counts[p.mbti] = (counts[p.mbti] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const DOMAIN_DESC: Record<string, string> = {
  Executing: "People strong in Executing know how to make things happen. They turn ideas into reality through drive, discipline, and relentless follow-through — they are the team's engine.",
  Influencing: "People strong in Influencing know how to take charge, speak up, and make sure the team's ideas are heard. They sell internally and externally, and they push the work forward.",
  Relationship: "People strong in Relationship Building are the glue that holds a team together. They create the connections and trust that make the whole greater than the sum of its parts.",
  Thinking: "People strong in Strategic Thinking are constantly absorbing and analyzing information. They keep the team focused on what could be, stretching imaginations and pushing toward smarter decisions.",
};

const STRENGTH_DESC: Record<string, string> = {
  Achiever: "You have a constant need for achievement. You feel as if every day starts at zero — and you won't rest until you've hit something meaningful by the end of it.",
  Activator: "You can make things happen by turning thoughts into action. You believe the best way to learn something is to start doing it. 'When can we start?' is your default question.",
  Adaptability: "You live in the moment. You don't resent sudden requests or unexpected detours — you expect them, and you navigate change with ease and calm.",
  Analytical: "You search for reasons and causes. You need data, proof, and logic before you commit. You keep the team honest by asking 'what's the evidence?'",
  Arranger: "You can organize, but you also have a flexibility that complements this ability. You enjoy juggling multiple variables to find the most productive configuration.",
  Belief: "You have certain core values that are unchanging. From them emerges a defined purpose — one that gives meaning to your work and consistency to your character.",
  Command: "You have presence. You can take control of a situation and make decisions. You don't shy away from confrontation; you see it as a way to get to the truth.",
  Communication: "You like to explain, describe, and bring ideas to life through words. You are a natural storyteller who makes abstract things feel vivid and real.",
  Competition: "You measure your progress against the performance of others. You strive to win — and your drive pushes those around you to raise their game too.",
  Connectedness: "You have faith in the links between all things. You see meaning in coincidences and believe that every event has a reason — it gives you perspective and calm.",
  Consistency: "You are keenly aware of the need to treat people the same. You believe in setting clear rules and following them, because fairness builds trust.",
  Context: "You enjoy thinking about the past to understand the present. You believe good decisions are grounded in history, and you bring that depth to every big call.",
  Deliberative: "You are defined by serious care in making decisions. You anticipate obstacles and take calculated risks — you prefer getting it right over getting it fast.",
  Developer: "You see the potential in others and get genuine satisfaction from watching people grow. You notice every small sign of improvement — and you invest in it.",
  Discipline: "Your world needs to be ordered. You take pleasure in routines, structure, and precision — and you bring that clarity to everything you touch.",
  Empathy: "You can sense the emotions of those around you. You feel what they feel, and that makes you a naturally gifted listener and a safe person to be around.",
  Focus: "You take a direction, follow through, and make the corrections needed to stay on track. You give the team a laser — you cut through noise and keep things moving.",
  Futuristic: "You are inspired by what could be. You energize others with vivid visions of a better future, and you push the team to think beyond the present.",
  Harmony: "You look for consensus and dislike conflict. You seek areas of agreement and find practical, workable solutions that everyone can get behind.",
  Ideation: "You are fascinated by ideas and love finding unexpected connections between seemingly unrelated things. You are the team's spark of originality.",
  Includer: "You are accepting of others. You notice who feels left out and actively work to bring them in — you believe everyone has something worth contributing.",
  Individualization: "You are intrigued by the unique qualities of each person. You figure out how different people can work together productively by playing to their individual strengths.",
  Input: "You have a craving to know more. You collect information, ideas, artifacts, and relationships — and you are always ready to draw on that rich store.",
  Intellection: "You like to think. You enjoy long stretches of quiet reflection, and you produce your best insights in the space between conversations.",
  Learner: "You have a great desire to learn and continuously improve. The process of learning energizes you as much as the knowledge itself.",
  Maximizer: "You focus on strengths as a way to stimulate personal and group excellence. You want to take what is already good and make it truly superb.",
  Positivity: "You have an enthusiasm that is contagious. You are generous with praise, quick to smile, and always on the lookout for the good in a situation.",
  Relator: "You enjoy close, deep relationships and find genuine satisfaction in working hard alongside people you trust. Authenticity matters more to you than breadth.",
  Responsibility: "You take psychological ownership of what you say you'll do. Your word is your bond — and that reliability makes you one of the most trusted people in any room.",
  Restorative: "You are adept at dealing with problems. You are energized by figuring out what is wrong and resolving it — you bring the fix when others bring the worry.",
  "Self-Assurance": "You feel confident in your ability to manage your own life. You have an inner compass that gives you certainty — and others feel steadied by your presence.",
  Significance: "You want to make a meaningful difference in the eyes of others. You are motivated by the desire for your work to matter — and to be recognized for it.",
  Strategic: "You quickly spot relevant patterns and issues, seeing around corners that others miss. You always know where to look and how to cut to the clearest path forward.",
  Woo: "You love the challenge of meeting new people and winning them over. You break ice effortlessly and light up any room — connection is your superpower.",
};

const ENNEAGRAM_DESC: Record<number, string> = {
  1: "The Reformer — principled, purposeful, self-controlled, and perfectionistic. Ones bring high standards and a strong moral compass to everything they do.",
  2: "The Helper — caring, interpersonal, and demonstrative. Twos are generous with their time and energy, and they genuinely enjoy making others feel seen and supported.",
  3: "The Achiever — success-oriented, pragmatic, and driven. Threes are adaptable and energetic, and they inspire others through their ambition and polished delivery.",
  4: "The Individualist — expressive, dramatic, and self-absorbed in the richest sense. Fours bring depth, originality, and emotional honesty that elevates creative work.",
  5: "The Investigator — perceptive, innovative, and secretive. Fives bring deep expertise and original thinking, often synthesizing ideas that others haven't connected yet.",
  6: "The Loyalist — committed, security-oriented, and engaging. Sixes are reliable, hardworking, and bring a healthy skepticism that protects the team from blind spots.",
  7: "The Enthusiast — spontaneous, versatile, and distractible. Sevens bring infectious energy, quick connections between ideas, and a restless optimism that pushes boundaries.",
  8: "The Challenger — decisive, willful, and confrontational in a productive way. Eights protect the people they care about and push hard for what they believe in.",
  9: "The Peacemaker — receptive, reassuring, and agreeable. Nines create harmony and bring everyone's perspective into the room — they're often the glue in a team.",
};

const MBTI_DESC: Record<string, string> = {
  INTJ: "The Architect — strategic and private. INTJs see the long game and will quietly redesign an entire system to make it work better.",
  INTP: "The Logician — analytical and objective. INTPs love building mental models and will question every assumption until the answer is airtight.",
  ENTJ: "The Commander — bold and decisive. ENTJs take charge naturally and are at their best leading ambitious projects with high stakes.",
  ENTP: "The Debater — quick-witted and argumentative in the best way. ENTPs see angles others miss and love poking holes in conventional thinking.",
  INFJ: "The Advocate — insightful and principled. INFJs combine empathy with vision — they often sense what a team needs before anyone says it out loud.",
  INFP: "The Mediator — idealistic and curious. INFPs care deeply about meaning and bring a creative, human-centered lens to every problem they touch.",
  ENFJ: "The Protagonist — charismatic and empathetic. ENFJs are natural connectors who bring out the best in people and make everyone feel heard.",
  ENFP: "The Campaigner — enthusiastic and creative. ENFPs generate ideas at speed, champion the underdog, and make work feel meaningful for everyone around them.",
  ISTJ: "The Logistician — dependable and detail-oriented. ISTJs ensure that commitments are kept and processes hold — the backbone of any reliable team.",
  ISFJ: "The Defender — dedicated and warm. ISFJs quietly take care of everyone around them and take great pride in doing their work well.",
  ESTJ: "The Executive — organized and driven to lead. ESTJs create order, enforce standards, and are often the person who makes sure things actually get done.",
  ESFJ: "The Consul — caring and social. ESFJs thrive when they're supporting others and keeping the team connected, informed, and appreciated.",
  ISTP: "The Virtuoso — practical and observant. ISTPs diagnose problems quickly and prefer getting their hands on the work over talking about it.",
  ISFP: "The Adventurer — flexible and charming. ISFPs bring quiet creativity and a deep sensory instinct for what looks, feels, and sounds right.",
  ESTP: "The Entrepreneur — energetic and perceptive. ESTPs move fast, think on their feet, and are often the first to spot an opportunity in a messy situation.",
  ESFP: "The Entertainer — spontaneous and enthusiastic. ESFPs light up the room, love collaboration, and make work more human and enjoyable for everyone.",
};

// ── Work Style helpers ────────────────────────────────────────────────────────

function bucketHours(text: string): string {
  const t = text.toLowerCase();
  if (!t) return "";
  if (t.match(/\b[4-8]\s*am\b|early morning|before 9|before 8|dawn/)) return "Early Morning";
  if (t.match(/\b9|10|11\b|morning/) && !t.match(/\bpm\b/)) return "Morning (9am–12pm)";
  if (t.match(/noon|12\s*pm|\b12\b.*pm|midday/)) return "Midday";
  if (t.match(/\b1\s*pm|\b2\s*pm|\b1[^0-9].*pm|\b2[^0-9].*pm|early afternoon/)) return "Early Afternoon (1–3pm)";
  if (t.match(/\b3\s*pm|\b4\s*pm|\b5\s*pm|late afternoon/)) return "Late Afternoon (3–5pm)";
  if (t.match(/evening|\b[6-9]\s*pm|night/)) return "Evening";
  if (t.match(/flex|any|varies|all day|anytime/)) return "Flexible";
  return "Other";
}

function bucketIntroExtro(text: string): "Introvert" | "Ambivert" | "Extrovert" | null {
  const t = text.toLowerCase();
  if (!t) return null;
  if (t.match(/ambi|between|both|blend|mix|somewhere/)) return "Ambivert";
  if (t.match(/intro/)) return "Introvert";
  if (t.match(/extro/)) return "Extrovert";
  return null;
}

function bucketStyle(text: string, type: "learning" | "ideation"): string {
  const t = text.toLowerCase();
  if (!t) return "";
  if (type === "learning") {
    if (t.match(/visual|diagram|chart|watch|see|spatial/)) return "Visual";
    if (t.match(/auditory|listen|hear|talk|discuss|verbal/)) return "Auditory";
    if (t.match(/read|write|note|text/)) return "Reading/Writing";
    if (t.match(/hands.on|kinesthetic|doing|practice|tactile|experiential/)) return "Hands-on";
    if (t.match(/collab|group|social|peer|team/)) return "Collaborative";
    return text.trim();
  }
  if (t.match(/solo|alone|quiet|independent|individ/)) return "Solo";
  if (t.match(/collab|group|brainstorm|team|together|workshop/)) return "Collaborative";
  if (t.match(/research|data|analys|study|deep.dive/)) return "Research-driven";
  if (t.match(/visual|sketch|map|whiteboard|draw|spatial/)) return "Visual mapping";
  if (t.match(/walk|move|physical|outside|ambient/)) return "Movement-based";
  if (t.match(/rapid|quick|fast|sprint|free/)) return "Rapid ideation";
  return text.trim();
}

function countField(people: Person[], getter: (p: Person) => string): { label: string; count: number; people: Person[] }[] {
  const map: Record<string, Person[]> = {};
  people.forEach((p) => {
    const val = getter(p);
    if (!val) return;
    map[val] = map[val] ?? [];
    map[val].push(p);
  });
  return Object.entries(map)
    .filter(([label]) => label && label !== "Other" && label !== "")
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, ps]) => ({ label, count: ps.length, people: ps }));
}

const HOUR_ORDER = ["Early Morning", "Morning (9am–12pm)", "Midday", "Early Afternoon (1–3pm)", "Late Afternoon (3–5pm)", "Evening", "Flexible"];
const HOUR_COLORS: Record<string, string> = {
  "Early Morning": "#C0DFEC",
  "Morning (9am–12pm)": "#EDC157",
  "Midday": "#EA5B32",
  "Early Afternoon (1–3pm)": "#EEB1D2",
  "Late Afternoon (3–5pm)": "#2E7354",
  "Evening": "#3565E3",
  "Flexible": "#7A7A7A",
};

export default function TeamDNAView({ onSelectPerson, people = PEOPLE }: TeamDNAViewProps) {
  const [lens, setLens] = useState("org");
  const [framework, setFramework] = useState("strengths");
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [openStrength, setOpenStrength] = useState<string | null>(null);
  const [openEnn, setOpenEnn] = useState<string | null>(null);
  const [openMbti, setOpenMbti] = useState<string | null>(null);
  const [podAdvice, setPodAdvice] = useState<string | null>(null);
  const [podAdviceLoading, setPodAdviceLoading] = useState(false);

  const allPersonPods = people.flatMap((p) => p.pod ? personPods(p.pod) : []);
  const PODS = ALLOWED_PODS.filter((pod) => allPersonPods.includes(pod));
  const THEMES = [...new Set(
    people.map((p) => p.theme).filter(Boolean)
      .map((t) => POD_CANONICAL[t.trim().toLowerCase()] ?? t.trim())
      .filter((t) => ALLOWED_PODS.includes(t) && !PODS.includes(t))
  )];
  const lensOptions = [
    { id: "org", label: "FULL ORG" },
    ...PODS.map((p) => ({ id: `pod:${p}`, label: p.toUpperCase() })),
    ...THEMES.map((t) => ({ id: `theme:${t}`, label: t.toUpperCase() })),
  ];

  const filtered = lens === "org" ? people
    : lens.startsWith("pod:") ? people.filter((p) => p.pod ? personPods(p.pod).includes(lens.slice(4)) : false)
    : people.filter((p) => p.theme === lens.slice(6));

  const domainCounts = getDomainCounts(filtered);
  const topStrengths = getTopStrengths(filtered);
  const ennCounts = getEnneagramCounts(filtered);
  const mbtiCounts = getMbtiCounts(filtered);
  const total = filtered.length;
  const domainMax = Math.max(...Object.values(domainCounts));

  const podLabel = lens.startsWith("pod:") ? lens.slice(4) : null;

  const frameworkSummary = useMemo(() => {
    if (!filtered.length) return "";
    if (framework === "strengths") {
      const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];
      const top3 = topStrengths.slice(0, 3);
      const domainSentences: Record<string, string> = {
        Executing: "This is a team that gets things done — ideas become outcomes here.",
        Influencing: "This group knows how to move people and push work forward with conviction.",
        Relationship: "Connection and trust are central to how this team operates — they show up for each other.",
        Thinking: "This is a team of strategic thinkers who love complexity and are always looking ahead.",
      };
      return `${topDomain?.[0]} is the dominant domain (${topDomain?.[1]} strengths). Top talents: ${top3.join(", ")}. ${domainSentences[topDomain?.[0]] ?? ""}`;
    }
    if (framework === "enneagram") {
      const top2 = ennCounts.slice(0, 2).map(([t, c]) => `${c}× Type ${t} (${ENNEAGRAM_LABELS[Number(t)] ?? ""})`);
      const blend = ennCounts.length === 1 ? "a highly cohesive type cluster" : "a varied mix of core motivations";
      return `The core is ${top2.join(" and ")} — ${blend}. Watch for how these types navigate conflict and praise differently.`;
    }
    if (framework === "mbti") {
      const topType = mbtiCounts[0]?.[0] ?? "";
      const iCount = filtered.filter((p) => p.mbti?.startsWith("I")).length;
      const eCount = filtered.filter((p) => p.mbti?.startsWith("E")).length;
      const tCount = filtered.filter((p) => p.mbti?.includes("T")).length;
      const fCount = filtered.filter((p) => p.mbti?.includes("F")).length;
      return `${eCount > iCount ? "Extroverts" : "Introverts"} lead ${Math.max(eCount, iCount)}–${Math.min(eCount, iCount)}. ${tCount > fCount ? "Thinking" : "Feeling"} types outnumber ${tCount > fCount ? "Feeling" : "Thinking"} ${Math.max(tCount, fCount)}–${Math.min(tCount, fCount)}. Most common type: ${topType}.`;
    }
    if (framework === "workstyle") {
      const peakCounts: Record<string, number> = {};
      filtered.forEach((p) => { if (p.peak_hours) peakCounts[p.peak_hours] = (peakCounts[p.peak_hours] ?? 0) + 1; });
      const topPeak = Object.entries(peakCounts).sort((a, b) => b[1] - a[1])[0];
      const introCount = filtered.filter((p) => p.intro_extro?.toLowerCase().includes("intro")).length;
      if (!topPeak) return "Add peak hours and work style to the directory to unlock this summary.";
      return `Most effective during ${topPeak[0]} (${topPeak[1]} people). ${introCount > filtered.length / 2 ? "Introverts make up the majority — honour async communication and quiet focus time." : "The group skews extroverted — energy comes from collaboration, so create space for it."}`;
    }
    return "";
  }, [filtered, framework, domainCounts, topStrengths, ennCounts, mbtiCounts]);

  const generatePodAdvice = async () => {
    if (!podLabel) return;
    setPodAdviceLoading(true);
    setPodAdvice(null);
    const profile = [
      `Pod: ${podLabel} (${total} people)`,
      `Top strengths: ${topStrengths.slice(0, 5).join(", ")}`,
      `Dominant domain: ${Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0]}`,
      `MBTI types: ${mbtiCounts.slice(0, 4).map(([t, c]) => `${t}×${c}`).join(", ")}`,
      `Enneagram types: ${ennCounts.slice(0, 3).map(([t, c]) => `Type ${t}×${c}`).join(", ")}`,
    ].join("\n");
    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "action",
          prompt: `${profile}\n\nWrite a short (4–5 sentence) playbook for how ${podLabel} can work together at their best. Be specific to their personality profile. Ground it in Brains values.`,
        }),
      });
      const data = await res.json() as { text?: string };
      setPodAdvice(data.text ?? "");
    } catch {
      setPodAdvice("Unable to generate. Check your API key.");
    }
    setPodAdviceLoading(false);
  };

  return (
    <div>
      {/* Lens selector */}
      <div style={{ background: "#FFFFFF", padding: "14px 20px", marginBottom: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.05em", marginRight: 8 }}>VIEW BY:</span>
        {lensOptions.map((o) => (
          <button key={o.id} onClick={() => setLens(o.id)} style={{
            background: lens === o.id ? "#EA5B32" : "transparent",
            color: lens === o.id ? "#fff" : "#444",
            border: "1px solid", borderColor: lens === o.id ? "#EA5B32" : "#D8D8D4",
            padding: "4px 10px", fontSize: 13, letterSpacing: "0.04em", cursor: "pointer",
            fontFamily: "inherit", fontWeight: lens === o.id ? 800 : 400, transition: "all 0.15s",
          }}>{o.label}</button>
        ))}
      </div>

      {/* Framework tabs */}
      <div style={{ background: "#FFFFFF", padding: "0 20px", marginBottom: 1, borderBottom: "1px solid #1a1a1a", display: "flex" }}>
        {[["strengths", "STRENGTHSFINDER"], ["enneagram", "ENNEAGRAM"], ["mbti", "MYERS-BRIGGS"], ["workstyle", "WORK STYLE"]].map(([id, label]) => (
          <button key={id} onClick={() => setFramework(id)} style={{
            background: "transparent", border: "none",
            borderBottom: framework === id ? "2px solid #FF4500" : "2px solid transparent",
            color: framework === id ? "#131313" : "#444", padding: "12px 20px",
            fontSize: 14, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", marginBottom: -1,
            fontWeight: framework === id ? 800 : 400,
          }}>{label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#7A7A7A" }}>{total} PEOPLE</span>
        </div>
      </div>

      {/* People chips */}
      <div style={{ background: "#FFFFFF", padding: "14px 20px", marginBottom: 1, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filtered.map((p) => (
          <div key={p.id} onClick={() => onSelectPerson(p)} style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: "#E8E8E5", padding: "5px 10px",
            border: `1px solid ${pulseColor(p.pulse)}22`, transition: "all 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = pulseColor(p.pulse)}
            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = `${pulseColor(p.pulse)}22`}
          >
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D8D8D4", border: `1.5px solid ${pulseColor(p.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#131313" }}>{initials(p.name)}</div>
            <span style={{ fontSize: 14, color: "#7A7A7A" }}>{p.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* Summary card — strengths, enneagram, mbti only (not workstyle) */}
      {frameworkSummary && framework !== "workstyle" && (
        <div style={{ background: "#FFFFFF", padding: "18px 22px", marginBottom: 8, boxShadow: "var(--shadow-md)", borderRadius: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "flex-start" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sparks/spark-fill-hero.svg" alt="" style={{ width: 40, height: 36, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="d-eyebrow d-eyebrow--muted" style={{ marginBottom: 5 }}>
                {podLabel ? `${podLabel} · ` : "Full org · "}{framework === "strengths" ? "StrengthsFinder" : framework === "enneagram" ? "Enneagram" : "Myers-Briggs"} — so what
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 18, lineHeight: 1.3, margin: 0, letterSpacing: ".01em", color: "#131313" }}>
                {frameworkSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pod playbook */}
      {podLabel && (
        <div style={{ marginBottom: 8 }}>
          {!podAdvice && !podAdviceLoading ? (
            <button onClick={generatePodAdvice} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid rgba(19,19,19,.20)", color: "#131313", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 3, cursor: "pointer" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 12, height: 12 }} />
              Click for Sparks
            </button>
          ) : podAdviceLoading ? (
            <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", fontStyle: "italic" }}>Sparking…</div>
          ) : (
            <div style={{ background: "var(--bof-off-black)", color: "var(--bof-off-white)", padding: "16px 18px", borderRadius: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sparks/spark-fill-1.svg" alt="" style={{ width: 12, height: 12, filter: "invert(1)" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,245,.55)" }}>{podLabel} playbook</span>
                </div>
                <button onClick={() => { setPodAdvice(null); }} style={{ background: "transparent", border: 0, color: "rgba(245,245,245,.45)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
              <p style={{ fontFamily: "var(--font-body-wide)", margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.6 }}>{podAdvice}</p>
              <button onClick={generatePodAdvice} style={{ background: "transparent", border: "1px solid rgba(245,245,245,.25)", color: "rgba(245,245,245,.85)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 9px", borderRadius: 3, cursor: "pointer" }}>Click for Sparks</button>
            </div>
          )}
        </div>
      )}

      {/* STRENGTHSFINDER */}
      {framework === "strengths" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>STRENGTH DOMAIN DISTRIBUTION</div>
              {Object.entries(domainCounts).map(([domain, count]) => {
                const isOpen = openDomain === domain;
                return (
                  <div key={domain} style={{ marginBottom: 18 }}>
                    <div
                      onClick={() => setOpenDomain(isOpen ? null : domain)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, background: STRENGTHS_DOMAINS[domain] }} />
                        <span style={{ fontSize: 16, color: "#333", fontWeight: 600 }}>{domain}</span>
                        <span style={{ fontSize: 13, color: "#BBBBB5" }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                      <span style={{ fontSize: 24, fontWeight: 900, color: STRENGTHS_DOMAINS[domain] }}>{count}</span>
                    </div>
                    <MiniBar value={count} max={domainMax} color={STRENGTHS_DOMAINS[domain]} height={6} />
                    <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 4 }}>
                      {Math.round(count / filtered.reduce((a, p) => a + p.strengthDomains.length, 0) * 100)}% of all top-5 themes
                    </div>
                    {isOpen && DOMAIN_DESC[domain] && (
                      <div style={{ marginTop: 10, padding: "10px 14px", borderLeft: `3px solid ${STRENGTHS_DOMAINS[domain]}`, background: "#F7F7F5", fontSize: 13, color: "#555", lineHeight: 1.65 }}>
                        {DOMAIN_DESC[domain]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>TOP COLLECTIVE THEMES</div>
              {topStrengths.map((s, i) => {
                const person = people.find((p) => p.strengths.includes(s));
                const domain = person?.strengthDomains[person.strengths.indexOf(s)] || "Thinking";
                const count = filtered.filter((p) => p.strengths.includes(s)).length;
                const isOpen = openStrength === s;
                return (
                  <div key={s} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 15, color: "#888", fontWeight: 900, width: 18 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div
                          onClick={() => setOpenStrength(isOpen ? null : s)}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 17, fontWeight: 800, color: "#131313" }}>{s}</span>
                            <span style={{ fontSize: 12, color: "#BBBBB5" }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, color: STRENGTHS_DOMAINS[domain], letterSpacing: "0.04em" }}>{domain}</span>
                            <span style={{ fontSize: 16, color: "#7A7A7A" }}>{count}/{total}</span>
                          </div>
                        </div>
                        <MiniBar value={count} max={total} color={STRENGTHS_DOMAINS[domain]} height={3} />
                        {isOpen && STRENGTH_DESC[s] && (
                          <div style={{ marginTop: 8, padding: "10px 14px", borderLeft: `3px solid ${STRENGTHS_DOMAINS[domain]}`, background: "#F7F7F5", fontSize: 13, color: "#555", lineHeight: 1.65 }}>
                            {STRENGTH_DESC[s]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>INDIVIDUAL TOP-5 THEMES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
              {filtered.map((p) => {
                const { similar, different } = findSimilarAndDifferent(p, filtered);
                const sharedCount = similar ? strengthSimilarity(p, similar) : 0;
                return (
                  <div key={p.id} onClick={() => onSelectPerson(p)} style={{ background: "#F7F7F5", padding: "16px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#141414"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "#F7F7F5"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8E8E5", border: `1.5px solid ${pulseColor(p.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#131313" }}>{initials(p.name)}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#131313" }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "#7A7A7A" }}>{p.role}</div>
                      </div>
                    </div>
                    {p.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: STRENGTHS_DOMAINS[p.strengthDomains[i]], flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "#7A7A7A" }}>{s}</span>
                        <span style={{ fontSize: 11, color: "#888", marginLeft: "auto" }}>{p.strengthDomains[i].slice(0, 3).toUpperCase()}</span>
                      </div>
                    ))}
                    {(similar || different) && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #ddd", display: "flex", flexDirection: "column", gap: 6 }}>
                        {similar && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: "#2E7354", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, minWidth: 72 }}>Most similar</span>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#D8D8D4", border: `1.5px solid ${pulseColor(similar.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#131313", flexShrink: 0 }}>{initials(similar.name)}</div>
                            <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>{similar.name.split(" ")[0]}</span>
                            <span style={{ fontSize: 11, color: "#BBBBB5", marginLeft: "auto" }}>{sharedCount} shared</span>
                          </div>
                        )}
                        {different && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: "#EA5B32", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, minWidth: 72 }}>Most different</span>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#D8D8D4", border: `1.5px solid ${pulseColor(different.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#131313", flexShrink: 0 }}>{initials(different.name)}</div>
                            <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>{different.name.split(" ")[0]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ENNEAGRAM */}
      {framework === "enneagram" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>TYPE DISTRIBUTION</div>
              {ennCounts.map(([type, count]) => {
                const n = parseInt(type);
                const hue = n * 40;
                const color = `hsl(${hue},60%,55%)`;
                const isOpen = openEnn === type;
                const hasDesc = n !== 0 && !!ENNEAGRAM_DESC[n];
                return (
                  <div key={type} style={{ marginBottom: 16 }}>
                    <div
                      onClick={() => hasDesc && setOpenEnn(isOpen ? null : type)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, cursor: hasDesc ? "pointer" : "default" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{n === 0 ? "N/A" : `E${type}`}</span>
                        <span style={{ fontSize: 15, color: "#6B6B6B" }}>{n === 0 ? "Not listed" : ENNEAGRAM_LABELS[n]}</span>
                        {hasDesc && <span style={{ fontSize: 12, color: "#BBBBB5" }}>{isOpen ? "▲" : "▼"}</span>}
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#131313" }}>{count}</span>
                    </div>
                    <MiniBar value={count as number} max={total} color={color} height={4} />
                    {isOpen && ENNEAGRAM_DESC[n] && (
                      <div style={{ marginTop: 8, padding: "10px 14px", borderLeft: `3px solid ${color}`, background: "#F7F7F5", fontSize: 13, color: "#555", lineHeight: 1.65 }}>
                        {ENNEAGRAM_DESC[n]}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {filtered.filter((p) => p.enneagram == n).map((p) => (
                        <div key={p.id} onClick={(e) => { e.stopPropagation(); onSelectPerson(p); }} style={{ fontSize: 13, color: "#7A7A7A", background: "#E8E8E5", padding: "2px 6px", cursor: "pointer" }}>{p.name.split(" ")[0]}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>TEAM INSIGHTS</div>
              <div style={{ fontSize: 17, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>
                {ennCounts[0] && <>{`The dominant type in this group is `}<span style={{ color: "#131313", fontWeight: 700 }}>E{ennCounts[0][0]} ({ENNEAGRAM_LABELS[parseInt(ennCounts[0][0])]})</span>. </>}
                {ennCounts.length >= 2 && <>{`Alongside `}<span style={{ color: "#131313", fontWeight: 700 }}>E{ennCounts[1][0]} ({ENNEAGRAM_LABELS[parseInt(ennCounts[1][0])]})</span>{`, this combination tends to be high-output and people-first.`}</>}
              </div>
              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.05em", marginBottom: 12 }}>ALL NINE TYPES</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                    const has = filtered.filter((p) => p.enneagram === n);
                    const hue = n * 40;
                    const isOpen = openEnn === `ref${n}`;
                    return (
                      <div key={n} onClick={() => setOpenEnn(isOpen ? null : `ref${n}`)} style={{ background: "#FFFFFF", border: "1px solid #E8E8E5", padding: "10px 8px", opacity: has.length ? 1 : 0.3, cursor: "pointer" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: `hsl(${hue},60%,55%)`, lineHeight: 1 }}>{n}</div>
                        <div style={{ fontSize: 11, color: "#7A7A7A", marginTop: 2 }}>{ENNEAGRAM_LABELS[n]}</div>
                        <div style={{ fontSize: 14, color: "#131313", fontWeight: 700, marginTop: 4 }}>{has.length}</div>
                        {isOpen && ENNEAGRAM_DESC[n] && (
                          <div style={{ marginTop: 8, fontSize: 11, color: "#555", lineHeight: 1.5, borderTop: `1px solid hsl(${hue},60%,85%)`, paddingTop: 6 }}>{ENNEAGRAM_DESC[n]}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>INDIVIDUAL TYPES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
              {filtered.map((p) => {
                const hue = p.enneagram * 40;
                const color = `hsl(${hue},60%,55%)`;
                return (
                  <div key={p.id} onClick={() => onSelectPerson(p)} style={{ background: "#FAFAFA", padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#141414"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "#F7F7F5"}
                  >
                    <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, minWidth: 32 }}>{p.enneagram === 0 ? "?" : p.enneagram}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#131313" }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "#7A7A7A", marginTop: 1 }}>{p.enneagram === 0 ? "Not listed" : ENNEAGRAM_LABELS[p.enneagram]}</div>
                      <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{p.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WORK STYLE */}
      {framework === "workstyle" && (() => {
        const peakData = countField(filtered, (p) => bucketHours(p.peak_hours ?? ""));
        const prefData = countField(filtered, (p) => bucketHours(p.pref_hours ?? ""));
        const learningData = countField(filtered, (p) => bucketStyle(p.learning_style ?? "", "learning"));
        const ideationData = countField(filtered, (p) => bucketStyle(p.ideation_style ?? "", "ideation"));
        const introData = countField(filtered, (p) => bucketIntroExtro(p.intro_extro ?? "") ?? "");
        const introTotal = introData.reduce((s, d) => s + d.count, 0);

        const HoursChart = ({ data, title }: { data: { label: string; count: number; people: Person[] }[]; title: string }) => {
          const ordered = HOUR_ORDER.map((h) => data.find((d) => d.label === h)).filter(Boolean) as typeof data;
          const others = data.filter((d) => !HOUR_ORDER.includes(d.label));
          const all = [...ordered, ...others];
          const maxCount = Math.max(...all.map((d) => d.count), 1);
          return (
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>{title}</div>
              {all.length === 0 ? <div style={{ fontSize: 14, color: "#BBBBB5" }}>No data yet</div> : all.map((d) => (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: "#333", fontWeight: 600 }}>{d.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#131313" }}>{d.count}</span>
                  </div>
                  <div style={{ height: 10, background: "#E8E8E5", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(d.count / maxCount) * 100}%`, background: HOUR_COLORS[d.label] ?? "#EA5B32", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                    {d.people.map((p) => <span key={p.id} onClick={() => onSelectPerson(p)} style={{ fontSize: 11, color: "#7A7A7A", background: "#E8E8E5", padding: "1px 6px", cursor: "pointer" }}>{p.name.split(" ")[0]}</span>)}
                  </div>
                </div>
              ))}
            </div>
          );
        };

        const StyleChart = ({ data, title, color }: { data: { label: string; count: number; people: Person[] }[]; title: string; color: string }) => {
          const maxCount = Math.max(...data.map((d) => d.count), 1);
          return (
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>{title}</div>
              {data.length === 0 ? <div style={{ fontSize: 14, color: "#BBBBB5" }}>No data yet</div> : data.map((d) => (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: "#333", fontWeight: 600 }}>{d.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#131313" }}>{d.count}</span>
                  </div>
                  <div style={{ height: 8, background: "#E8E8E5", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(d.count / maxCount) * 100}%`, background: color, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                    {d.people.map((p) => <span key={p.id} onClick={() => onSelectPerson(p)} style={{ fontSize: 11, color: "#7A7A7A", background: "#E8E8E5", padding: "1px 6px", cursor: "pointer" }}>{p.name.split(" ")[0]}</span>)}
                  </div>
                </div>
              ))}
            </div>
          );
        };

        const INTRO_COLORS: Record<string, string> = { Introvert: "#3565E3", Ambivert: "#7A7A7A", Extrovert: "#EA5B32" };

        return (
          <div>
            {/* Intro/Extro spectrum */}
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>INTROVERT · AMBIVERT · EXTROVERT SPECTRUM</div>
              {introTotal > 0 ? (
                <>
                  <div style={{ display: "flex", height: 36, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                    {["Introvert", "Ambivert", "Extrovert"].map((label) => {
                      const entry = introData.find((d) => d.label === label);
                      const pct = entry ? (entry.count / introTotal) * 100 : 0;
                      if (pct === 0) return null;
                      return (
                        <div key={label} style={{ width: `${pct}%`, background: INTRO_COLORS[label], display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{entry?.count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {["Introvert", "Ambivert", "Extrovert"].map((label) => {
                      const entry = introData.find((d) => d.label === label);
                      return (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, background: INTRO_COLORS[label], borderRadius: 2 }} />
                          <span style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: 13, color: "#7A7A7A" }}>{entry?.count ?? 0} · {entry ? Math.round((entry.count / introTotal) * 100) : 0}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
                    {["Introvert", "Ambivert", "Extrovert"].map((label) => {
                      const entry = introData.find((d) => d.label === label);
                      return entry ? (
                        <div key={label} style={{ background: "#F7F7F5", padding: "12px" }}>
                          <div style={{ fontSize: 12, color: INTRO_COLORS[label], fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>{label.toUpperCase()}</div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {entry.people.map((p) => <span key={p.id} onClick={() => onSelectPerson(p)} style={{ fontSize: 12, color: "#555", background: "#E8E8E5", padding: "2px 8px", cursor: "pointer" }}>{p.name.split(" ")[0]}</span>)}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </>
              ) : <div style={{ fontSize: 14, color: "#BBBBB5" }}>No data yet</div>}
            </div>

            {/* Hours charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <HoursChart data={peakData} title="PEAK PERFORMANCE HOURS" />
              <HoursChart data={prefData} title="PREFERRED WORKING HOURS" />
            </div>

            {/* Style charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StyleChart data={learningData} title="PRIMARY LEARNING STYLE" color="#2E7354" />
              <StyleChart data={ideationData} title="PRIMARY IDEATION STYLE" color="#EDC157" />
            </div>
          </div>
        );
      })()}

      {/* MYERS-BRIGGS */}
      {framework === "mbti" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>TYPE GROUP DISTRIBUTION</div>
              {Object.entries(MBTI_GROUPS).map(([group, types]) => {
                const count = filtered.filter((p) => types.includes(p.mbti)).length;
                const color = mbtiColor(types[0]);
                return (
                  <div key={group} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 800, color }}>{group}</span>
                        <span style={{ fontSize: 13, color: "#7A7A7A", marginLeft: 8 }}>{types.join(" · ")}</span>
                      </div>
                      <span style={{ fontSize: 24, fontWeight: 900, color: "#131313" }}>{count}</span>
                    </div>
                    <MiniBar value={count} max={total} color={color} height={5} />
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>TYPE BREAKDOWN</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
                {mbtiCounts.map(([type, count]) => {
                  const isOpen = openMbti === `bd:${type}`;
                  return (
                    <div key={type} onClick={() => setOpenMbti(isOpen ? null : `bd:${type}`)} style={{ background: "#F7F7F5", padding: "10px 8px", borderTop: `2px solid ${mbtiColor(type)}`, cursor: "pointer" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: mbtiColor(type), lineHeight: 1 }}>{type}</div>
                      <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{mbtiGroup(type)}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#131313", marginTop: 4 }}>{count}</div>
                      {isOpen && MBTI_DESC[type] && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#555", lineHeight: 1.5, borderTop: `1px solid ${mbtiColor(type)}44`, paddingTop: 6 }}>{MBTI_DESC[type]}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>INDIVIDUAL TYPES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
              {filtered.map((p) => {
                const isOpen = openMbti === `ind:${p.id}`;
                return (
                  <div key={p.id} style={{ background: "#FAFAFA", padding: "14px", cursor: "pointer", borderTop: `2px solid ${mbtiColor(p.mbti)}`, transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#f0f0ee"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }} onClick={() => onSelectPerson(p)}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: mbtiColor(p.mbti), lineHeight: 1, minWidth: 44 }}>{p.mbti}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#131313" }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "#7A7A7A", marginTop: 1 }}>{mbtiGroup(p.mbti)}</div>
                        <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{p.role}</div>
                      </div>
                      {MBTI_DESC[p.mbti] && (
                        <span
                          onClick={(e) => { e.stopPropagation(); setOpenMbti(isOpen ? null : `ind:${p.id}`); }}
                          style={{ fontSize: 11, color: mbtiColor(p.mbti), border: `1px solid ${mbtiColor(p.mbti)}44`, padding: "2px 6px", flexShrink: 0 }}
                        >{isOpen ? "▲" : "▼"}</span>
                      )}
                    </div>
                    {isOpen && MBTI_DESC[p.mbti] && (
                      <div style={{ marginTop: 10, padding: "10px 14px", borderLeft: `3px solid ${mbtiColor(p.mbti)}`, background: "#FFFFFF", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                        {MBTI_DESC[p.mbti]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
