import {
  QUOTES_LIBRARY,
  type DecisionCategory,
  type Quote,
  type ScoreBand,
} from "./quotesLibrary";

const BAND_ORDER: ScoreBand[] = ["doomed", "weak", "mixed", "solid", "resolute"];

function shuffleQuotes(quotes: Quote[]) {
  const cloned = [...quotes];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

export function scoreToBand(score: number): ScoreBand {
  if (score <= 30) {
    return "doomed";
  }
  if (score <= 55) {
    return "weak";
  }
  if (score <= 75) {
    return "mixed";
  }
  if (score <= 90) {
    return "solid";
  }
  return "resolute";
}

export function selectCandidateQuotes(
  score: number,
  category: DecisionCategory,
  count = 3,
): Quote[] {
  const band = scoreToBand(score);
  const selected: Quote[] = [];
  const seen = new Set<string>();

  function pushQuotes(quotes: Quote[]) {
    for (const quote of shuffleQuotes(quotes)) {
      const key = `${quote.en}|${quote.zh}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      selected.push(quote);

      if (selected.length >= count) {
        return;
      }
    }
  }

  pushQuotes(QUOTES_LIBRARY[band][category]);

  if (selected.length < count) {
    pushQuotes(QUOTES_LIBRARY[band].general);
  }

  if (selected.length < count) {
    const bandIndex = BAND_ORDER.indexOf(band);
    const neighboringBands = [BAND_ORDER[bandIndex - 1], BAND_ORDER[bandIndex + 1]].filter(
      Boolean,
    ) as ScoreBand[];

    for (const neighboringBand of neighboringBands) {
      pushQuotes(QUOTES_LIBRARY[neighboringBand][category]);
      if (selected.length >= count) {
        break;
      }
    }
  }

  if (selected.length < count) {
    for (const fallbackBand of BAND_ORDER) {
      pushQuotes(QUOTES_LIBRARY[fallbackBand].general);
      if (selected.length >= count) {
        break;
      }
    }
  }

  return shuffleQuotes(selected).slice(0, count);
}
