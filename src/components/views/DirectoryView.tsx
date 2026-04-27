"use client";

import { useState } from "react";
import { PEOPLE, STRENGTHS_DOMAINS } from "@/lib/constants";
import { pulseColor, mbtiColor, mbtiGroup } from "@/lib/utils";
import type { Person, Role } from "@/lib/types";
import Tag from "@/components/ui/Tag";

interface DirectoryViewProps {
  role: Role;
  onSelectPerson: (p: Person) => void;
  people?: Person[];
}

export default function DirectoryView({ role, onSelectPerson, people = PEOPLE }: DirectoryViewProps) {
  const [search, setSearch] = useState("");
  const canSeeSensitive = role === "leadership" || role === "coach";

  const visible = people.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.pod.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ background: "#FFFFFF", padding: "14px 20px", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH BY NAME, ROLE, OR POD..."
          style={{ background: "transparent", border: "none", borderBottom: "1px solid #333", color: "#131313", fontSize: 15, letterSpacing: "0.04em", width: "100%", padding: "6px 0", outline: "none", fontFamily: "inherit", textTransform: "uppercase" }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
        {visible.map((p, i) => (
          <div key={i} onClick={() => onSelectPerson(p)}
            style={{ background: "#FFFFFF", padding: "18px 16px", cursor: "pointer", borderLeft: "3px solid transparent", transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#161616"; (e.currentTarget as HTMLDivElement).style.borderLeftColor = "#EA5B32"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLDivElement).style.borderLeftColor = "transparent"; }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#D8D8D4", border: `2px solid ${canSeeSensitive ? pulseColor(p.pulse) : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#131313", flexShrink: 0 }}>
                {p.avatar}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#131313", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 2 }}>{p.role}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  <Tag color="#131313">{p.pod}</Tag>
                  <Tag color="#131313">{p.location}</Tag>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: mbtiColor(p.mbti), letterSpacing: "0.06em" }}>{p.mbti}</span>
                  <span style={{ fontSize: 11, color: "#7A7A7A" }}>·</span>
                  <span style={{ fontSize: 11, color: `hsl(${p.enneagram * 40},60%,55%)`, letterSpacing: "0.06em" }}>E{p.enneagram}</span>
                  <span style={{ fontSize: 11, color: "#7A7A7A" }}>·</span>
                  <span style={{ fontSize: 11, color: STRENGTHS_DOMAINS[p.strengthDomains[0]], letterSpacing: "0.06em" }}>{p.strengths[0]}</span>
                </div>
              </div>
            </div>
            {canSeeSensitive && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.04em" }}>PULSE</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: pulseColor(p.pulse) }}>{p.pulse}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
