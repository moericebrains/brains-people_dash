"use client";

import { useState } from "react";
import { PEOPLE, STRENGTHS_DOMAINS, ENNEAGRAM_LABELS, MBTI_GROUPS } from "@/lib/constants";
import { pulseColor, mbtiGroup, mbtiColor } from "@/lib/utils";
import type { Person } from "@/lib/types";
import MiniBar from "@/components/ui/MiniBar";

interface TeamDNAViewProps {
  onSelectPerson: (p: Person) => void;
  people?: Person[];
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

export default function TeamDNAView({ onSelectPerson, people = PEOPLE }: TeamDNAViewProps) {
  const [lens, setLens] = useState("org");
  const [framework, setFramework] = useState("strengths");

  const PODS = [...new Set(people.map((p) => p.pod).filter(Boolean))];
  const THEMES = [...new Set(people.map((p) => p.theme).filter(Boolean))];
  const lensOptions = [
    { id: "org", label: "FULL ORG" },
    ...PODS.map((p) => ({ id: `pod:${p}`, label: p.toUpperCase() })),
    ...THEMES.map((t) => ({ id: `theme:${t}`, label: t.toUpperCase() })),
  ];

  const filtered = lens === "org" ? people
    : lens.startsWith("pod:") ? people.filter((p) => p.pod === lens.slice(4))
    : people.filter((p) => p.theme === lens.slice(6));

  const domainCounts = getDomainCounts(filtered);
  const topStrengths = getTopStrengths(filtered);
  const ennCounts = getEnneagramCounts(filtered);
  const mbtiCounts = getMbtiCounts(filtered);
  const total = filtered.length;
  const domainMax = Math.max(...Object.values(domainCounts));

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
        {[["strengths", "STRENGTHSFINDER"], ["enneagram", "ENNEAGRAM"], ["mbti", "MYERS-BRIGGS"]].map(([id, label]) => (
          <button key={id} onClick={() => setFramework(id)} style={{
            background: "transparent", border: "none",
            borderBottom: framework === id ? "2px solid #FF4500" : "2px solid transparent",
            color: framework === id ? "#fff" : "#444", padding: "12px 20px",
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
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D8D8D4", border: `1.5px solid ${pulseColor(p.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#131313" }}>{p.avatar}</div>
            <span style={{ fontSize: 14, color: "#7A7A7A" }}>{p.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* STRENGTHSFINDER */}
      {framework === "strengths" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>STRENGTH DOMAIN DISTRIBUTION</div>
              {Object.entries(domainCounts).map(([domain, count]) => (
                <div key={domain} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, background: STRENGTHS_DOMAINS[domain] }} />
                      <span style={{ fontSize: 16, color: "#333", fontWeight: 600 }}>{domain}</span>
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: STRENGTHS_DOMAINS[domain] }}>{count}</span>
                  </div>
                  <MiniBar value={count} max={domainMax} color={STRENGTHS_DOMAINS[domain]} height={6} />
                  <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 4 }}>
                    {Math.round(count / filtered.reduce((a, p) => a + p.strengthDomains.length, 0) * 100)}% of all top-5 themes
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>TOP COLLECTIVE THEMES</div>
              {topStrengths.map((s, i) => {
                const person = people.find((p) => p.strengths.includes(s));
                const domain = person?.strengthDomains[person.strengths.indexOf(s)] || "Thinking";
                const count = filtered.filter((p) => p.strengths.includes(s)).length;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 15, color: "#888", fontWeight: 900, width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#131313" }}>{s}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, color: STRENGTHS_DOMAINS[domain], letterSpacing: "0.04em" }}>{domain}</span>
                          <span style={{ fontSize: 16, color: "#7A7A7A" }}>{count}/{total}</span>
                        </div>
                      </div>
                      <MiniBar value={count} max={total} color={STRENGTHS_DOMAINS[domain]} height={3} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>INDIVIDUAL TOP-5 THEMES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
              {filtered.map((p) => (
                <div key={p.id} onClick={() => onSelectPerson(p)} style={{ background: "#F7F7F5", padding: "16px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#141414"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "#F7F7F5"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8E8E5", border: `1.5px solid ${pulseColor(p.pulse)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#131313" }}>{p.avatar}</div>
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
                </div>
              ))}
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
                const hue = parseInt(type) * 40;
                const color = `hsl(${hue},60%,55%)`;
                return (
                  <div key={type} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>E{type}</span>
                        <span style={{ fontSize: 15, color: "#6B6B6B" }}>{ENNEAGRAM_LABELS[parseInt(type)]}</span>
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#131313" }}>{count}</span>
                    </div>
                    <MiniBar value={count as number} max={total} color={color} height={4} />
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {filtered.filter((p) => p.enneagram == parseInt(type)).map((p) => (
                        <div key={p.id} onClick={() => onSelectPerson(p)} style={{ fontSize: 13, color: "#7A7A7A", background: "#E8E8E5", padding: "2px 6px", cursor: "pointer" }}>{p.name.split(" ")[0]}</div>
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
                    return (
                      <div key={n} style={{ background: "#FFFFFF", border: "1px solid #E8E8E5", padding: "10px 8px", opacity: has.length ? 1 : 0.3 }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: `hsl(${hue},60%,55%)`, lineHeight: 1 }}>{n}</div>
                        <div style={{ fontSize: 11, color: "#7A7A7A", marginTop: 2 }}>{ENNEAGRAM_LABELS[n]}</div>
                        <div style={{ fontSize: 14, color: "#131313", fontWeight: 700, marginTop: 4 }}>{has.length}</div>
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
                    <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, minWidth: 32 }}>{p.enneagram}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#131313" }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "#7A7A7A", marginTop: 1 }}>{ENNEAGRAM_LABELS[p.enneagram]}</div>
                      <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{p.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                {mbtiCounts.map(([type, count]) => (
                  <div key={type} style={{ background: "#F7F7F5", padding: "10px 8px", borderTop: `2px solid ${mbtiColor(type)}` }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: mbtiColor(type), lineHeight: 1 }}>{type}</div>
                    <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{mbtiGroup(type)}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#131313", marginTop: 4 }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>INDIVIDUAL TYPES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
              {filtered.map((p) => (
                <div key={p.id} onClick={() => onSelectPerson(p)} style={{ background: "#FAFAFA", padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s", borderTop: `2px solid ${mbtiColor(p.mbti)}` }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#141414"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "#F7F7F5"}
                >
                  <div style={{ fontSize: 26, fontWeight: 900, color: mbtiColor(p.mbti), lineHeight: 1, minWidth: 44 }}>{p.mbti}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#131313" }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: "#7A7A7A", marginTop: 1 }}>{mbtiGroup(p.mbti)}</div>
                    <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 1 }}>{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
