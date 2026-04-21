import { useEffect, useMemo, useState } from "react";
import { FadeInUp } from "../components/ui/FadeInUp";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Check, X as RejectIcon, User, Tag, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { approveReview, listPendingReviews, rejectReview } from "../lib/api";

const mockTrendData = [
  { day: "周一", views: 2400 },
  { day: "周二", views: 1398 },
  { day: "周三", views: 9800 },
  { day: "周四", views: 3908 },
  { day: "周五", views: 4800 },
  { day: "周六", views: 3800 },
  { day: "周日", views: 4300 },
];

const mockReviews = [
  {
    id: 1,
    title: "孕期高血糖的三餐搭配法则，你吃对了吗？",
    doctor: "张雪峰 · 产科主任",
    tags: ["图文", "内分泌", "孕期营养"],
    thumb: "https://picsum.photos/seed/doc1/200/200",
    date: "10 分钟前",
  },
  {
    id: 2,
    title: "儿童秋季呼吸道防护指南 (视频讲解)",
    doctor: "李思研 · 儿科主治",
    tags: ["视频", "儿科", "当季高发"],
    thumb: "https://picsum.photos/seed/doc2/200/200",
    date: "1 小时前",
  },
  {
    id: 3,
    title: "顺产与剖腹产：临床医生的全方位评估建议",
    doctor: "赵明明 · 妇产科",
    tags: ["图文", "分娩", "孕晚期"],
    thumb: "https://picsum.photos/seed/doc3/200/200",
    date: "昨天 15:30",
  }
];

// Counting hook for animated numbers
function AnimatedCounter({ value }: { value: number }) {
  // In a real implementation using motion, we'd animate the value. 
  // Doing a static fast string for simplicity here matching the style.
  return <span className="tabular-nums">{value.toLocaleString()}</span>;
}

export function AdminDashboard() {
  const [selectedReview, setSelectedReview] = useState<typeof mockReviews[0] | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    // This page represents admin mode for the demo.
    localStorage.setItem("role", "admin");
    localStorage.setItem("userId", "admin_1");

    setIsLoading(true);
    listPendingReviews()
      .then((items) => {
        if (!alive) return;
        setPending(items);
      })
      .finally(() => {
        if (!alive) return;
        setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const pendingUi = useMemo(() => {
    return pending.map((s) => ({
      id: s.id,
      title: s.title,
      doctor: s.userId ? `${s.userId} · 医生投稿` : "医生投稿",
      tags: Array.isArray(s.tags) ? s.tags : ["图文"],
      thumb:
        s.coverImage ||
        `https://picsum.photos/seed/sub_${s.id}/200/200`,
      date: s.createdAt ? new Date(s.createdAt).toLocaleString("zh-CN") : "刚刚",
      _raw: s,
    }));
  }, [pending]);

  const handleApprove = async (id: number) => {
    await approveReview(id, "审核通过");
    setPending((p) => p.filter((x) => x.id !== id));
    setSelectedReview(null);
  };

  const handleReject = async (id: number) => {
    await rejectReview(id, "内容需补充权威来源或完善表述");
    setPending((p) => p.filter((x) => x.id !== id));
    setSelectedReview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative">
      <FadeInUp>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-8">内容审核中心</h1>
      </FadeInUp>

      {/* Metric Cards */}
      <FadeInUp delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
             { label: "全院总阅读量", value: 482094, percent: "+12%" },
             { label: "待审核资源", value: isLoading ? 0 : pending.length, percent: "-2%" },
             { label: "本月新增资源", value: 156, percent: "+24%" },
          ].map((stat, i) => (
             <div key={i} className="bento-card p-6">
               <div className="text-sm font-medium text-[#86868B] mb-2">{stat.label}</div>
               <div className="flex items-baseline gap-3">
                 <div className="text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                   <AnimatedCounter value={stat.value} />
                 </div>
                 <div className={cn("text-sm font-medium", stat.percent.startsWith('+') ? "text-green-600" : "text-gray-500")}>
                   {stat.percent}
                 </div>
               </div>
             </div>
          ))}
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <FadeInUp delay={0.2} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">待审核队列</h2>
            {isLoading ? (
              <div className="bento-card p-10 text-center text-[#86868B]">正在加载待审核队列...</div>
            ) : pendingUi.length === 0 ? (
              <div className="bento-card p-10 text-center text-[#86868B]">暂无待审核内容</div>
            ) : pendingUi.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedReview(item)}
                className="group flex flex-col sm:flex-row items-start sm:items-center p-4 bento-card cursor-pointer"
              >
                {/* Thumb */}
                <div className="w-full sm:w-24 h-40 sm:h-24 rounded-2xl overflow-hidden shrink-0 mb-4 sm:mb-0">
                  <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                {/* Info */}
                <div className="sm:ml-6 flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1 group-hover:text-[#0066CC] transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#86868B] mb-2">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.doctor}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" /> 通过
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReject(item.id); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    <RejectIcon className="w-4 h-4" /> 驳回
                  </button>
                </div>
              </div>
            ))}
          </FadeInUp>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-1">
          <FadeInUp delay={0.3}>
            <div className="bento-card p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-1">过去7天阅读量趋势</h2>
              <p className="text-sm text-[#86868B] mb-6">全院患者科普数据统计</p>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrendData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066CC" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#86868B', fontSize: 12 }} 
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#0066CC', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#0066CC" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>

      {/* Slide-over Preview Panel */}
      <AnimatePresence>
        {selectedReview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReview(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white z-50 shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white w-full z-10 shrink-0">
                <h2 className="font-semibold text-lg text-[#1D1D1F]">文章预览</h2>
                <button onClick={() => setSelectedReview(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <RejectIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                <img src={selectedReview.thumb} alt="Cover" className="w-full h-64 object-cover rounded-3xl mb-8" referrerPolicy="no-referrer" />
                <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-4">{selectedReview.title}</h1>
                <div className="flex items-center gap-4 text-sm text-[#86868B] mb-8 pb-8 border-b border-gray-100">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {selectedReview.doctor}</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4"/> 1,200 预览次</span>
                </div>
                <div className="prose prose-lg text-[#1D1D1F] leading-relaxed">
                  {(selectedReview._raw?.content || "")
                    .split("。")
                    .filter(Boolean)
                    .slice(0, 12)
                    .map((p: string, i: number) => (
                      <p key={i}>{p}。</p>
                    ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-gray-100 bg-[#F5F5F7] flex gap-4 shrink-0">
                <button
                  onClick={() => handleReject(selectedReview.id)}
                  className="flex-1 py-3.5 bg-red-100 text-red-700 font-semibold rounded-2xl hover:bg-red-200 transition-colors"
                >
                  驳回内容
                </button>
                <button
                  onClick={() => handleApprove(selectedReview.id)}
                  className="flex-[2] py-3.5 bg-[#0066CC] hover:bg-[#0055AA] text-white font-semibold rounded-2xl transition-colors"
                >
                  审批通过并发布
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
