"use client";

import { useState, useEffect } from "react";
import type { Person, Role, PulseApiData, OnaApiData, HarvestData } from "@/lib/types";
import { PEOPLE, PULSE_DATA, ONA_DATA, STRESS_DATA } from "@/lib/constants";
import PersonModal from "./PersonModal";
import PulseView from "./views/PulseView";
import SatisfactionView from "./views/SatisfactionView";
import StressView from "./views/StressView";
import ActionsView from "./views/ActionsView";
import TeamDNAView from "./views/TeamDNAView";
import DirectoryView from "./views/DirectoryView";

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || "WLGforpresident2028";

const PINS = {
  leadership: process.env.NEXT_PUBLIC_LEADERSHIP_PIN || "1111",
  coach: process.env.NEXT_PUBLIC_COACH_PIN || "2222",
};

const NAV = [
  { id: "pulse", label: "STRESS" },
  { id: "satisfaction", label: "SATISFACTION" },
  { id: "stress", label: "UTILIZATION" },
  { id: "actions", label: "ACTIONS" },
  { id: "teamdna", label: "PERSONALITY" },
  { id: "directory", label: "DIRECTORY" },
];

const ROLES = [
  { id: "ic", label: "EVERYONE" },
  { id: "coach", label: "COACHES 🔒" },
  { id: "leadership", label: "LEADERSHIP 🔒" },
];

