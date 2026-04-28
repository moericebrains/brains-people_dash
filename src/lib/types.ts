export type StrengthDomain = "Executing" | "Influencing" | "Relationship" | "Thinking";
export type StressLevel = "low" | "medium" | "high";
export type Role = "ic" | "coach" | "leadership";

export interface Person {
  id: number;
  name: string;
  role: string;
  location: string;
  pod: string;
  theme: string;
  tenure: string;
  pulse: number;
  stress: StressLevel;
  avatar: string;
  coach: string;
  strengths: string[];
  strengthDomains: StrengthDomain[];
  enneagram: number;
  mbti: string;
  // Rich profile fields (populated by directory route)
  peak_hours?: string;
  pref_hours?: string;
  prof_comms?: string[];
  pers_comms?: string[];
  project_loves?: string[];
  less_excited?: string[];
  recognition_style?: string[];
  superpower?: string;
  working_on?: string;
  growth_areas?: string;
  burnout_triggers?: string;
  burnout_support?: string;
  learning_style?: string;
  ideation_style?: string;
  feedback_pref?: string;
  grumpy_trigger?: string;
  delight_trigger?: string;
  intro_extro?: string;
  energy_influence?: string;
  zodiac?: string;
}

export interface OnaNode {
  id: number;
  name: string;
  centrality: number;
  team: string;
  bridge: boolean;
  overload: boolean;
  isolation_risk: boolean;
}

export interface FlowerRecipient {
  name: string;
  n: number;
  team: string;
}

export interface PulseApiData {
  avgFeeling: number;
  avgStressSource: number;
  avgBalance: number;
  avgGptw: number;
  participation: number;
  proudPct: number;
  proudDist: { stronglyAgree: number; agree: number; neutral: number; disagree: number };
  gptwDist: Record<string, number>;
  flowerCounts: Record<string, number>;
  celebrations: string[];
  stressors: string[];
  supportNeeds: string[];
  byTeam: Record<string, number>;
  responseCount: number;
  teamSize: number;
  cycleLabel?: string;
  cycleBounds?: { from: string; to: string };
  dateRange: { from: string; to: string } | null;
  trend?: Array<{ month: string; stress: number; feeling: number; balance: number }>;
  prevCycle?: { feeling: number; stressSource: number; balance: number };
}

export interface OnaApiData {
  nodes: OnaNode[];
  infoFlowEase: number;
  responseCount: number;
  alerts: Array<{ type: string; message: string }>;
}

export interface HarvestTeam {
  name: string;
  members: number;
  utilization: number;
  billable: number;
  burnoutRisk: boolean;
  trend: "up" | "down" | "stable";
  individuals?: Array<{ name: string; utilization: number; billable: number }>;
}

export interface HarvestData {
  source: "live" | "mock";
  range: string;
  dateRange?: { from: string; to: string };
  orgAvg: { utilization: number; billable: number };
  teams: HarvestTeam[];
}
