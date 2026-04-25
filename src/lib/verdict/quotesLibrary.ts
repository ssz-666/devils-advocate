export type ScoreBand = "doomed" | "weak" | "mixed" | "solid" | "resolute";

export type DecisionCategory =
  | "career"
  | "relationship"
  | "financial"
  | "social"
  | "lifestyle"
  | "general";

export type Quote = {
  en: string;
  zh: string;
  tone: "cold" | "sharp" | "warm" | "final";
};

export const QUOTES_LIBRARY: Record<ScoreBand, Record<DecisionCategory, Quote[]>> = {
  doomed: {
    career: [
      { en: "You called it a leap. The floor called it gravity.", zh: "你以为那是起跳，地面只看见坠落。", tone: "sharp" },
      { en: "Ambition arrived dressed as an exit plan.", zh: "野心穿成退路的样子，最容易骗人。", tone: "cold" },
      { en: "This resignation reads like panic in formal wear.", zh: "这份辞呈像把慌乱套进了正装里。", tone: "sharp" },
    ],
    relationship: [
      { en: "Love is gone. Habit is still filing appeals.", zh: "爱已经退庭，习惯还在上诉。", tone: "sharp" },
      { en: "You are not choosing them. You are choosing a wound.", zh: "你不是在选那个人，你是在续签旧伤。", tone: "cold" },
      { en: "Some reunions are only grief wearing perfume.", zh: "有些复合，只是悲伤喷了香水。", tone: "sharp" },
    ],
    financial: [
      { en: "Debt loves a brave face and a poor spreadsheet.", zh: "债务最爱胆子大、账本烂的人。", tone: "sharp" },
      { en: "This purchase shines brighter than its aftermath.", zh: "这笔买卖的光，比它的后果亮得多。", tone: "cold" },
      { en: "A mortgage is not faith. It is arithmetic with teeth.", zh: "贷款不是信念，是长了牙的算术。", tone: "sharp" },
    ],
    social: [
      { en: "You want justice. What you have is a lit match.", zh: "你以为自己拿着正义，其实只是火柴。", tone: "sharp" },
      { en: "Rage is clear. Consequence is clearer.", zh: "怒气很清楚，后果更清楚。", tone: "cold" },
      { en: "Breaking the table is easy. Eating alone is not.", zh: "掀桌容易，独自吃饭没那么容易。", tone: "sharp" },
    ],
    lifestyle: [
      { en: "A new city cannot outvote an old pattern.", zh: "换一座城，投不过旧毛病。", tone: "cold" },
      { en: "Reinvention fails when habit keeps the keys.", zh: "习惯还拿着钥匙，重生就只是搬家。", tone: "sharp" },
      { en: "You packed your luggage, not your cause.", zh: "你收拾好了行李，没有收拾好理由。", tone: "sharp" },
    ],
    general: [
      { en: "The verdict was weak long before the excuse arrived.", zh: "借口还没开口，结论已经发虚。", tone: "cold" },
      { en: "This decision wants applause more than survival.", zh: "这决定更想要掌声，不太在乎活下去。", tone: "sharp" },
      { en: "What sounds brave in the mouth dies fast in daylight.", zh: "嘴里很勇的事，到了白天死得很快。", tone: "sharp" },
    ],
  },
  weak: {
    career: [
      { en: "The road exists, but your map still sweats.", zh: "路也许有，只是你的地图还在冒汗。", tone: "cold" },
      { en: "You have motive, not yet a method.", zh: "你有动机，还没有办法。", tone: "sharp" },
      { en: "The exit is visible. The landing is still fiction.", zh: "出口看见了，落点还像小说。", tone: "cold" },
    ],
    relationship: [
      { en: "The heart testified. The facts stayed outside.", zh: "心已经作证，事实还在门外。", tone: "cold" },
      { en: "Tenderness alone does not repair a structure.", zh: "温柔本身，修不好塌过的东西。", tone: "sharp" },
      { en: "You can forgive; that does not mean you should return.", zh: "原谅可以发生，回头不一定该发生。", tone: "cold" },
    ],
    financial: [
      { en: "The numbers are not hostile. They are merely unimpressed.", zh: "数字没有敌意，它们只是不买账。", tone: "cold" },
      { en: "Your wallet nods slower than your desire.", zh: "你的钱包点头，比欲望慢得多。", tone: "sharp" },
      { en: "This budget bends. One surprise and it kneels.", zh: "这份预算会弯腰，再来一击就跪了。", tone: "sharp" },
    ],
    social: [
      { en: "You may win the scene and lose the season.", zh: "你可能赢下一场，输掉整季。", tone: "cold" },
      { en: "Some truths cost more than fury can afford.", zh: "有些真相，怒气付不起代价。", tone: "sharp" },
      { en: "The confrontation is loud; the aftermath is longer.", zh: "冲突很响，余波更长。", tone: "cold" },
    ],
    lifestyle: [
      { en: "A cleaner morning still needs a stronger reason.", zh: "更干净的早晨，也得配更硬的理由。", tone: "cold" },
      { en: "You are moving the room before moving the self.", zh: "你先挪了房间，还没挪动自己。", tone: "sharp" },
      { en: "Change is possible. Permanence has not signed yet.", zh: "改变也许开始了，持久还没签字。", tone: "cold" },
    ],
    general: [
      { en: "The case is breathing, but only through doubt.", zh: "这案子还活着，靠的是犹疑呼吸。", tone: "cold" },
      { en: "You have a story. The proof still wants in.", zh: "你有故事，证据还想进门。", tone: "sharp" },
      { en: "This decision survives, though not elegantly.", zh: "这决定暂时活着，但并不体面。", tone: "cold" },
    ],
  },
  mixed: {
    career: [
      { en: "The door is half open and half warning.", zh: "门开了一半，也警告了一半。", tone: "cold" },
      { en: "Your case stands, though the weather is uncertain.", zh: "你的理由站得住，只是天色不稳。", tone: "warm" },
      { en: "This path may work, if doubt stops driving.", zh: "这条路也许可行，只要别让犹豫掌舵。", tone: "cold" },
    ],
    relationship: [
      { en: "There is still light here, but no guarantee of warmth.", zh: "这里还有光，未必还有温度。", tone: "cold" },
      { en: "The thread has not broken; it has only thinned.", zh: "线还没断，只是细得危险。", tone: "warm" },
      { en: "The answer is not no. It is not yet yes.", zh: "答案不是不行，只是不是现在。", tone: "cold" },
    ],
    financial: [
      { en: "The figures do not collapse. They simply refuse romance.", zh: "数字没有崩，只是拒绝浪漫。", tone: "cold" },
      { en: "This can be done, but not casually.", zh: "这事能做，但不能随手做。", tone: "sharp" },
      { en: "The risk is measurable, which makes it dangerous enough.", zh: "风险终于能量化了，也就足够危险了。", tone: "cold" },
    ],
    social: [
      { en: "You may speak, but the echo will also testify.", zh: "你可以开口，回声也会作证。", tone: "sharp" },
      { en: "The line is drawable, though not without blood.", zh: "界线可以划，只是不会不见血。", tone: "cold" },
      { en: "Silence is costly. Speech is merely costlier.", zh: "沉默很贵，开口往往更贵。", tone: "cold" },
    ],
    lifestyle: [
      { en: "The body agrees. The calendar still hesitates.", zh: "身体点头了，日历还在犹豫。", tone: "warm" },
      { en: "The move is possible; the rhythm is not secured.", zh: "迁徙可以发生，节奏还没安稳。", tone: "cold" },
      { en: "Your new life has a pulse, not yet a spine.", zh: "新生活已经有脉搏，还没长出脊梁。", tone: "sharp" },
    ],
    general: [
      { en: "The scales have moved, but not enough to sing.", zh: "天平已经动了，还没到能唱歌的时候。", tone: "cold" },
      { en: "There is a case here, just not a clean one.", zh: "这里有一案，只是不够干净。", tone: "sharp" },
      { en: "The doubt remains, though no longer in command.", zh: "怀疑还在，只是已经不再掌权。", tone: "warm" },
    ],
  },
  solid: {
    career: [
      { en: "You are not fleeing. You are finally choosing terrain.", zh: "你不是在逃，你是在选战场。", tone: "final" },
      { en: "The plan has weight. Fear no longer writes it.", zh: "这份计划终于有了重量，恐惧写不动它。", tone: "final" },
      { en: "This move reads less like rebellion than design.", zh: "这一步不像逃离，更像设计。", tone: "warm" },
    ],
    relationship: [
      { en: "You have named the cost without flinching.", zh: "你已经说清代价，而且没有眨眼。", tone: "final" },
      { en: "Affection survived the audit of fact.", zh: "感情经了事实的审计，还没倒。", tone: "warm" },
      { en: "The heart is involved, but not in charge.", zh: "心还在场，但已不再独断。", tone: "final" },
    ],
    financial: [
      { en: "The ledger is stern, and still it permits you.", zh: "账本很严，但它还是放行了你。", tone: "final" },
      { en: "This decision has numbers beneath its courage.", zh: "这份勇气，底下垫着数字。", tone: "warm" },
      { en: "The risk remains, but it now has rails.", zh: "风险还在，只是已经装上护栏。", tone: "final" },
    ],
    social: [
      { en: "Your boundary is no longer an impulse but a statute.", zh: "你的边界不再是情绪，而像法条。", tone: "final" },
      { en: "You are not making noise. You are setting terms.", zh: "你不是在制造声响，你是在设定条件。", tone: "sharp" },
      { en: "This refusal has structure, not merely volume.", zh: "这次拒绝有结构，不只有音量。", tone: "final" },
    ],
    lifestyle: [
      { en: "The routine has stopped begging and started holding.", zh: "规律不再求人，开始站住了。", tone: "warm" },
      { en: "This new life is no draft. It has entered ink.", zh: "这段新生活不再是草稿，已经落墨。", tone: "final" },
      { en: "The change is disciplined enough to be believed.", zh: "这份改变足够克制，所以可信。", tone: "final" },
    ],
    general: [
      { en: "The record is imperfect, yet persuasive.", zh: "卷宗并不完美，却已经足够有力。", tone: "final" },
      { en: "Doubt has not vanished; it has been answered.", zh: "怀疑没有消失，只是被一一回答。", tone: "warm" },
      { en: "This choice now stands in its own light.", zh: "这个选择，已经能站在自己的光里。", tone: "final" },
    ],
  },
  resolute: {
    career: [
      { en: "The map is ready. The road may finally begin.", zh: "地图已经备好，路可以正式开始了。", tone: "final" },
      { en: "Your future no longer sounds borrowed.", zh: "你的未来，终于不像借来的。", tone: "warm" },
      { en: "This decision has earned the dignity of action.", zh: "这个决定，已经配得上行动的尊严。", tone: "final" },
    ],
    relationship: [
      { en: "The answer arrives clean, without bargaining.", zh: "答案抵达得很干净，不再讨价还价。", tone: "final" },
      { en: "You are no longer asking love to excuse reality.", zh: "你不再要求爱替现实开脱。", tone: "warm" },
      { en: "The bond that remains can bear daylight.", zh: "留下来的关系，已经经得住白天。", tone: "final" },
    ],
    financial: [
      { en: "The numbers have spoken, and they did not tremble.", zh: "数字已经发言，而且没有发抖。", tone: "final" },
      { en: "This wager became a plan before it became a leap.", zh: "这次下注，先变成了计划，才变成一步。", tone: "warm" },
      { en: "What you are buying now is not fantasy but ground.", zh: "你现在买下的，不是幻觉，而是地面。", tone: "final" },
    ],
    social: [
      { en: "The line is drawn. Even silence must respect it.", zh: "线已经划下，连沉默都得尊重它。", tone: "final" },
      { en: "This decision no longer asks permission to stand.", zh: "这个决定，已经不再请求谁批准它站着。", tone: "sharp" },
      { en: "You have chosen consequence with open eyes.", zh: "你是睁着眼睛，选下了后果。", tone: "final" },
    ],
    lifestyle: [
      { en: "The old life has been out-argued.", zh: "旧生活已经输掉了辩论。", tone: "sharp" },
      { en: "Your habits now salute a different flag.", zh: "你的习惯，已经开始向新的旗帜敬礼。", tone: "warm" },
      { en: "This change is no longer aspiration but law.", zh: "这份改变，不再是愿望，而像法律。", tone: "final" },
    ],
    general: [
      { en: "The court sees no reason to delay your path.", zh: "本庭看不出，还该有什么理由拖住你。", tone: "final" },
      { en: "The verdict is clear because the record is brave.", zh: "判决之所以清楚，是因为卷宗足够勇敢。", tone: "warm" },
      { en: "The door is open. History can wait outside.", zh: "门已经开了，历史先在门外等着。", tone: "final" },
    ],
  },
};
