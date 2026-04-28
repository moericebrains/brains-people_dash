import type { Person, OnaNode, FlowerRecipient } from "./types";

export const STRENGTHS_DOMAINS: Record<string, string> = {
  Executing: "#EA5B32",
  Influencing: "#EDC157",
  Relationship: "#2E7354",
  Thinking: "#3565E3",
};

export const ENNEAGRAM_LABELS: Record<number, string> = {
  1: "Reformer", 2: "Helper", 3: "Achiever", 4: "Individualist",
  5: "Investigator", 6: "Loyalist", 7: "Enthusiast", 8: "Challenger", 9: "Peacemaker",
};

export const MBTI_GROUPS: Record<string, string[]> = {
  Analyst:  ["INTJ", "INTP", "ENTJ", "ENTP"],
  Diplomat: ["INFJ", "INFP", "ENFJ", "ENFP"],
  Sentinel: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  Explorer: ["ISTP", "ISFP", "ESTP", "ESFP"],
};

export const TEAM_COLORS: Record<string, string> = {
  Creative: "#EEB1D2", Strategy: "#3565E3", Projects: "#EDC157",
  Accounts: "#EA5B32", Admin: "#C0DFEC", Ops: "#2E7354", Production: "#7A7A7A",
};

export const PETAL_COLORS = ["#EEB1D2", "#EDC157", "#C0DFEC", "#3565E3", "#EA5B32"];

