import type { Resource } from "../src/data/mockResources";

type Stage = "孕早期" | "孕中期" | "孕晚期" | "新生儿" | "婴幼儿";

const stageTopics: Record<Stage, { title: string; tags: string[] }[]> = {
  "孕早期": [
    { title: "叶酸怎么补更科学？剂量、时间与常见误区", tags: ["叶酸", "营养", "孕早期"] },
    { title: "孕吐缓解的5个实用办法：饮食、作息与就医信号", tags: ["孕吐", "生活方式", "孕早期"] },
    { title: "早孕检查要查什么？HCG/孕酮/超声怎么理解", tags: ["产检", "超声", "孕早期"] },
  ],
  "孕中期": [
    { title: "糖耐检查全攻略：前一天怎么吃？结果怎么看？", tags: ["糖耐", "产检", "孕中期"] },
    { title: "补铁要不要？怎么补更安全：贫血指标与饮食搭配", tags: ["补铁", "营养", "孕中期"] },
    { title: "胎动从什么时候开始算？记录方法与异常信号", tags: ["胎动", "监测", "孕中期"] },
  ],
  "孕晚期": [
    { title: "待产包清单（按场景整理）：住院/宝宝/证件一次备齐", tags: ["待产包", "分娩", "孕晚期"] },
    { title: "临产征兆怎么分辨？见红/破水/宫缩的处理顺序", tags: ["临产", "分娩", "孕晚期"] },
    { title: "孕晚期睡眠与水肿：缓解姿势、运动与就医提示", tags: ["水肿", "睡眠", "孕晚期"] },
  ],
  "新生儿": [
    { title: "新生儿黄疸：生理性还是病理性？家庭观察要点", tags: ["黄疸", "儿科", "新生儿"] },
    { title: "新生儿喂养与拍嗝：频率、量感与呛奶风险提示", tags: ["喂养", "护理", "新生儿"] },
    { title: "脐带护理怎么做？消毒、沾水与红肿处理", tags: ["脐带", "护理", "新生儿"] },
  ],
  "婴幼儿": [
    { title: "辅食添加时间表：第一口吃什么？过敏怎么观察", tags: ["辅食", "过敏", "婴幼儿"] },
    { title: "发热家庭处理清单：体温分级、退热药与就医时机", tags: ["发热", "用药", "婴幼儿"] },
    { title: "睡眠倒退期怎么应对？规律建立与安抚策略", tags: ["睡眠", "行为", "婴幼儿"] },
  ],
};

function pick<T>(arr: T[], idx: number) {
  return arr[idx % arr.length];
}

function readTimeFromContentLen(len: number) {
  const mins = Math.min(12, Math.max(4, Math.round(len / 380)));
  return `${mins} min`;
}

function contentTemplate(stage: Stage, topicTitle: string) {
  const intro = [
    `在${stage}阶段，很多准妈妈和家庭都会面临“${topicTitle}”的困惑。`,
    "作为专业的母婴科普平台，我们邀请了多位临床经验丰富的专家，为您整理了这份科学指南。",
    "本文将从原理解析、日常实操、风险预警三个维度，帮您建立清晰的认知体系。",
  ].join("");

  return [
    `# ${topicTitle}`,
    "",
    intro,
    "",
    "## 📖 核心知识要点",
    "### 1. 为什么这个阶段很重要？",
    "研究表明，${stage}是胎儿/宝宝发育的关键窗口期。此时的每一个细微变化都可能影响未来的健康基石。科学的应对不仅能缓解焦虑，更能有效规避潜在风险。",
    "",
    "### 2. 必须掌握的3个关键指标",
    "- **核心指标 A**：生理性波动的正常范围，通常在 10%-15% 之间。",
    "- **核心指标 B**：持续观察的时间维度，建议以“周”为单位记录趋势。",
    "- **核心指标 C**：伴随症状的关联性，注意是否出现异常的分泌物或体温波动。",
    "",
    "## 🛠️ 专家建议：你可以这样做",
    "### 生活方式的“加减法”",
    "1. **【加】优质营养摄入**：重点关注优质蛋白、叶酸及微量元素的补充，建议每日饮食种类不少于 12 种。",
    "2. **【加】规律监测记录**：使用“好孕学堂”工具记录每日数据，形成动态曲线图。",
    "3. **【减】环境压力源**：远离烟酒、高辐射环境，保证每日 8-10 小时的充足睡眠。",
    "4. **【减】盲目焦虑**：停止在非专业社交平台搜索症状，优先查阅权威医学数据库。",
    "",
    "## 🚨 红色预警：什么时候必须就医？",
    "如果出现以下任何一种情况，请不要等待，立即前往医院急诊：",
    "- **突发剧痛**：伴随冷汗或意识模糊的腹部、头部剧痛。",
    "- **明显出血**：颜色鲜红或量大，无论是否伴随疼痛。",
    "- **异常胎动/反应**：明显低于平日基线水平 50% 以上，或宝宝出现持续性尖叫、嗜睡。",
    "",
    "## 💡 温馨提示（专家点评）",
    "> “每个人的体质和孕育环境都是独特的。科普的意义在于提供‘标准参考’，而临床面诊才能给出‘个性化方案’。保持良好心态，定期产检，是迎接健康宝宝的唯一捷径。” —— *张医生 · 首席科普顾问*",
    "",
    "---",
    "*本文内容经“好孕学堂”医学专家组审核通过，仅供科普参考，不作为临床诊断依据。*",
  ].join("\n");
}

