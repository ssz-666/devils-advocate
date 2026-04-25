import type { FuryRole } from "./furiesRemarks";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function jitter(amount = 3) {
  return Math.round((Math.random() * 2 - 1) * amount);
}

export function deriveRoleScores(totalScore: number): Record<FuryRole, number> {
  return {
    "the-father": clamp(totalScore - (5 + Math.floor(Math.random() * 11)) + jitter()),
    "future-self": clamp(totalScore + Math.floor(Math.random() * 11) - 5 + jitter()),
    "the-ex": clamp(totalScore - Math.floor(Math.random() * 11) + jitter()),
    "the-fan": clamp(totalScore + 10 + Math.floor(Math.random() * 11) + jitter()),
    "the-nemesis": clamp(totalScore - (15 + Math.floor(Math.random() * 11)) + jitter()),
  };
}