export const PEOPLE: Person[] = [
  {
    id: 1, name: "Ben Hart", role: "Partner / Strategy", location: "LA",
    pod: "Leadership", theme: "Strategy", tenure: "6y",
    pulse: 8.1, stress: "low", avatar: "BH", coach: "Self",
    strengths: ["Strategic", "Ideation", "Futuristic", "Maximizer", "Connectedness"],
    strengthDomains: ["Thinking", "Thinking", "Thinking", "Influencing", "Relationship"],
    enneagram: 3, mbti: "ENTJ",
  },
  {
    id: 2, name: "Moe Rice", role: "Partner / Creative", location: "LA",
    pod: "Leadership", theme: "Creative", tenure: "5y",
    pulse: 7.9, stress: "medium", avatar: "MR", coach: "Self",
    strengths: ["Ideation", "Activator", "Woo", "Communication", "Adaptability"],
    strengthDomains: ["Thinking", "Influencing", "Influencing", "Influencing", "Relationship"],
    enneagram: 7, mbti: "ENFP",
  },
  {
    id: 3, name: "Gustavo Delgado", role: "Partner / Operations", location: "GVL",
    pod: "Leadership", theme: "Admin", tenure: "4y",
    pulse: 7.4, stress: "low", avatar: "GD", coach: "Self",
    strengths: ["Responsibility", "Deliberative", "Discipline", "Consistency", "Achiever"],
    strengthDomains: ["Executing", "Thinking", "Executing", "Executing", "Executing"],
    enneagram: 1, mbti: "ISTJ",
  },
  {
    id: 4, name: "Drue Flynn", role: "Partner / Client", location: "GVL",
    pod: "Leadership", theme: "Accounts", tenure: "3y",
    pulse: 8.3, stress: "low", avatar: "DF", coach: "Self",
    strengths: ["Relator", "Empathy", "Developer", "Harmony", "Includer"],
    strengthDomains: ["Relationship", "Relationship", "Relationship", "Relationship", "Relationship"],
    enneagram: 2, mbti: "ENFJ",
  },
  {
    id: 5, name: "Leah Schiros", role: "Senior Strategist", location: "LA",
    pod: "Brand Pod", theme: "Strategy", tenure: "3y",
    pulse: 7.2, stress: "medium", avatar: "LS", coach: "Ben Hart",
    strengths: ["Analytical", "Input", "Learner", "Context", "Strategic"],
    strengthDomains: ["Thinking", "Thinking", "Thinking", "Thinking", "Thinking"],
    enneagram: 5, mbti: "INTP",
  },
  {
    id: 6, name: "Emily Neal", role: "Project Manager", location: "GVL",
    pod: "Web Pod", theme: "Projects", tenure: "2y",
    pulse: 5.9, stress: "high", avatar: "EN", coach: "Drue Flynn",
    strengths: ["Achiever", "Responsibility", "Arranger", "Focus", "Discipline"],
    strengthDomains: ["Executing", "Executing", "Executing", "Executing", "Executing"],
    enneagram: 6, mbti: "ISTJ",
  },
  {
    id: 7, name: "Sarah K.", role: "Creative Director", location: "LA",
    pod: "Brand Pod", theme: "Creative", tenure: "4y",
    pulse: 8.4, stress: "low", avatar: "SK", coach: "Moe Rice",
    strengths: ["Ideation", "Futuristic", "Activator", "Communication", "Significance"],
    strengthDomains: ["Thinking", "Thinking", "Influencing", "Influencing", "Influencing"],
    enneagram: 4, mbti: "ENFP",
  },
  {
    id: 8, name: "Annaliese Phludd", role: "Designer", location: "GVL",
    pod: "New Biz Pod", theme: "Creative", tenure: "1y",
    pulse: 6.1, stress: "high", avatar: "AP", coach: "Moe Rice",
    strengths: ["Empathy", "Harmony", "Adaptability", "Connectedness", "Developer"],
    strengthDomains: ["Relationship", "Relationship", "Relationship", "Relationship", "Relationship"],
    enneagram: 9, mbti: "ISFP",
  },
  {
    id: 9, name: "Leah Chow", role: "Copywriter", location: "LA",
    pod: "Brand Pod", theme: "Creative", tenure: "2y",
    pulse: 7.8, stress: "low", avatar: "LC", coach: "Moe Rice",
    strengths: ["Communication", "Woo", "Positivity", "Includer", "Activator"],
    strengthDomains: ["Influencing", "Influencing", "Relationship", "Relationship", "Influencing"],
    enneagram: 7, mbti: "ESFP",
  },
  {
    id: 10, name: "MSuz", role: "People + Culture", location: "LA",
    pod: "Pod 1", theme: "Admin", tenure: "3y",
    pulse: 7.5, stress: "medium", avatar: "MS", coach: "Gustavo Delgado",
    strengths: ["Developer", "Empathy", "Individualization", "Relator", "Positivity"],
    strengthDomains: ["Relationship", "Relationship", "Relationship", "Relationship", "Relationship"],
    enneagram: 2, mbti: "ENFJ",
  },
  {
    id: 11, name: "Armando V.", role: "Operations", location: "GVL",
    pod: "Pod 1", theme: "Admin", tenure: "2y",
    pulse: 7.1, stress: "low", avatar: "AV", coach: "Gustavo Delgado",
    strengths: ["Responsibility", "Consistency", "Arranger", "Harmony", "Belief"],
    strengthDomains: ["Executing", "Executing", "Executing", "Relationship", "Executing"],
    enneagram: 6, mbti: "ESFJ",
  },
  {
    id: 12, name: "Jordan T.", role: "Strategist", location: "LA",
    pod: "New Biz Pod", theme: "Strategy", tenure: "1y",
    pulse: 7.3, stress: "medium", avatar: "JT", coach: "Ben Hart",
    strengths: ["Strategic", "Futuristic", "Ideation", "Command", "Self-Assurance"],
    strengthDomains: ["Thinking", "Thinking", "Thinking", "Influencing", "Influencing"],
    enneagram: 8, mbti: "ENTJ",
  },
  {
    id: 13, name: "Casey M.", role: "Account Manager", location: "GVL",
    pod: "Web Pod", theme: "Accounts", tenure: "2y",
    pulse: 7.6, stress: "low", avatar: "CM", coach: "Drue Flynn",
    strengths: ["Relator", "Empathy", "Communication", "Woo", "Positivity"],
    strengthDomains: ["Relationship", "Relationship", "Influencing", "Influencing", "Relationship"],
    enneagram: 2, mbti: "ESFJ",
  },
  {
    id: 14, name: "River O.", role: "Designer", location: "LA",
    pod: "Brand Pod", theme: "Creative", tenure: "2y",
    pulse: 7.9, stress: "low", avatar: "RO", coach: "Moe Rice",
    strengths: ["Ideation", "Input", "Learner", "Futuristic", "Connectedness"],
    strengthDomains: ["Thinking", "Thinking", "Thinking", "Thinking", "Relationship"],
    enneagram: 4, mbti: "INFP",
  },
];