export default function Dashboard() {
  const [siteUnlocked, setSiteUnlocked] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [siteError, setSiteError] = useState(false);
  const [view, setView] = useState("pulse");
  const [role, setRole] = useState<Role>("ic");
  const [authOpen, setAuthOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingRole, setPendingRole] = useState<"leadership" | "coach" | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [pulseApi, setPulseApi] = useState<PulseApiData | null>(null);
  const [onaApi, setOnaApi] = useState<OnaApiData | null>(null);
  const [harvestApi, setHarvestApi] = useState<HarvestData | null>(null);
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

    fetch("/api/harvest")
      .then((r) => r.json())
      .then((d: HarvestData) => setHarvestApi(d))
      .catch(console.error);

    // Listen for prev/next navigation from PersonModal drawer
    const handleSelectPerson = (e: Event) => {
      const custom = e as CustomEvent<Person>;
      setSelectedPerson(custom.detail);
    };
    window.addEventListener("peopledash:selectperson", handleSelectPerson);
    return () => window.removeEventListener("peopledash:selectperson", handleSelectPerson);
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
    if (r === "ic") {
      setRole("ic");
      if (view === "stress") setView("pulse");
      return;
    }
    setPendingRole(r as "leadership" | "coach");
    setPin("");
    setAuthOpen(true);
  };

  const submitPin = () => {
    if (pendingRole && pin === PINS[pendingRole]) {
      setRole(pendingRole);
      setAuthOpen(false);
      if (pendingRole === "coach" && view === "stress") setView("pulse");
    } else {
      setPin("WRONG PIN");
      setTimeout(() => setPin(""), 1000);
    }
  };

  if (!siteUnlocked) {
    const submit = () => {
      if (siteInput === SITE_PASSWORD) {
        setSiteUnlocked(true);
      } else {
        setSiteError(true);
        setSiteInput("");
        setTimeout(() => setSiteError(false), 1200);
      }
    };
    return (
      <div style={{ background: "var(--bof-off-black, #131313)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#FFFFFF", padding: "48px 44px", width: 360, borderTop: "3px solid var(--bof-orange, #EA5B32)" }}>
          <img src="/brains-logo.png" alt="Brains" style={{ height: 20, marginBottom: 28, filter: "none", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 28, color: "#131313", marginBottom: 6, letterSpacing: ".01em" }}>People Dashboard</div>
          <div style={{ fontFamily: "var(--font-body-wide)", fontSize: 13, color: "rgba(19,19,19,.45)", marginBottom: 28 }}>Internal · Brains agency</div>
          <input
            type="password"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password"
            style={{ width: "100%", padding: "12px 14px", fontFamily: "var(--font-body-wide)", fontSize: 15, border: siteError ? "1px solid var(--bof-orange)" : "1px solid rgba(19,19,19,.20)", borderRadius: 3, outline: "none", marginBottom: 12, background: siteError ? "#FEF0EE" : "#FAFAFA", color: "#131313", boxSizing: "border-box" }}
          />
          <button onClick={submit} style={{ width: "100%", background: "var(--bof-orange, #EA5B32)", color: "#fff", border: "none", padding: "13px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
            {siteError ? "Wrong password" : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bof-off-black, #131313)", minHeight: "100vh", color: "#131313" }}>

      {/* Auth modal */}
      {authOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#FFFFFF", padding: "40px", width: 320, borderTop: "3px solid var(--bof-orange, #EA5B32)" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(19,19,19,.55)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Access required</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 32, color: "#131313", marginBottom: 24, letterSpacing: ".01em" }}>{pendingRole} view</div>
            <input
              type="password" value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              placeholder="Enter PIN" maxLength={4}
              style={{ background: "#131313", border: "1px solid #333", color: pin === "WRONG PIN" ? "var(--bof-orange)" : "#fff", fontSize: 24, letterSpacing: "0.3em", padding: "12px 16px", width: "100%", outline: "none", fontFamily: "inherit", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submitPin} style={{ flex: 1, background: "var(--bof-orange, #EA5B32)", color: "#fff", border: "none", padding: "12px", fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-body)" }}>Enter</button>
              <button onClick={() => setAuthOpen(false)} style={{ flex: 1, background: "transparent", color: "#666", border: "1px solid #444", padding: "12px", fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--font-body)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Person drawer */}
      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          role={role}
          people={people}
        />
      )}

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(245,245,245,.10)", padding: "0 24px", display: "flex", alignItems: "stretch", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0" }}>
          <img
            src="/brains-logo.png"
            alt="Brains"
            style={{ height: 22, filter: "brightness(0) invert(1)", display: "block" }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const next = el.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }}
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36" style={{ height: 26, display: "none" }}>
            <text x="0" y="28" fontFamily="sans-serif" fontWeight="700" fontSize="26" fill="#C0DFEC" letterSpacing="-1">BRAINS</text>
          </svg>
          <div style={{ width: 1, height: 18, background: "rgba(245,245,245,.15)" }} />
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "rgba(245,245,245,.55)", letterSpacing: ".14em", textTransform: "uppercase" }}>People Dashboard</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(245,245,245,.35)", letterSpacing: ".08em" }}>— Apr 2026</div>
        </div>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => switchRole(r.id as Role)} style={{
              background: role === r.id ? "var(--bof-orange, #EA5B32)" : "transparent",
              color: role === r.id ? "#fff" : "rgba(245,245,245,.45)",
              border: "none", padding: "0 16px",
              fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
              cursor: "pointer", fontWeight: 700, transition: "all 0.2s",
              borderRadius: role === r.id ? 4 : 0,
              margin: "8px 2px",
            }}>{r.label}</button>
          ))}
        </div>
      </header>

      {/* Visibility strip */}
      <div style={{ background: "rgba(255,255,255,.04)", borderBottom: "1px solid rgba(245,245,245,.08)", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,245,.55)", display: "flex", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sparks/spark-fill-2.svg" alt="" style={{ width: 11, height: 11, filter: "invert(1)", opacity: .5 }} />
          Viewing as {role === "ic" ? "Everyone" : role === "coach" ? "Coach" : "Leadership"}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(245,245,245,.35)", letterSpacing: ".10em", textTransform: "uppercase" }}>
          {role === "ic" && "Aggregates only — no individuals named"}
          {role === "coach" && "Your coachees + flagged team members"}
          {role === "leadership" && "Full org view + watchlist"}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(245,245,245,.10)", padding: "0 24px", display: "flex" }}>
        <button
          onClick={() => setView("pulse")}
          style={{ background: "transparent", border: "none", color: "rgba(245,245,245,.45)", padding: "14px 14px 12px", fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: -1, lineHeight: 1 }}
          title="Home"
        >⌂</button>
        {NAV.filter((n) => n.id !== "stress" || role === "leadership").map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            background: "transparent", border: "none",
            borderBottom: view === n.id ? "2px solid var(--bof-orange, #EA5B32)" : "2px solid transparent",
            color: view === n.id ? "#fff" : "rgba(245,245,245,.45)",
            padding: "14px 18px 12px",
            fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 700, transition: "all 0.15s",
            marginBottom: -1,
          }}>{n.label}</button>
        ))}
      </nav>

      {/* Meta bar */}
      <div style={{ padding: "8px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,245,.35)" }}>
        <span>
          <span style={{ color: "rgba(245,245,245,.7)" }}>Pulse cycle</span>
          {pulseApi?.dateRange
            ? ` · ${pulseApi.dateRange.from} — ${pulseApi.dateRange.to}`
            : " · Current cycle"}
        </span>
        <span>
          {pulseApi ? `${pulseApi.responseCount} of ${pulseApi.teamSize ?? 34} responded` : "34 of 34 responded"}
        </span>
      </div>

      {/* Content */}
      <main style={{ padding: "0 16px 16px" }}>
        {view === "pulse"        && <PulseView pulseData={pulseApi} role={role} />}
        {view === "satisfaction" && <SatisfactionView pulseData={pulseApi} onaData={onaApi} flowers={liveFlowers.length ? liveFlowers : undefined} />}
        {view === "stress"       && <StressView onaNodes={onaNodes} onaAlerts={onaAlerts} harvestData={harvestApi ?? { source: "mock", range: "current", orgAvg: STRESS_DATA.orgAvg, teams: STRESS_DATA.teams.map((t) => ({ ...t, trend: t.trend as "up" | "down" | "stable" })) }} role={role} dateRange={pulseApi?.dateRange} />}
        {view === "actions"      && <ActionsView role={role} onSelectPerson={setSelectedPerson} dateRange={pulseApi?.dateRange} />}
        {view === "teamdna"      && <TeamDNAView onSelectPerson={setSelectedPerson} people={people} />}
        {view === "directory"    && <DirectoryView role={role} onSelectPerson={setSelectedPerson} people={people} />}
      </main>

      <footer style={{ padding: "14px 24px", borderTop: "1px solid rgba(245,245,245,.10)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(245,245,245,.35)", letterSpacing: ".12em", textTransform: "uppercase" }}>Data: Rippling (pulse + ONA) · Harvest time tracking · Last sync: today</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(245,245,245,.35)", letterSpacing: ".12em", textTransform: "uppercase" }}>We care for each other · We do good work · We look for magic · We spark joy</div>
      </footer>
    </div>
  );
}
