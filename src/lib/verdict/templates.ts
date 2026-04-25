export type VerdictType = "CONVICTED" | "UNRESOLVED" | "ACQUITTED";

export const VERDICT_TEMPLATES: Record<
  VerdictType,
  {
    opening: string;
    openingZh: string;
    closing: string;
    closingZh: string;
    courtLabel: string;
    verdictLabel: string;
    verdictLabelZh: string;
  }
> = {
  CONVICTED: {
    opening: "After careful deliberation, this court finds your resolve insufficient.",
    openingZh: "本庭审慎合议后认为，你的决心尚不足以支撑此决定。",
    closing: "The motion is denied, pending further reflection.",
    closingZh: "驳回当前动议，留待深思。",
    courtLabel: "COURT OF COGNITIVE CLARITY",
    verdictLabel: "MOTION DENIED",
    verdictLabelZh: "驳回",
  },
  UNRESOLVED: {
    opening: "The evidence is mixed. This court withholds a definitive ruling.",
    openingZh: "证据参半。本庭暂不作最终裁决。",
    closing: "Return when you have weighed the silence.",
    closingZh: "待你听清沉默之声，再来此庭。",
    courtLabel: "COURT OF COGNITIVE CLARITY",
    verdictLabel: "VERDICT WITHHELD",
    verdictLabelZh: "留待",
  },
  ACQUITTED: {
    opening: "The defendant has answered each challenge with substance.",
    openingZh: "被告对每一项质疑皆以实据回应。",
    closing: "The court releases you to your path.",
    closingZh: "本庭放行——去走你的路吧。",
    courtLabel: "COURT OF COGNITIVE CLARITY",
    verdictLabel: "MOTION GRANTED",
    verdictLabelZh: "放行",
  },
};