function imageFor(stage: Stage, id: number) {
  // Default stage cover (stable local static assets).
  if (stage === "孕早期") return "/images/stage-preg-early.svg";
  if (stage === "孕中期") return "/images/stage-preg-mid.svg";
  if (stage === "孕晚期") return "/images/stage-preg-late.svg";
  if (stage === "新生儿") return "/images/stage-newborn.svg";
  return "/images/stage-toddler.svg";
}

function authorFor(stage: Stage, idx: number) {
  const base =
    stage === "新生儿" || stage === "婴幼儿"
      ? ["赵明明 · 儿科", "李思研 · 儿科", "王医生 · 儿保科"]
      : ["张雪峰 · 产科", "李思研 · 妇产科", "王医生 · 优生科"];
  return pick(base, idx);
}

function colSpanFor(id: number) {
  // occasional "featured" cards for bento layout variety
  if (id % 17 === 1) return "col-span-1 md:col-span-2 md:row-span-2";
  if (id % 13 === 0) return "col-span-1 md:col-span-2";
  return "col-span-1 md:col-span-1";
}

export const seedResources = async (targetCount = 200) => {
  const mod = await import("../src/data/mockResources");
  const base = (mod.mockResources ?? []) as Resource[];

  const stages: Stage[] = ["孕早期", "孕中期", "孕晚期", "新生儿", "婴幼儿"];
  const out: Omit<Resource, "status" | "createdAt" | "updatedAt">[] = [];

  for (let i = 1; i <= targetCount; i++) {
    const stage = pick(stages, i - 1);
    const topic = pick(stageTopics[stage], i - 1);
    const title = `${topic.title}（第${i}期）`;
    const content = contentTemplate(stage, topic.title);
    const tags = Array.from(new Set([stage, "专题科普", "医学查证", ...topic.tags])).slice(0, 6);

    out.push({
      id: i,
      title,
      image: imageFor(stage, i),
      filterTag: stage,
      tags,
      readTime: readTimeFromContentLen(content.length),
      colSpan: colSpanFor(i),
      author: authorFor(stage, i),
      content,
    });
  }

  // If base data exists, prefer its first few titles (but still rewrite content/images to match主题更一致)
  for (let i = 0; i < Math.min(base.length, out.length); i++) {
    out[i] = {
      ...out[i],
      title: base[i].title,
      filterTag: base[i].filterTag as Stage,
      tags: Array.from(new Set([base[i].filterTag, "专题科普", "医学查证", ...(base[i].tags ?? [])])).slice(0, 6),
      image: imageFor(base[i].filterTag as Stage, out[i].id),
      author: base[i].author,
      content: contentTemplate(base[i].filterTag as Stage, base[i].title),
      readTime: readTimeFromContentLen(contentTemplate(base[i].filterTag as Stage, base[i].title).length),
    };
  }

  return out;
};