export const PULSE_DATA = {
  current: { stress: 3.2, fulfillment: 7.8, balance: 6.4, support: 7.1, recognition: 6.9 },
  prev:    { stress: 4.1, fulfillment: 7.2, balance: 5.8, support: 6.5, recognition: 6.2 },
  trend: [
    { month: "Aug", stress: 5.1, fulfillment: 6.4, joy: 6.8 },
    { month: "Sep", stress: 4.8, fulfillment: 6.9, joy: 7.1 },
    { month: "Oct", stress: 4.1, fulfillment: 7.2, joy: 7.4 },
    { month: "Nov", stress: 3.9, fulfillment: 7.5, joy: 7.6 },
    { month: "Dec", stress: 4.3, fulfillment: 7.1, joy: 7.0 },
    { month: "Jan", stress: 3.2, fulfillment: 7.8, joy: 8.1 },
  ],
  participation: 87,
  byValue: [
    { value: "Care for Each Other", score: 8.1, prev: 7.6 },
    { value: "Do Good Work", score: 7.9, prev: 7.4 },
    { value: "Look for Magic", score: 7.2, prev: 6.8 },
    { value: "Spark Joy", score: 7.8, prev: 7.5 },
  ],
  byMarker: [
    { marker: "Pivot with Purpose", score: 7.4 },
    { marker: "Brave Ideas, Bold Action", score: 6.8 },
    { marker: "Speak Fluent Client", score: 8.2 },
    { marker: "Work Out Loud", score: 7.1 },
    { marker: "Enjoy the Ride", score: 7.9 },
  ],
};

export const STRESS_DATA = {
  orgAvg: { utilization: 67, billable: 71, burnoutRisk: false },
  teams: [
    { name: "Strategy", utilization: 76, billable: 79, trend: "up", members: 5, burnoutRisk: false },
    { name: "Creative", utilization: 68, billable: 72, trend: "stable", members: 8, burnoutRisk: false },
    { name: "Project Mgmt", utilization: 84, billable: 88, trend: "up", members: 4, burnoutRisk: true },
  ],
};

export const ONA_DATA: { nodes: OnaNode[]; alerts: { type: string; message: string }[] } = {
  nodes: [
    { id: 1, name: "Strategy Pod", centrality: 0.82, team: "Strategy", bridge: true, overload: false, isolation_risk: false },
    { id: 2, name: "Creative Pod A", centrality: 0.91, team: "Creative", bridge: false, overload: false, isolation_risk: false },
    { id: 3, name: "Creative Pod B", centrality: 0.54, team: "Creative", bridge: false, overload: false, isolation_risk: true },
    { id: 4, name: "PM Pod", centrality: 0.88, team: "Projects", bridge: true, overload: true, isolation_risk: false },
    { id: 5, name: "Ops", centrality: 0.41, team: "Admin", bridge: false, overload: false, isolation_risk: true },
  ],
  alerts: [
    { type: "isolation", message: "Creative Pod B shows reduced cross-team connections this cycle" },
    { type: "overload", message: "2 bridge connectors in PM Pod flagged for network overload" },
  ],
};

