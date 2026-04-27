"use client";

import { useState, useEffect } from "react";
import type { Person, Role, PulseApiData, OnaApiData } from "@/lib/types";
import { PEOPLE, PULSE_DATA, ONA_DATA } from "@/lib/constants";
import PersonModal from "./PersonModal";
import PulseView from "./views/PulseView";
import SatisfactionView from "./views/SatisfactionView";
import StressView from "./views/StressView";
import ActionsView from "./views/ActionsView";
import TeamDNAView from "./views/TeamDNAView";
import DirectoryView from "./views/DirectoryView";

const PINS = {
  leadership: process.env.NEXT_PUBLIC_LEADERSHIP_PIN || "1111",
  coach: process.env.NEXT_PUBLIC_COACH_PIN || "2222",
};

const NAV = [
  { id: "pulse", label: "PULSE" },
  { id: "satisfaction", label: "SATISFACTION" },
  { id: "stress", label: "STRESS" },
  { id: "actions", label: "ACTIONS" },
  { id: "teamdna", label: "TEAM DNA" },
  { id: "directory", label: "DIRECTORY" },
];

const ROLES = [
  { id: "ic", label: "EVERYONE" },
  { id: "coach", label: "COACHES 🔒" },
  { id: "leadership", label: "LEADERSHIP 🔒" },
];

