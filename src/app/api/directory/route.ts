import { NextResponse } from "next/server";
import { PEOPLE } from "@/lib/constants";
import { domainFor, titleCase } from "@/lib/gallup-domains";
import type { StrengthDomain } from "@/lib/types";

// Column indices (0-based). Two header rows — data starts at row index 2.
const C = {
  name: 0, coach: 1, team: 2, pod: 3,
  prof_comms_start: 4, prof_comms_end: 11,   // Slack DMs → Texts
  pers_comms_start: 12, pers_comms_end: 20,  // Slack DMs → I prefer not to discuss
  peak_hours: 21, pref_hours: 22,
  projects_love_start: 23, projects_love_end: 41,
  projects_less_start: 42, projects_less_end: 60,
  recognition_start: 61, recognition_end: 71,
  superpower: 72, working_on: 73, growth_areas: 74,
  burnout_triggers: 75, burnout_support: 76,
  learning_style: 77, ideation_style: 78,
  feedback_pref: 80,
  grumpy_trigger: 82, delight_trigger: 83,
  intro_extro: 84, energy_influence: 85,
  mbti: 86, zodiac: 87, enneagram: 88,
  strength_1: 90, strength_2: 91, strength_3: 92, strength_4: 93, strength_5: 94,
  location: 95,
};

function cells(row: string[], start: number, end: number): string[] {
  return row.slice(start, end + 1).filter(Boolean);
}

function cell(row: string[], idx: number): string {
  return row[idx] ?? "";
}

async function fetchFromSheets() {
  const key = process.env.GOOGLE_SHEETS_API_KEY;
  const id = process.env.GOOGLE_DIRECTORY_SHEET_ID;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A1:CR?key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Sheets error: ${res.status}`);
  const json = await res.json() as { values: string[][] };
  return json.values ?? [];
}

export async function GET() {
  if (!process.env.GOOGLE_SHEETS_API_KEY || !process.env.GOOGLE_DIRECTORY_SHEET_ID) {
    return NextResponse.json({ source: "mock", people: PEOPLE });
  }

  try {
    const rows = await fetchFromSheets();
    // rows[0] and rows[1] are the two header rows — data starts at rows[2]
    const dataRows = rows.slice(2).filter((r) => r[C.name]);

    const people = dataRows.map((row, i) => {
      const strengths = [C.strength_1, C.strength_2, C.strength_3, C.strength_4, C.strength_5]
        .map((c) => cell(row, c))
        .filter(Boolean)
        .map(titleCase);

      const strengthDomains: StrengthDomain[] = strengths.map(domainFor);

      const enneagramRaw = parseInt(cell(row, C.enneagram));
      const mbtiRaw = cell(row, C.mbti).trim().toUpperCase();

      const firstName = cell(row, C.name).split(" ")[0].slice(0, 2).toUpperCase();
      const lastName = cell(row, C.name).split(" ")[1]?.[0]?.toUpperCase() ?? "";

      return {
        id: i + 1,
        name: cell(row, C.name),
        role: "",             // not in directory sheet — comes from Harvest/Rippling in future
        location: cell(row, C.location),
        pod: cell(row, C.pod),
        theme: cell(row, C.team),
        tenure: "",
        pulse: 0,             // populated by pulse route
        stress: "low" as const,
        avatar: firstName + lastName,
        coach: cell(row, C.coach),
        strengths: strengths.length ? strengths : ["—"],
        strengthDomains: strengthDomains.length ? strengthDomains : ["Thinking"],
        enneagram: isNaN(enneagramRaw) ? 0 : enneagramRaw,
        mbti: mbtiRaw || "—",
        // Rich profile fields
        peak_hours: cell(row, C.peak_hours),
        pref_hours: cell(row, C.pref_hours),
        prof_comms: cells(row, C.prof_comms_start, C.prof_comms_end),
        pers_comms: cells(row, C.pers_comms_start, C.pers_comms_end),
        project_loves: cells(row, C.projects_love_start, C.projects_love_end),
        less_excited: cells(row, C.projects_less_start, C.projects_less_end),
        recognition_style: cells(row, C.recognition_start, C.recognition_end),
        superpower: cell(row, C.superpower),
        working_on: cell(row, C.working_on),
        growth_areas: cell(row, C.growth_areas),
        burnout_triggers: cell(row, C.burnout_triggers),
        burnout_support: cell(row, C.burnout_support),
        learning_style: cell(row, C.learning_style),
        ideation_style: cell(row, C.ideation_style),
        feedback_pref: cell(row, C.feedback_pref),
        grumpy_trigger: cell(row, C.grumpy_trigger),
        delight_trigger: cell(row, C.delight_trigger),
        intro_extro: cell(row, C.intro_extro),
        energy_influence: cell(row, C.energy_influence),
        zodiac: cell(row, C.zodiac),
      };
    });

    return NextResponse.json({ source: "sheets", people });
  } catch (e) {
    console.error("Directory fetch failed:", e);
    return NextResponse.json({ source: "mock", people: PEOPLE });
  }
}
