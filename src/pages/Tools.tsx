import { FadeInUp } from "../components/ui/FadeInUp";
import { Calculator, Calendar, Activity, Baby, X, ArrowRight, Play, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toolsList = [
    { id: "ued", name: "预产期计算器", desc: "精准测算宝宝见面的日子", icon: Calendar, color: "text-[#0066CC]", bg: "bg-[#0066CC]/10 border border-[#0066CC]/20" },
    { id: "kick", name: "胎动计数器", desc: "每日监测宝宝的健康律动", icon: Baby, color: "text-[#FF2D55]", bg: "bg-[#FF2D55]/10 border border-[#FF2D55]/20" },
    { id: "weight", name: "体重合理化", desc: "科学规划孕期营养与身型", icon: Calculator, color: "text-[#5856D6]", bg: "bg-[#5856D6]/10 border border-[#5856D6]/20" },
    { id: "schedule", name: "产检时间表", desc: "不再错过任何一次关键检查", icon: Activity, color: "text-[#34C759]", bg: "bg-[#34C759]/10 border border-[#34C759]/20" },
  ];

  // Tool 1: Due Date Calculator
  const DueDateModal = () => {
    const [date, setDate] = useState("");
    const [result, setResult] = useState<null | { eddc: string, weeks: string }>(null);

    const calculate = () => {
      if (!date) return;
      const lmp = new Date(date);
      const eddcDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmp.getTime());
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      setResult({
        eddc: eddcDate.toLocaleDateString('zh-CN'),
        weeks: `约 ${diffWeeks} 周`
      });
    };

    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-[#1D1D1F]">
          <Calendar className="w-6 h-6 text-[#0066CC]" /> 测算预产期
        </h2>
        <div className="space-y-4 flex-1">
          <label className="block text-sm font-medium text-[#86868B]">末次月经第一天</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#f3f4f6] border border-gray-200 rounded-xl px-4 py-3 text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#0066CC]/50" 
          />
          <button 
            onClick={calculate}
            className="w-full mt-4 bg-[#0066CC] text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition shadow-[0_4px_14px_rgba(0,102,204,0.3)] active:scale-[0.98]"
          >
            开始推算
          </button>
          
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex flex-col items-center">
               <p className="text-sm text-[#86868B] mb-1">预计宝宝降生日期</p>
               <p className="text-3xl font-bold text-[#0066CC] mb-4">{result.eddc}</p>
               <div className="w-full bg-white/60 p-4 rounded-xl flex justify-between text-sm">
                 <span className="text-[#86868B]">当前所处孕周</span>
                 <span className="font-semibold text-[#1D1D1F]">{result.weeks}</span>
               </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // Tool 2: Kick Counter
  const KickCounterModal = () => {
    const [count, setCount] = useState(0);
    const [isActive, setIsActive] = useState(false);

    return (
      <div className="flex flex-col h-full items-center text-center">
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-[#1D1D1F]">
          <Baby className="w-6 h-6 text-[#FF2D55]" /> 胎动计数器
        </h2>
        <p className="text-[#86868B] text-sm mb-8">每天早中晚各测1小时，正常胎动次数在3-5次/小时</p>
        
        <div className="relative w-48 h-48 mb-6">
          {/* Ripple effect rings */}
          {isActive && (
            <motion.div 
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-[#FF2D55]/20"
            />
          )}
          <button 
            onClick={() => { setCount(c => c + 1); setIsActive(true); }}
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#FF2D55] to-rose-400 rounded-full flex flex-col items-center justify-center text-white shadow-[0_8px_30px_rgba(255,45,85,0.4)] active:scale-95 transition-transform"
          >
            <span className="text-6xl font-bold font-mono tracking-tighter shadow-sm">{count}</span>
            <span className="text-sm opacity-90 mt-1 font-medium">点击计数</span>
          </button>
        </div>

        <div className="flex gap-4 w-full">
           <button onClick={() => { setCount(0); setIsActive(false); }} className="flex-1 bg-gray-100 text-[#86868B] py-3 rounded-xl hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2">
             <RefreshCcw className="w-4 h-4" /> 重新开始
           </button>
           <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition font-medium">
             保存记录
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Aesthetic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 z-10 h-full flex flex-col">
        <FadeInUp>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] mb-3">孕产工具箱</h1>
          <p className="text-[#86868B] text-lg mb-12 max-w-xl">
            提供经过循证医学验证的辅助测试工具，陪伴您科学记录孕期的每一个珍贵阶段。
          </p>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolsList.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={i} 
                  onClick={() => setActiveTool(tool.id)}
                  className="glass p-6 sm:p-8 rounded-[32px] flex flex-col justify-between h-56 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group border border-white/60 bg-white/40"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-500 ease-out shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">{tool.name}</h3>
                    <p className="text-sm text-[#86868B] line-clamp-2">{tool.desc}</p>
                  </div>
                  
                  <div className="absolute right-6 top-8 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className={`w-5 h-5 ${tool.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </FadeInUp>

        {/* Modal rendering logic */}
        <AnimatePresence>
          {activeTool && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveTool(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/90 glass border border-white/50 rounded-[32px] p-8 shadow-2xl z-[110]"
              >
                <button 
                  onClick={() => setActiveTool(null)}
                  className="absolute top-6 right-6 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-[#1D1D1F]" />
                </button>
                
                {activeTool === 'ued' && <DueDateModal />}
                {activeTool === 'kick' && <KickCounterModal />}
                {activeTool !== 'ued' && activeTool !== 'kick' && (
                  <div className="text-center py-10">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Play className="w-6 h-6 text-gray-400" />
                     </div>
                     <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">此工具正在加速开发中</h3>
                     <p className="text-sm text-[#86868B]">我们将在下个版本上线该体验模块</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

