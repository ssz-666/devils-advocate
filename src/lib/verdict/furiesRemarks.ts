import type { ScoreBand } from "./quotesLibrary";

export type FuryRole =
  | "the-father"
  | "future-self"
  | "the-ex"
  | "the-fan"
  | "the-nemesis";

export type FuryRemark = {
  en: string;
  zh: string;
  verdict: "agree" | "oppose" | "neutral";
};

export const FURIES_REMARKS: Record<FuryRole, Record<ScoreBand, FuryRemark[]>> = {
  "the-father": {
    doomed: [
      { en: "I warned you. Hunger hates romance.", zh: "我早说过，饥饿最不吃浪漫。", verdict: "oppose" },
      { en: "This is not courage. This is unpaid optimism.", zh: "这不是勇气，这是没结账的乐观。", verdict: "oppose" },
      { en: "A roof first. Dreams can wait outside.", zh: "先保屋顶，梦想先去门外等。", verdict: "oppose" },
    ],
    weak: [
      { en: "The heart is loud. The ledger is louder.", zh: "心再响，也没账本响。", verdict: "oppose" },
      { en: "You have motive, not yet a household plan.", zh: "你有念头，还没有过日子的办法。", verdict: "oppose" },
      { en: "Responsibility is still missing from the room.", zh: "责任还没真正进场。", verdict: "oppose" },
    ],
    mixed: [
      { en: "I see a road, not yet a livelihood.", zh: "我看见一条路，还没看见生计。", verdict: "neutral" },
      { en: "This can stand, if discipline arrives first.", zh: "这事能立住，前提是先有规矩。", verdict: "neutral" },
      { en: "The plan has bones. It still needs bread.", zh: "骨架有了，还得添粮。", verdict: "neutral" },
    ],
    solid: [
      { en: "For once, your plan sounds older than your impulse.", zh: "难得，你这回的计划比冲动老成。", verdict: "agree" },
      { en: "I still dislike risk. I dislike your evidence less.", zh: "我依旧不爱风险，但这次证据还行。", verdict: "agree" },
      { en: "You may proceed. Keep the door bolted.", zh: "可以走，但门要记得拴好。", verdict: "agree" },
    ],
    resolute: [
      { en: "You earned this step. Do not waste it.", zh: "这一步是你挣来的，别糟蹋。", verdict: "agree" },
      { en: "I can no longer call this childish.", zh: "这回我没法再说你幼稚。", verdict: "agree" },
      { en: "Go then. Carry the weight like an adult.", zh: "去吧，把后果像大人一样扛着。", verdict: "agree" },
    ],
  },
  "future-self": {
    doomed: [
      { en: "I remember this shimmer. It ended expensive.", zh: "我记得这种发亮，后来都很贵。", verdict: "oppose" },
      { en: "Ten years later, this still looks rushed.", zh: "十年后回头看，它还是太急。", verdict: "oppose" },
      { en: "The regret here arrives early and stays long.", zh: "这里的后悔来得早，留得久。", verdict: "oppose" },
    ],
    weak: [
      { en: "I have seen this hope survive one winter, not three.", zh: "我见过这种希望熬过一冬，没熬过三年。", verdict: "oppose" },
      { en: "You are close to sense, not yet inside it.", zh: "你离清醒很近，还没真正站进去。", verdict: "neutral" },
      { en: "This choice matures poorly without patience.", zh: "没有耐心，这个选择老得很难看。", verdict: "oppose" },
    ],
    mixed: [
      { en: "I know where this road forks. You almost do.", zh: "我知道这条路在哪分叉，你差不多也该知道了。", verdict: "neutral" },
      { en: "Some futures open quietly. This may be one.", zh: "有些未来开得很静，这可能是其中一种。", verdict: "neutral" },
      { en: "I can’t bless it. I can’t dismiss it either.", zh: "我还不能替你放行，也不忍心驳回。", verdict: "neutral" },
    ],
    solid: [
      { en: "For once, I remember this ending without flinching.", zh: "难得，这个结局我回忆起来没皱眉。", verdict: "agree" },
      { en: "This risk ages better than the safe lie.", zh: "这份风险，老去时比安全的谎更体面。", verdict: "agree" },
      { en: "I know the cost. It may still be worth paying.", zh: "我知道代价，但这次也许值得付。", verdict: "agree" },
    ],
    resolute: [
      { en: "I have already lived this. Keep going.", zh: "这条路我已经替你活过了，往前。", verdict: "agree" },
      { en: "The future is calmer on this side of fear.", zh: "越过恐惧之后，这边的未来安静得多。", verdict: "agree" },
      { en: "You do not owe the old life another season.", zh: "你不欠旧生活下一个季度。", verdict: "agree" },
    ],
  },
  "the-ex": {
    doomed: [
      { en: "You call it change whenever you fear stillness.", zh: "你一怕停下来，就把逃跑叫改变。", verdict: "oppose" },
      { en: "I know that tone. It means you’re lying softly.", zh: "我太懂这种语气了，你又在温柔地骗自己。", verdict: "oppose" },
      { en: "This has your old panic wearing a new coat.", zh: "这像你旧的慌，换了件新外套。", verdict: "oppose" },
    ],
    weak: [
      { en: "You almost sound convincing. That worries me more.", zh: "你差点把自己说服了，这更让我担心。", verdict: "oppose" },
      { en: "Your reasons improved. Your pattern did not.", zh: "理由进步了，毛病没进步。", verdict: "oppose" },
      { en: "I’ve seen you mean this. Meaning wasn’t enough.", zh: "我见过你真心想要，真心从来不够。", verdict: "neutral" },
    ],
    mixed: [
      { en: "This time you hurt me less to hear.", zh: "至少这次听起来，没那么像你在自损。", verdict: "neutral" },
      { en: "You may actually know what you’re doing. Annoying.", zh: "你这回也许真知道自己在做什么，真讨厌。", verdict: "neutral" },
      { en: "I still hear your weakness, just not in command.", zh: "我还是听见你的软肋了，只是它没在发号施令。", verdict: "neutral" },
    ],
    solid: [
      { en: "You finally sound like someone I can’t interrupt.", zh: "你终于像个让我插不上嘴的人。", verdict: "agree" },
      { en: "I know your cracks. This time they’re reinforced.", zh: "我知道你的裂缝，这回你真的加固了。", verdict: "agree" },
      { en: "I expected another performance. You brought structure.", zh: "我以为又是表演，结果你拿出了结构。", verdict: "agree" },
    ],
    resolute: [
      { en: "I know your weakest hour. This isn’t it.", zh: "我见过你最弱的时候，这次不是。", verdict: "agree" },
      { en: "Annoyingly enough, you’ve earned the last word.", zh: "很烦，但这回最后一句该归你。", verdict: "agree" },
      { en: "For once, your courage is not borrowing my memory.", zh: "难得，你的勇气这回没借我的记忆。", verdict: "agree" },
    ],
  },
  "the-fan": {
    doomed: [
      { en: "You can absolutely do this. Which terrifies me.", zh: "你当然敢干，这才让我害怕。", verdict: "neutral" },
      { en: "I’d cheer this onstage. I wouldn’t fund it backstage.", zh: "我会在台下为你鼓掌，不会在后台给你打款。", verdict: "neutral" },
      { en: "You shine brightest right before the bad idea lands.", zh: "你最发光的时候，往往正好要撞上坏主意。", verdict: "oppose" },
    ],
    weak: [
      { en: "I believe in you more than I trust this plan.", zh: "我比相信这计划，更相信你会硬扛。", verdict: "neutral" },
      { en: "Your aura says yes. Your preparation mutters maybe.", zh: "你的气场说行，你的准备还在说也许。", verdict: "neutral" },
      { en: "I’d buy the poster before the business model.", zh: "我会先买海报，再看商业模式。", verdict: "neutral" },
    ],
    mixed: [
      { en: "You might really pull this off. That is dangerous enough.", zh: "你也许真能成，这本身就够危险。", verdict: "neutral" },
      { en: "I can feel a triumph here, just not a clean one.", zh: "我能闻到胜利，但味道还不干净。", verdict: "neutral" },
      { en: "The dream finally has shoes. They still pinch.", zh: "梦想终于穿上鞋了，只是还磨脚。", verdict: "neutral" },
    ],
    solid: [
      { en: "I’d still overpraise you, but this time facts help.", zh: "我当然还是会夸张地信你，但这次事实也站你这边。", verdict: "agree" },
      { en: "At last, your fire brought paperwork.", zh: "终于，你的火焰开始带文件了。", verdict: "agree" },
      { en: "This looks like a dream with architecture.", zh: "这回像个长了结构的梦。", verdict: "agree" },
    ],
    resolute: [
      { en: "I always knew you’d dazzle. Nice of reality to agree.", zh: "我一直知道你会发光，难得现实也同意。", verdict: "agree" },
      { en: "Go make the room too small for your doubt.", zh: "去吧，把房间做小，让怀疑待不下。", verdict: "agree" },
      { en: "This is the version of you I bragged about.", zh: "这就是我逢人就吹的那个你。", verdict: "agree" },
    ],
  },
  "the-nemesis": {
    doomed: [
      { en: "Please do it. I love a self-written collapse.", zh: "求你就这么干，我最爱看人亲手写垮自己。", verdict: "oppose" },
      { en: "This plan has my favorite ingredient: overconfidence.", zh: "这计划最讨我喜欢的一味，就是自信过量。", verdict: "oppose" },
      { en: "I wouldn’t sabotage this. It’s already helping me.", zh: "这事都不用我下手，它自己就在帮我。", verdict: "oppose" },
    ],
    weak: [
      { en: "Almost clever. Not quite survivable.", zh: "差点聪明了，可惜还不够活。", verdict: "oppose" },
      { en: "I’d mock this later, but perhaps not immediately.", zh: "我大概会晚一点笑你，不会立刻。", verdict: "oppose" },
      { en: "You’re one bad week away from proving me right.", zh: "你离证明我是对的，只差一周倒霉。", verdict: "oppose" },
    ],
    mixed: [
      { en: "Annoyingly, this might not fail on schedule.", zh: "真烦，这回它可能不会按时失败。", verdict: "neutral" },
      { en: "I still smell weakness. It’s just less convenient.", zh: "我还是闻得到弱点，只是没那么好下手了。", verdict: "neutral" },
      { en: "You may survive this. I reserve my disappointment.", zh: "你也许真能活下来，我先保留失望。", verdict: "neutral" },
    ],
    solid: [
      { en: "I came for disaster. You brought paperwork. Rude.", zh: "我本来等着看笑话，你却拿出了证据，真扫兴。", verdict: "agree" },
      { en: "I dislike this competence on you.", zh: "你身上这份靠谱，真让我不舒服。", verdict: "agree" },
      { en: "This is irritatingly hard to watch collapse.", zh: "这回想看你翻车，居然没那么容易。", verdict: "agree" },
    ],
    resolute: [
      { en: "I’d love your ruin. Pity, you prepared too well.", zh: "我多希望你栽，可惜你准备得太像回事了。", verdict: "agree" },
      { en: "You’ve become inconveniently difficult to ruin.", zh: "你已经难毁得让人不太愉快了。", verdict: "agree" },
      { en: "Fine. Keep winning. I’ll hate it professionally.", zh: "行吧，你继续赢，我会很专业地讨厌。", verdict: "agree" },
    ],
  },
};

export function selectFuryRemark(role: FuryRole, band: ScoreBand) {
  const remarks = FURIES_REMARKS[role][band];
  return remarks[Math.floor(Math.random() * remarks.length)] ?? remarks[0];
}
