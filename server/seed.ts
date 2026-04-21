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
  return [
    `**主题**：${topicTitle}`,
    "",
    "### 一句话结论",
    "先抓住“关键指标 + 正确做法 + 何时就医”三件事，避免被碎片信息带节奏。",
    "",
    "### 你可以这样做（可执行清单）",
    "- **先确认现状**：记录孕周/症状出现时间/是否伴随发热、出血、腹痛等。",
    "- **优先生活方式调整**：饮食结构、作息、补充剂用量遵医嘱，别叠加过多保健品。",
    "- **建立观察记录**：每天同一时间记录 1-2 个核心指标（体重/胎动/喂养/排便）。",
    "",
    "### 什么时候需要尽快就医",
    "- **症状突然加重** 或出现 **持续腹痛、明显出血、持续呕吐无法进食/脱水**",
    "- 新生儿/婴幼儿出现 **嗜睡反应差、呼吸费力、持续高热**",
    "",
    "### 常见误区",
    "- **把“经验”当“证据”**：同款症状不同病因，处理方式可能相反。",
    "- **自行加量**：补铁/叶酸/维生素等并非越多越好。",
    "",
    "> 温馨提示：本文为科普参考，不替代面诊。若你属于高危人群或有基础疾病，请以医生建议为准。",
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

