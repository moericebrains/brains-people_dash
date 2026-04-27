import type { StrengthDomain } from "./types";

const DOMAIN_MAP: Record<string, StrengthDomain> = {
  // Executing
  achiever: "Executing", arranger: "Executing", belief: "Executing",
  consistency: "Executing", deliberative: "Executing", discipline: "Executing",
  focus: "Executing", responsibility: "Executing", restorative: "Executing",
  // Influencing
  activator: "Influencing", command: "Influencing", communication: "Influencing",
  competition: "Influencing", maximizer: "Influencing", "self-assurance": "Influencing",
  significance: "Influencing", woo: "Influencing",
  // Relationship
  adaptability: "Relationship", connectedness: "Relationship", developer: "Relationship",
  empathy: "Relationship", harmony: "Relationship", includer: "Relationship",
  individualization: "Relationship", positivity: "Relationship", relator: "Relationship",
  // Thinking
  analytical: "Thinking", context: "Thinking", futuristic: "Thinking",
  ideation: "Thinking", input: "Thinking", intellection: "Thinking",
  learner: "Thinking", strategic: "Thinking",
};

export function domainFor(strength: string): StrengthDomain {
  return DOMAIN_MAP[strength.toLowerCase()] ?? "Thinking";
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
