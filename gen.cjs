const fs = require('fs');

const titles = [
  "孕早期营养指南：叶酸到底怎么补？",
  "待产包避坑清单，真实宝妈极力推荐",
  "新生儿黄疸：生理性还是病理性？",
  "缓解孕吐的5个实用小贴士",
  "婴儿辅食添加：第一口该吃什么？",
  "孕中期产检指南：唐筛与四维彩超攻略",
  "产后抑郁的预防与心理调适",
  "婴幼儿睡眠训练：告别落地醒",
  "孕期运动指南：可以做哪些运动？",
  "母乳喂养初期常见问题及解决办法",
  "新生儿疫苗接种时间表详解",
  "如何判断宝宝是不是肠绞痛？",
  "孕期控糖：妊娠期糖尿病怎么吃？",
  "宝宝红屁股（尿布疹）如何护理？",
  "产检中的胎心监护怎么看？",
  "新生儿脐带护理注意事项",
  "宝宝发烧如何物理降温？",
  "孕期抽筋是怎么回事？要补钙吗？",
  "一岁内宝宝坚决不能碰的食物",
  "无痛分娩到底痛不痛？",
  "如何科学应对宝宝的猛长期？",
  "孕晚期见红、破水、规律宫缩的区别",
  "产后骨盆修复是不是智商税？",
  "宝宝多大可以开始刷牙？",
  "孕期可以养宠物吗？弓形虫防治",
  "怎样判断母乳够不够宝宝吃？",
  "新生儿吐奶、漾奶的正确拍嗝手法",
  "孕期护肤与化妆品成分避雷",
  "宝宝长牙期的烦躁如何缓解？",
  "产后脱发严重怎么办？",
  "婴儿枕秃是因为缺钙吗？",
  "孕期耻骨痛该怎么缓解？",
  "如何给新生儿洗澡及水温控制",
  "断奶的科学方法与回奶注意事项",
  "产后腹直肌分离如何评估和恢复",
  "爬行期宝宝的安全防护指南",
  "孕检胎位不正怎么办能转过来吗？",
  "宝宝便秘和攒肚的区别与对策",
  "孕妇感冒发烧可以吃药吗？",
  "背带和婴儿推车的选购建议",
  "宝宝辅食中肉类的添加顺序",
  "孕晚期睡不着？改善孕期睡眠质量",
  "新生儿头型能睡圆吗？预防偏头",
  "产前阵痛该如何呼吸缓解？",
  "宝宝说话晚是贵人语迟吗？",
  "产后第一次大姨妈什么时候来？",
  "什么是手足口病及如何预防？",
  "孕期贫血对胎儿有什么影响？",
  "夜间频繁夜醒？排查这6个原因",
  "陪产指南：准爸爸进产房该做些什么"
];

const authors = ["李思研 · 妇产科", "张雪峰 · 产科", "赵明明 · 儿科", "王医生 · 优生科", "刘雪 · 营养师", "陈建国 · 超声科"];

function getFilter(title) {
    if (title.includes("产后") || title.includes("月子")) return "孕晚期";
    if (title.includes("婴儿") || title.includes("宝宝") || title.includes("辅食") || title.includes("牙") || title.includes("疫苗")) return "婴幼儿";
    if (title.includes("新生儿") || title.includes("脐带") || title.includes("黄疸")) return "新生儿";
    if (title.includes("孕期") || title.includes("孕妇") || title.includes("唐筛")) return "孕中期";
    if (title.includes("孕早期") || title.includes("孕吐") || title.includes("胎心")) return "孕早期";
    if (title.includes("待产") || title.includes("分娩") || title.includes("宫缩")) return "孕晚期";
    return "孕早期";
}

const images = [
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519783515438-e6b7201c107f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505934333218-8fe3871ff240?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=800&auto=format&fit=crop"
];

const resources = titles.map((t, index) => {
    const filter = getFilter(t);
    const imgId = 1000 + index;
    const image = index < 6 ? images[index] : `https://picsum.photos/seed/${imgId}/800/600`;
    return {
        id: index + 1,
        title: t,
        image: image,
        filterTag: filter,
        tags: [filter, "专题科普", "医学查证"],
        readTime: Math.floor(Math.random() * 5 + 3) + " min",
        colSpan: index % 7 === 0 ? "col-span-1 md:col-span-2 md:row-span-2" : "col-span-1 md:col-span-1",
        author: authors[index % authors.length],
        content: `这是一篇关于【${t}】的科普内容。\n\n我们在临床上遇到了很多类似的问题，孕产妇和家属往往存在许多焦虑和疑问。根据最新国内外权威母婴健康指南建议，面对这些问题，最科学的做法是保持放松的心态，采取循序渐进的科学护理方式。\n\n1. **科学评估**：不要盲目跟风，要根据孕周和宝宝成长的具体情况评估。\n2. **日常行动**：保持良好的生活和卫生习惯，科学合理膳食与适度运动。\n3. **及时就医**：一旦发现身体不适及宝宝发出的异常信号，随时就诊，切勿因为轻信民间偏方而延误最佳时机。\n\n好孕学堂在此陪伴您的每一个孕育瞬间，祝每一位准妈孕顺利，宝贝们健康茁壮地成长。`
    }
});

const fileContent = `export type Resource = {
  id: number;
  title: string;
  image: string;
  filterTag: string;
  tags: string[];
  readTime: string;
  colSpan: string;
  author: string;
  content: string;
};

export const mockResources: Resource[] = ${JSON.stringify(resources, null, 2)};
`;

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/mockResources.ts', fileContent);
console.log("50 posts generated.");
