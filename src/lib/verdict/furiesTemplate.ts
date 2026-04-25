import type { ScoreBand } from "./quotesLibrary";

export const FURIES_TEMPLATE = {
  reportTitle: "JURY DELIBERATION REPORT",
  reportTitleZh: "陪审团合议报告",
  subheader: "FIVE FURIES · FIVE VERDICTS · ONE TRUTH",
  panelOpening: "Five voices have spoken. Their verdicts follow.",
  panelOpeningZh: "五种声音已表陈词。以下是他们各自的裁定。",
  convergenceLabel: "POINT OF CONVERGENCE",
  convergenceLabelZh: "共识之处",
  divergenceLabel: "POINT OF DIVERGENCE",
  divergenceLabelZh: "分歧之处",
  fallbackConsensus: {
    doomed: {
      convergence: "大家都认为你低估了现实代价。",
      divergence: "分歧只在于你会摔得多快。",
    },
    weak: {
      convergence: "大家都看见了证据还不够硬。",
      divergence: "分歧在于这份热情是否值得继续赌。",
    },
    mixed: {
      convergence: "大家承认这决定并非全无根基。",
      divergence: "分歧在于风险是否仍高于回报。",
    },
    solid: {
      convergence: "大家都承认你这次准备得更完整。",
      divergence: "分歧在于这份完整能否跨过现实摩擦。",
    },
    resolute: {
      convergence: "大家都承认这次选择经得起围攻。",
      divergence: "分歧只剩在于你将赢得多漂亮。",
    },
  } satisfies Record<ScoreBand, { convergence: string; divergence: string }>,
  closingByScoreBand: {
    doomed: {
      en: "The chamber hears collapse before conviction.",
      zh: "此案尚未成形，坍塌之声已先入庭。",
    },
    weak: {
      en: "The panel remains unconvinced by the present record.",
      zh: "本组意见未能全然服膺，卷宗仍显单薄。",
    },
    mixed: {
      en: "The panel sees a path, though not yet a verdict.",
      zh: "诸席见其路，不敢遽言其成。",
    },
    solid: {
      en: "The panel concedes structure, if not total safety.",
      zh: "诸席承其架构已成，唯未敢称万无一失。",
    },
    resolute: {
      en: "The panel yields. The case can now stand upright.",
      zh: "诸席至此让步，此案已可昂然立于庭上。",
    },
  } satisfies Record<ScoreBand, { en: string; zh: string }>,
};
