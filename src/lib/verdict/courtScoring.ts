function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function jitter(amount = 5) {
  return Math.round((Math.random() * 2 - 1) * amount);
}

export function deriveCourtBreakdown(totalScore: number) {
  const prosecutionBase = 100 - totalScore;
  const defenseBase = totalScore;
  const evidenceBase = totalScore < 40 ? 42 : totalScore > 75 ? 78 : 60;

  return {
    prosecutionStrength: clamp(prosecutionBase + jitter()),
    defenseStrength: clamp(defenseBase + jitter()),
    evidenceClarity: clamp(evidenceBase + jitter()),
  };
}
