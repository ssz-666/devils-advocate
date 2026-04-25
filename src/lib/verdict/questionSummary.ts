"use client";

import { classifyDecision } from "@/lib/verdict/classifier";

function normalize(statement: string) {
  return statement
    .replace(/\s+/g, " ")
    .replace(/[“”"']/g, "")
    .trim()
    .toLowerCase();
}

function includesAny(source: string, patterns: string[]) {
  return patterns.some((pattern) => source.includes(pattern));
}

function fallbackFromRaw(statement: string) {
  const cleaned = statement.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "关于一项个人决定是否值得推进的判断";
  }

  if (cleaned.length <= 18) {
    return `关于“${cleaned}”是否值得推进的判断`;
  }

  return `关于“${cleaned.slice(0, 18)}…”是否值得推进的判断`;
}

export function summarizeDecisionQuestion(statement: string) {
  const normalized = normalize(statement);
  const category = classifyDecision(statement);

  if (!normalized) {
    return "关于一项个人决定是否值得推进的判断";
  }

  if (
    includesAny(normalized, [
      "ai",
      "人工智能",
      "大模型",
      "算法",
      "机器学习",
      "automation",
      "llm",
    ])
  ) {
    if (includesAny(normalized, ["失业", "工作", "就业", "layoff", "job loss", "unemployment"])) {
      return "关于人工智能是否正在造成真实就业伤害的判断";
    }
    if (includesAny(normalized, ["危险", "威胁", "harm", "danger", "risk"])) {
      return "关于人工智能是否会对人类造成系统性伤害的判断";
    }
    return "关于人工智能发展是否值得警惕的判断";
  }

  if (category === "career") {
    if (includesAny(normalized, ["辞职", "离职", "quit", "resign"])) {
      return "关于是否离开当前工作、承担转向代价的判断";
    }
    if (includesAny(normalized, ["跳槽", "offer", "job switch", "switch jobs"])) {
      return "关于是否切换工作机会、重押下一段职业路径的判断";
    }
    if (includesAny(normalized, ["转行", "career change"])) {
      return "关于是否放弃原赛道、改写职业身份的判断";
    }
    if (includesAny(normalized, ["创业", "startup", "founder"])) {
      return "关于是否用稳定去交换创业可能性的判断";
    }
    if (includesAny(normalized, ["考研", "考公", "graduate school", "civil service"])) {
      return "关于是否延迟兑现现实、换取未来筹码的判断";
    }
    return "关于职业方向与现实代价是否匹配的判断";
  }

  if (category === "relationship") {
    if (includesAny(normalized, ["分手", "breakup", "break up"])) {
      return "关于是否结束一段关系、接受情感后果的判断";
    }
    if (includesAny(normalized, ["复合", "reconcile", "get back"])) {
      return "关于是否回到旧关系、再次承担旧问题的判断";
    }
    if (includesAny(normalized, ["结婚", "marry", "marriage"])) {
      return "关于是否进入长期承诺、承担共同生活重量的判断";
    }
    if (includesAny(normalized, ["离婚", "divorce"])) {
      return "关于是否终止婚姻、重建个人秩序的判断";
    }
    if (includesAny(normalized, ["告白", "confess"])) {
      return "关于是否把感情推向明处的判断";
    }
    return "关于亲密关系是否值得继续推进的判断";
  }

  if (category === "financial") {
    if (includesAny(normalized, ["买房", "house", "mortgage", "首付"])) {
      return "关于是否承担长期房产承诺与现金流压力的判断";
    }
    if (includesAny(normalized, ["买车", "car"])) {
      return "关于是否为消费与便利承担持续财务成本的判断";
    }
    if (includesAny(normalized, ["贷款", "loan", "debt"])) {
      return "关于是否接受债务压力来换取当下选择的判断";
    }
    if (includesAny(normalized, ["投资", "基金", "股票", "invest", "fund", "stock"])) {
      return "关于是否承担风险、押注未来回报的判断";
    }
    return "关于金钱风险与长期收益是否成比例的判断";
  }

  if (category === "social") {
    if (includesAny(normalized, ["断绝", "绝交", "cut off", "no contact"])) {
      return "关于是否切断一段关系、守住边界成本的判断";
    }
    if (includesAny(normalized, ["举报", "report", "expose"])) {
      return "关于是否揭发问题、承担随之而来的冲突的判断";
    }
    if (includesAny(normalized, ["和解", "reconcile", "make peace"])) {
      return "关于是否放下对抗、转向和解路径的判断";
    }
    if (includesAny(normalized, ["对抗", "confront"])) {
      return "关于是否正面冲突、接受关系代价的判断";
    }
    return "关于边界、立场与后果承担的判断";
  }

  if (category === "lifestyle") {
    if (includesAny(normalized, ["搬家", "move", "relocate"])) {
      return "关于是否迁移生活、接受环境更替代价的判断";
    }
    if (includesAny(normalized, ["移民", "immigrate"])) {
      return "关于是否离开熟悉秩序、换取另一种生活的判断";
    }
    if (includesAny(normalized, ["戒烟", "quit smoking"])) {
      return "关于是否切断旧习、重建身体秩序的判断";
    }
    if (includesAny(normalized, ["戒酒", "quit drinking"])) {
      return "关于是否摆脱依赖、重整生活节奏的判断";
    }
    if (includesAny(normalized, ["减肥", "lose weight", "fitness"])) {
      return "关于是否长期重塑身体与生活方式的判断";
    }
    return "关于生活方式改变是否足以持续的判断";
  }

  return fallbackFromRaw(statement);
}
