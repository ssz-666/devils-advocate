import type { DecisionCategory } from "./quotesLibrary";

const CATEGORY_KEYWORDS: Record<DecisionCategory, RegExp[]> = {
  career: [
    /辞职|离职|跳槽|转行|考研|考公|创业|升职|offer|resign|quit|job|career|startup|founder|graduate school|career change/i,
  ],
  relationship: [
    /分手|复合|结婚|离婚|告白|异地|恋爱|婚姻|breakup|break up|reconcile|marry|marriage|divorce|confess|relationship/i,
  ],
  financial: [
    /买房|买车|贷款|首付|投资|基金|股票|按揭|mortgage|loan|invest|investment|buy a house|buy a car|down payment|finance/i,
  ],
  social: [
    /断绝|绝交|撕破脸|举报|对抗|和解|拉黑|翻脸|confront|cut off|report|expose|reconcile|boundary|friendship/i,
  ],
  lifestyle: [
    /搬家|搬到|移居|移民|戒烟|戒酒|减肥|健身|作息|move|relocate|immigrate|quit smoking|quit drinking|lose weight|lifestyle/i,
  ],
  general: [],
};

export function classifyDecision(statement: string): DecisionCategory {
  const normalized = statement.toLowerCase();
  let winner: DecisionCategory = "general";
  let maxHits = 0;

  for (const [category, patterns] of Object.entries(CATEGORY_KEYWORDS) as Array<
    [DecisionCategory, RegExp[]]
  >) {
    if (category === "general") {
      continue;
    }

    const hits = patterns.reduce((count, pattern) => {
      const matched = normalized.match(pattern);
      return count + (matched ? matched.length : 0);
    }, 0);

    if (hits > maxHits) {
      maxHits = hits;
      winner = category;
    }
  }

  return winner;
}
