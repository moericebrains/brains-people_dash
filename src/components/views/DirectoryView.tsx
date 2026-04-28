"use client";

import { useState, useMemo } from "react";
import { PEOPLE, STRENGTHS_DOMAINS } from "@/lib/constants";
import { mbtiColor } from "@/lib/utils";
import type { Person, Role } from "@/lib/types";

interface DirectoryViewProps {
  role: Role;
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

const AVATAR_COLORS = [
  "var(--bof-green)", "var(--bof-blue)", "var(--bof-orange)",
  "var(--bof-yellow)", "var(--bof-pink)",
];

function getTimezone(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("mountain") || l.includes("mt") || l.includes("denver") || l.includes("colorado") || l.includes("salt lake") || l.includes("phoenix") || l.includes("tucson")) return "MT";
  if (l.includes("central") || l.includes("ct") || l.includes("chicago") || l.includes("dallas") || l.includes("houston") || l.includes("austin") || l.includes("minneapolis")) return "CT";
  if (l.includes("pacific") || l.includes("pt") || l.includes("los angeles") || l.includes("seattle") || l.includes("san francisco") || l.includes("portland") || l.includes("vancouver")) return "PT";
  return "ET";
}

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function avatarTextColor(color: string) {
  return color === "var(--bof-yellow)" || color === "var(--bof-pink)" ? "#131313" : "#F5F5F5";
}