export const ACTIONS = [
  {
    audience: "leadership", urgency: "high", value: "Care for Each Other",
    title: "PM Pod billing at 88% utilization — burnout risk threshold crossed",
    body: "Project Management is billing at 88% utilization — well above the 75–80% healthy range Brains uses as its sustainability benchmark. This is a sustained pattern, not a one-week sprint. Clarity of Care means protecting realistic workloads before adding scope.",
    actions: ["Schedule pod capacity review this week", "Check in 1:1 with PM coaches", "Review Harvest reports together — who is consistently over 80% billable?"],
  },
  {
    audience: "leadership", urgency: "medium", value: "Look for Magic",
    title: "Creative Pod B showing isolation risk in ONA",
    body: "This pod's cross-team connection score dropped significantly. Isolated pods produce less magic — creativity is a team sport at Brains.",
    actions: ["Assign cross-pod creative buddy", "Add Pod B to next all-hands showcase", "Review pod meeting cadence"],
  },
  {
    audience: "coach", urgency: "high", value: "Care for Each Other",
    title: "Emily Neal showing stress + low pulse signals",
    body: "Emily's pulse score (5.9) is the lowest on the team this cycle, and her Harvest data shows 4 consecutive weeks above 82% billable utilization. These two signals together — low pulse, high hours — are the pattern we watch for. As her coach, this is a moment to lean in on the person, not just the workload.",
    actions: ["Schedule 1:1 this week", "Pull her Harvest hours for the last 4 weeks and review together", "Ask: what do you need right now to feel sustainable?"],
  },
  {
    audience: "coach", urgency: "medium", value: "Do Good Work",
    title: "Brave Ideas, Bold Action scores dipped this cycle",
    body: "Across your pod, the 'Brave Ideas, Bold Action' marker scored 6.8 — a half-point below last cycle. Creative risk-taking may be feeling less safe.",
    actions: ["Open 1:1 with 'when did you last take a creative risk?'", "Create a 'bad ideas' session this week"],
  },
  {
    audience: "ic", urgency: "low", value: "Spark Joy",
    title: "Your org's Enjoy the Ride score is rising 🎉",
    body: "The team's joy signal is trending up — 8.1 this month vs 7.4 in October. Keep working out loud, celebrating each other, and making space for wild ideas.",
    actions: ["Post something in #showandtell this week", "Book a 1:1 with someone you don't work with often"],
  },
];

export const FLOWERS: FlowerRecipient[] = [
  { name: "Josh Maynard", n: 3, team: "Creative" },
  { name: "Adrian Manzo", n: 3, team: "Projects" },
  { name: "Alex Gracey", n: 3, team: "Accounts" },
  { name: "Emily Neal", n: 3, team: "Projects" },
  { name: "Maggie McLandsborough", n: 3, team: "Production" },
  { name: "Gaelyn Jenkins", n: 2, team: "Creative" },
  { name: "Chris Gonzalez", n: 2, team: "Creative" },
  { name: "Micky Mantell", n: 2, team: "Accounts" },
  { name: "Leah Chew", n: 2, team: "Creative" },
  { name: "Moe Rice", n: 2, team: "Admin" },
  { name: "Sarah Bowman", n: 2, team: "Projects" },
  { name: "Andrew Huang", n: 2, team: "Strategy" },
  { name: "Bella Gonzalez", n: 1, team: "Accounts" },
  { name: "Gustavo Delgado", n: 1, team: "Admin" },
  { name: "Mary-Susan Fiedler", n: 1, team: "Ops" },
  { name: "Megan Cosgrove", n: 1, team: "Projects" },
  { name: "Armando Martinez-Celis", n: 1, team: "Creative" },
  { name: "Ally Sutton", n: 1, team: "Creative" },
  { name: "Leah Schiros", n: 1, team: "Strategy" },
  { name: "Emily Eastman", n: 1, team: "Creative" },
  { name: "Drue Flynn", n: 1, team: "Creative" },
  { name: "Ingrid Tai", n: 1, team: "Creative" },
];