export default function Dashboard() {
  const [view, setView] = useState("pulse");
  const [role, setRole] = useState<Role>("ic");
  const [authOpen, setAuthOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingRole, setPendingRole] = useState<"leadership" | "coach" | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [pulseApi, setPulseApi] = useState<PulseApiData | null>(null);
  const [onaApi, setOnaApi] = useState<OnaApiData | null>(null);
  const [people, setPeople] = useState<Person[]>(PEOPLE);

  useEffect(() => {
    fetch("/api/rippling")
      .then((r) => r.json())
      .then((d: { pulse: PulseApiData; ona: OnaApiData }) => {
        setPulseApi(d.pulse);
        setOnaApi(d.ona);
      })
      .catch(console.error);

    fetch("/api/directory")
      .then((r) => r.json())
      .then((d: { people: Person[] }) => {
        if (d.people?.length) setPeople(d.people);
      })
      .catch(console.error);
  }, []);

  // Derive FLOWERS list from live pulse flowerCounts, fall back to PULSE_DATA mock
  const flowerCounts = pulseApi?.flowerCounts ?? {};
  const liveFlowers = Object.entries(flowerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => ({ name, n, team: "" }));

  // Fall back to mock ONA nodes if live data not ready
  const onaNodes = onaApi?.nodes ?? ONA_DATA.nodes;
  const onaAlerts = onaApi?.alerts ?? ONA_DATA.alerts;

  const switchRole = (r: Role) => {
    if (r === "ic") { setRole("ic"); return; }
    setPendingRole(r as "leadership" | "coach");
    setPin("");
    setAuthOpen(true);
  };

  const submitPin = () => {
    if (pendingRole && pin === PINS[pendingRole]) {
      setRole(pendingRole);
      setAuthOpen(false);
    } else {
      setPin("WRONG PIN");
      setTimeout(() => setPin(""), 1000);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#131313", minHeight: "100vh", color: "#131313" }}>

      {/* Auth modal */}
      {authOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#FFFFFF", padding: "40px", width: 320, borderTop: "3px solid #FF4500" }}>
            <div style={{ fontSize: 15, color: "#607D85", letterSpacing: "0.05em", marginBottom: 8 }}>ACCESS REQUIRED</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#131313", marginBottom: 24 }}>{pendingRole?.toUpperCase()} VIEW</div>
            <input
              type="password" value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              placeholder="ENTER PIN" maxLength={4}
              style={{ background: "#131313", border: "1px solid #333", color: pin === "WRONG PIN" ? "#EA5B32" : "#fff", fontSize: 24, letterSpacing: "0.3em", padding: "12px 16px", width: "100%", outline: "none", fontFamily: "inherit", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submitPin} style={{ flex: 1, background: "#EA5B32", color: "#131313", border: "none", padding: "12px", fontSize: 15, letterSpacing: "0.05em", cursor: "pointer", fontWeight: 700 }}>ENTER</button>
              <button onClick={() => setAuthOpen(false)} style={{ flex: 1, background: "transparent", color: "#666", border: "1px solid #444", padding: "12px", fontSize: 15, letterSpacing: "0.05em", cursor: "pointer" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Person modal */}
      {selectedPerson && <PersonModal person={selectedPerson} onClose={() => setSelectedPerson(null)} role={role} />}

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "stretch", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0" }}>
          {/* Logo — drop brains-logo.png into /public/ to activate */}
          <img
            src="/brains-logo.png"
            alt="Brains"
            style={{ height: 26, filter: "brightness(0) invert(1)", display: "block" }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const next = el.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }}
          />
          {/* Fallback SVG text (hidden when logo loads) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36" style={{ height: 30, display: "none" }}>
            <text x="0" y="28" fontFamily="DM Sans,sans-serif" fontWeight="900" fontSize="30" fill="#C0DFEC" letterSpacing="-1">BRAINS</text>
          </svg>
          <div style={{ width: 1, height: 20, background: "#333" }} />
          <div style={{ fontSize: 15, color: "#8BBBCC", letterSpacing: "0.05em" }}>CULTURE DASHBOARD</div>
          <div style={{ fontSize: 13, color: "#607D85", letterSpacing: "0.04em" }}>— APR 2026</div>
        </div>
        <div style={{ display: "flex", gap: 1, alignItems: "stretch" }}>
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => switchRole(r.id as Role)} style={{
              background: role === r.id ? "#EA5B32" : "transparent",
              color: role === r.id ? "#fff" : "#444",
              border: "none", padding: "0 16px", fontSize: 13, letterSpacing: "0.05em", cursor: "pointer",
              fontWeight: role === r.id ? 800 : 400, transition: "all 0.2s", fontFamily: "inherit",
            }}>{r.label}</button>
          ))}
        </div>
      </header>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex" }}>
        {/* Home button */}
        <button
          onClick={() => setView("pulse")}
          style={{ background: "transparent", border: "none", color: "#444", padding: "14px 16px", fontSize: 18, cursor: "pointer", fontFamily: "inherit", marginBottom: -1, lineHeight: 1 }}
          title="Home"
        >⌂</button>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            background: "transparent", border: "none",
            borderBottom: view === n.id ? "2px solid #FF4500" : "2px solid transparent",
            color: view === n.id ? "#fff" : "#444",
            padding: "14px 20px", fontSize: 15, letterSpacing: "0.05em",
            cursor: "pointer", fontWeight: view === n.id ? 800 : 400, transition: "all 0.15s",
            fontFamily: "inherit", marginBottom: -1,
          }}>{n.label}</button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: "16px 16px 0" }}>
        {view === "pulse"        && <PulseView pulseData={pulseApi} role={role} />}
        {view === "satisfaction" && <SatisfactionView pulseData={pulseApi} onaData={onaApi} flowers={liveFlowers.length ? liveFlowers : undefined} />}
        {view === "stress"       && <StressView onaNodes={onaNodes} onaAlerts={onaAlerts} />}
        {view === "actions"      && <ActionsView role={role} onSelectPerson={setSelectedPerson} />}
        {view === "teamdna"      && <TeamDNAView onSelectPerson={setSelectedPerson} people={people} />}
        {view === "directory"    && <DirectoryView role={role} onSelectPerson={setSelectedPerson} people={people} />}
      </main>

      <footer style={{ padding: "20px 24px", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 1 }}>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.04em" }}>DATA: RIPPLING (PULSE + ONA) · HARVEST TIME TRACKING · LAST SYNC: TODAY</div>
        <div style={{ fontSize: 13, color: "#7A7A7A", letterSpacing: "0.04em" }}>WE CARE FOR EACH OTHER · WE DO GOOD WORK · WE LOOK FOR MAGIC · WE SPARK JOY</div>
      </footer>
    </div>
  );
}