export default function DirectoryView({ onSelectPerson, people = PEOPLE }: DirectoryViewProps) {
  const [search, setSearch] = useState("");
  const [filterPod, setFilterPod] = useState<string | null>(null);
  const [filterLoc, setFilterLoc] = useState<string | null>(null);
  const [filterMissing, setFilterMissing] = useState(false);

  // Collect unique pods + locations
  const pods = useMemo(() => {
    const all = people.flatMap((p) => p.pod ? personPods(p.pod) : []);
    return ALLOWED_PODS.filter((pod) => all.includes(pod));
  }, [people]);
  const locations = useMemo(() => [...new Set(people.map((p) => p.location))].sort(), [people]);
  const missingCount = people.filter((p) => !p.mbti && !p.enneagram && !p.strengths?.length).length;

  const visible = people.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.pod.toLowerCase().includes(q);
    const matchesPod = !filterPod || (p.pod ? personPods(p.pod).includes(filterPod) : false);
    const matchesLoc = !filterLoc || p.location === filterLoc;
    const matchesMissing = !filterMissing || (!p.mbti && !p.enneagram && !p.strengths?.length);
    return matchesSearch && matchesPod && matchesLoc && matchesMissing;
  });

  const isFiltered = filterPod || filterLoc || filterMissing || search;

  return (
    <div>
      {/* Search + filter chips */}
      <div style={{ background: "#FFFFFF", padding: "14px 18px", marginBottom: 8, borderRadius: 4, boxShadow: "var(--shadow-md)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, or pod..."
          style={{
            width: "100%", padding: "10px 14px",
            fontFamily: "var(--font-body-wide)", fontSize: 15,
            border: "1px solid rgba(19,19,19,.15)", borderRadius: 4,
            outline: "none", marginBottom: 12, background: "#FAFAFA",
            color: "#131313",
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", marginRight: 4 }}>Filter</span>

          {/* Pod filters */}
          {pods.map((pod) => (
            <button key={pod} onClick={() => setFilterPod(filterPod === pod ? null : pod)} style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
              padding: "4px 8px", borderRadius: 3, cursor: "pointer", border: "none",
              background: filterPod === pod ? "var(--bof-off-black)" : "rgba(19,19,19,.06)",
              color: filterPod === pod ? "#F5F5F5" : "#131313",
              transition: "all .15s",
            }}>{pod}</button>
          ))}

          {pods.length > 0 && <div style={{ width: 1, height: 18, background: "rgba(19,19,19,.15)", margin: "0 4px" }} />}

          {/* Location filters */}
          {locations.map((loc) => (
            <button key={loc} onClick={() => setFilterLoc(filterLoc === loc ? null : loc)} style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
              padding: "4px 8px", borderRadius: 3, cursor: "pointer", border: "none",
              background: filterLoc === loc ? "var(--bof-off-black)" : "rgba(19,19,19,.06)",
              color: filterLoc === loc ? "#F5F5F5" : "#131313",
              transition: "all .15s",
            }}>{loc}</button>
          ))}

          {locations.length > 0 && <div style={{ width: 1, height: 18, background: "rgba(19,19,19,.15)", margin: "0 4px" }} />}

          {/* Missing data filter */}
          {missingCount > 0 && (
            <button onClick={() => setFilterMissing(!filterMissing)} style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
              padding: "4px 8px", borderRadius: 3, cursor: "pointer",
              background: filterMissing ? "var(--bof-orange)" : "transparent",
              color: filterMissing ? "#F5F5F5" : "#131313",
              border: filterMissing ? "none" : "1px solid rgba(19,19,19,.20)",
              transition: "all .15s",
            }}>Missing assessments · {missingCount}</button>
          )}

          {isFiltered && (
            <button onClick={() => { setSearch(""); setFilterPod(null); setFilterLoc(null); setFilterMissing(false); }} style={{ background: "transparent", border: "none", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(19,19,19,.45)", cursor: "pointer", marginLeft: 4 }}>Clear ×</button>
          )}
        </div>
      </div>

      {/* People grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
        {visible.map((p) => {
          const ac = avatarColor(p.id);
          const missing = !p.mbti && p.enneagram === 0 && !p.strengths?.length;
          const hasMbti = !!p.mbti;
          const hasEnne = p.enneagram > 0;
          const hasStr = p.strengths?.length > 0;

          return (
            <div
              key={p.id}
              onClick={() => onSelectPerson(p)}
              style={{
                background: "#FFFFFF",
                padding: "14px 14px",
                cursor: "pointer",
                borderRadius: 4,
                border: "1px solid rgba(19,19,19,.08)",
                transition: "all .15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--bof-orange)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(19,19,19,.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ac, color: avatarTextColor(ac), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {initials(p.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 15, fontWeight: 700, color: "#131313", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 12, color: "rgba(19,19,19,.45)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.role}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, background: "rgba(19,19,19,.06)", color: "rgba(19,19,19,.55)", padding: "2px 6px", borderRadius: 2, letterSpacing: ".06em" }}>{p.pod}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, background: "rgba(19,19,19,.06)", color: "rgba(19,19,19,.55)", padding: "2px 6px", borderRadius: 2, letterSpacing: ".06em" }}>{p.location}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, background: "rgba(53,101,227,.10)", color: "var(--bof-blue)", padding: "2px 6px", borderRadius: 2, letterSpacing: ".06em" }}>{getTimezone(p.location)}</span>
              </div>

              {missing ? (
                <div style={{ background: "rgba(19,19,19,.03)", border: "1px dashed rgba(19,19,19,.18)", borderRadius: 3, padding: "6px 8px", fontFamily: "var(--font-body-wide)", fontSize: 11, color: "rgba(19,19,19,.50)" }}>
                  Hasn&apos;t shared assessments —{" "}
                  <span style={{ color: "var(--bof-orange)", fontWeight: 700 }}>ask in next 1:1</span>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {hasMbti && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: mbtiColor(p.mbti), letterSpacing: ".06em" }}>{p.mbti}</span>}
                  {hasEnne && hasMbti && <span style={{ color: "rgba(19,19,19,.25)", fontSize: 11 }}>·</span>}
                  {hasEnne && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: `hsl(${p.enneagram * 40},55%,45%)`, letterSpacing: ".06em" }}>E{p.enneagram}</span>}
                  {hasStr && (hasMbti || hasEnne) && <span style={{ color: "rgba(19,19,19,.25)", fontSize: 11 }}>·</span>}
                  {hasStr && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: STRENGTHS_DOMAINS[p.strengthDomains?.[0]] || "rgba(19,19,19,.45)", letterSpacing: ".06em" }}>{p.strengths[0]}</span>}
                  {!hasMbti && <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--bof-orange)", fontWeight: 700 }}>No MBTI — ask in 1:1</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div style={{ background: "#FFFFFF", padding: "40px 20px", borderRadius: 4, textAlign: "center", boxShadow: "var(--shadow-md)", marginTop: 4 }}>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 15, color: "rgba(19,19,19,.45)" }}>No teammates match this filter.</div>
          <button onClick={() => { setSearch(""); setFilterPod(null); setFilterLoc(null); setFilterMissing(false); }} style={{ marginTop: 10, background: "transparent", border: "1px solid rgba(19,19,19,.20)", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 3, cursor: "pointer", color: "#131313" }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
