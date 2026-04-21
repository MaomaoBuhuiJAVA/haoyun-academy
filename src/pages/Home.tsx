import { useMemo, useState, useEffect, type MouseEvent } from "react";
import { FadeInUp } from "../components/ui/FadeInUp";
import { Clock, Share, X, QrCode, Bookmark, Heart, ChevronLeft, Download, Search, Sparkles, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useSearchParams } from "react-router-dom";
import { listResources, getFavoriteIds, addFavorite, removeFavorite, type ApiResource } from "../lib/api";
import { getStageCover, withCoverFallback } from "../lib/covers";
import { mockResources } from "../data/mockResources";

const timelineFilters = ["全部", "孕早期", "孕中期", "孕晚期", "新生儿", "婴幼儿"];

function getMockFallback(query: string, activeFilter: string): ApiResource[] {
  const q = query.trim().toLowerCase();
  return mockResources
    .filter((r) => {
      const matchesFilter = activeFilter === "全部" || r.filterTag === activeFilter || r.tags.includes(activeFilter);
      const matchesQuery =
        q === "" ||
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.author.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    })
    .map((r) => ({ ...r, id: String(r.id) }));
}

export function Home() {
  const [activeFilter, setActiveFilter] = useState("全部");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ApiResource | null>(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [resources, setResources] = useState<ApiResource[]>(
    () => mockResources.map((r) => ({ ...r, id: String(r.id) })),
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [toast, setToast] = useState<null | { text: string }>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    Promise.allSettled([
      listResources({ q: query, filter: activeFilter }),
      getFavoriteIds(),
    ])
      .then(([resourcesResult, favoritesResult]) => {
        if (!alive) return;

        if (resourcesResult.status === "fulfilled") {
          if (resourcesResult.value.length > 0) {
            setResources(resourcesResult.value);
            setLoadError(null);
          } else {
            // If DB temporarily returns empty, keep page usable.
            setResources(getMockFallback(query, activeFilter));
            setLoadError("数据库暂无可用帖子，已切换到本地示例数据。");
          }
        } else {
          setLoadError("加载超时，已自动切换到本地示例数据。");
          setResources(getMockFallback(query, activeFilter));
          // eslint-disable-next-line no-console
          console.error(resourcesResult.reason);
        }

        if (favoritesResult.status === "fulfilled") {
          setFavoriteIds(favoritesResult.value);
        } else {
          // Favorites failure should not block resource display.
          setFavoriteIds(new Set());
          // eslint-disable-next-line no-console
          console.warn("favorites load failed", favoritesResult.reason);
        }
      })
      .finally(() => {
        if (!alive) return;
        setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query, activeFilter, retryTick]);

  const filteredResources = resources;
  const userLabel = useMemo(() => {
    const role = localStorage.getItem("role") || "patient";
    const hour = new Date().getHours();
    const greet = hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
    return {
      greet,
      title: role === "doctor" ? "李医生" : "微信用户",
      subtitle: role === "doctor" ? "今日也辛苦了，继续为宝妈带来专业科普" : "愿你被科学与温柔守护",
    };
  }, []);

  // Body scrolling lock when modal is open
  useEffect(() => {
    if (selectedArticle || isShareOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedArticle, isShareOpen]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShareClick = (e: MouseEvent, article: ApiResource) => {
    e.stopPropagation(); 
    setIsShareOpen(true);
  };

  const toggleFavorite = (resourceId: string) => {
    // Optimistic update: avoid any perceived "refresh" or jank.
    const before = favoriteIds;
    const next = new Set(before);
    const isFav = next.has(resourceId);
    isFav ? next.delete(resourceId) : next.add(resourceId);
    setFavoriteIds(next);

    const op = isFav ? removeFavorite(resourceId) : addFavorite(resourceId);
    op.catch(() => {
      // Rollback on network failure.
      setFavoriteIds(before);
    });

    setToast({ text: isFav ? "已取消收藏" : "已加入收藏" });
    window.setTimeout(() => setToast(null), 1200);
  };

  return (
    <div className="w-full h-full relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-full bg-black/70 text-white text-sm backdrop-blur-md shadow-lg"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-[120] w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-[#0066CC] hover:bg-white transition-colors flex items-center justify-center"
            title="回到顶部"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="pt-20 md:pt-24 pb-8 md:pb-10 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        <FadeInUp>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1D1D1F] mb-4 md:mb-6 leading-tight">
            专业妇幼科普，<br />伴您安心孕育
          </h1>
          <p className="text-[#86868B] text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 px-4">
            整合权威医疗资源，为每一个家庭提供科学、温暖、全周期的健康成长守护。
          </p>
        </FadeInUp>

        {/* Personalized strip */}
        <FadeInUp delay={0.05} className="w-full max-w-5xl px-2 md:px-4 mt-2 mb-6">
          <div className="bento-card relative overflow-hidden px-5 py-5 md:px-8 md:py-6 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-blue-50/30" />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-pink-100/50 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">✨</div>
                <div>
                  <div className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5">
                    {userLabel.greet}
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-[#1D1D1F] mt-0.5">
                    {userLabel.title}，{userLabel.subtitle.split('，')[0]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white/80 border border-white shadow-sm">
                  <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">已收藏</div>
                  <div className="text-base md:text-lg font-bold text-[#1D1D1F] tabular-nums">{favoriteIds.size} 篇</div>
                </div>
                <div className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#0066CC] border border-blue-400 shadow-lg shadow-blue-100">
                  <div className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">今日精选</div>
                  <div className="text-base md:text-lg font-bold text-white"> {Math.min(6, filteredResources.length)} 篇</div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Timeline Filter */}
        <FadeInUp delay={0.1} className="w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-4">
            {timelineFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? "pill-active" : "pill-inactive"}
              >
                <span className="relative z-10">{filter}</span>
              </button>
            ))}
          </div>
        </FadeInUp>
      </section>

      {/* Query Status */}
      {query && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-[#1D1D1F] font-medium">搜索结果: <span className="text-[#0066CC]">"{query}"</span></p>
        </div>
      )}

      {/* Bento Grid Content */}
      <section className="px-4 max-w-7xl mx-auto pb-24">
        <FadeInUp delay={0.2}>
          {isLoading ? (
            filteredResources.length > 0 ? (
              <div>
                <div className="text-center mb-6 text-sm text-[#86868B]">正在同步数据库帖子...</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => setSelectedArticle(resource)}
                      className={cn(
                        "group relative overflow-hidden bento-card cursor-pointer flex flex-col",
                        resource.colSpan,
                      )}
                    >
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <img
                          src={withCoverFallback(resource.image, resource.filterTag, { id: resource.id, title: resource.title })}
                          alt={resource.title}
                          onError={(e) => {
                            const img = e.currentTarget;
                            const fallback = getStageCover(resource.filterTag);
                            if (!img.src.endsWith(fallback)) img.src = fallback;
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                        <div className="flex gap-2 mb-3">
                          {resource.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-4 line-clamp-2">{resource.title}</h3>
                        <div className="flex items-center justify-between text-white/90 text-sm">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-white/80" />
                            <span>{resource.readTime} 随心读</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-[#86868B]">正在加载科普资源...</div>
            )
          ) : loadError ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="text-lg font-medium text-[#1D1D1F] mb-1">资源加载失败</h3>
              <p className="text-[#86868B] text-sm mb-5">{loadError}</p>
              <button
                type="button"
                onClick={() => setRetryTick((v) => v + 1)}
                className="px-5 py-2.5 rounded-full bg-[#0066CC] text-white text-sm font-medium hover:bg-[#0055AA] transition-colors"
              >
                重新加载
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
              {filteredResources.map((resource) => (
                <div 
                  key={resource.id}
                  onClick={() => setSelectedArticle(resource)}
                  className={cn(
                    "group relative overflow-hidden bento-card cursor-pointer flex flex-col",
                    resource.colSpan
                  )}
                >
                  {/* Image Container */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img 
                      src={withCoverFallback(resource.image, resource.filterTag, { id: resource.id, title: resource.title })}
                      alt={resource.title} 
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fallback = getStageCover(resource.filterTag);
                        if (!img.src.endsWith(fallback)) img.src = fallback;
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <div className="flex gap-2 mb-3">
                      {resource.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-4 line-clamp-2">
                      {resource.title}
                    </h3>
                    <div className="flex items-center justify-between text-white/90 text-sm">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-white/80" />
                        <span>{resource.readTime} 随心读</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(resource.id); }}
                          className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
                          title={favoriteIds.has(resource.id) ? "取消收藏" : "收藏"}
                        >
                          <Bookmark className={cn("w-4 h-4", favoriteIds.has(resource.id) ? "text-[#0066CC]" : "text-white")} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleShareClick(e, resource)}
                          className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
                          title="分享"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-6 h-6 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-[#1D1D1F] mb-1">未找到相关科普资源</h3>
               <p className="text-[#86868B] text-sm">换个关键词试试看吧</p>
            </div>
          )}
        </FadeInUp>
      </section>

      {/* Article Detail Slide-Over Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-x-0 bottom-0 top-0 md:top-8 z-[70] bg-[#F5F5F7] rounded-t-[32px] md:rounded-[32px] w-full md:max-w-3xl md:mx-auto md:my-8 overflow-hidden flex flex-col shadow-2xl origin-bottom"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 glass px-4 py-4 md:py-3 flex items-center justify-between border-b border-gray-200/50">
                <button 
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-1 text-[#0066CC] font-bold hover:opacity-80 transition-opacity bg-blue-50/50 px-3 py-1.5 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5 -ml-1" />
                  <span className="text-sm">返回</span>
                </button>
                <div className="flex items-center gap-2 md:gap-4">
                  <button type="button" onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([`${selectedArticle.title}\n\n${selectedArticle.content}`], {type: 'text/plain;charset=utf-8'});
                    element.href = URL.createObjectURL(file);
                    element.download = `${selectedArticle.title}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }} title="下载图文到本地(TXT)" className="p-2 text-[#1D1D1F] hover:text-[#0066CC] transition-colors bg-white rounded-full shadow-sm">
                    <Download className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => alert("点赞成功")} className="p-2 text-[#1D1D1F] hover:text-red-500 transition-colors bg-white rounded-full shadow-sm">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedArticle.id)}
                    className="p-2 text-[#1D1D1F] hover:text-[#0066CC] transition-colors bg-white rounded-full shadow-sm"
                    title={favoriteIds.has(selectedArticle.id) ? "取消收藏" : "收藏"}
                  >
                    <Bookmark className={cn("w-5 h-5", favoriteIds.has(selectedArticle.id) ? "text-[#0066CC]" : "")} />
                  </button>
                  <button type="button" onClick={(e) => handleShareClick(e, selectedArticle)} className="p-2 text-[#1D1D1F] hover:text-[#0066CC] transition-colors bg-white rounded-full shadow-sm">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                 <div className="w-full h-[250px] md:h-[400px] relative">
                   <img
                     src={withCoverFallback(selectedArticle.image, selectedArticle.filterTag, { id: selectedArticle.id, title: selectedArticle.title })}
                     alt={selectedArticle.title}
                     onError={(e) => {
                       const img = e.currentTarget;
                       const fallback = getStageCover(selectedArticle.filterTag);
                       if (!img.src.endsWith(fallback)) img.src = fallback;
                     }}
                     className="w-full h-full object-cover"
                   />
                 </div>
                 <div className="px-6 md:px-12 pt-8 pb-32">
                   <div className="flex gap-2 mb-4 text-[#86868B] text-sm font-medium">
                     <span className="text-[#0066CC]">{selectedArticle.filterTag}</span>
                     <span>•</span>
                     <span>{selectedArticle.readTime}</span>
                   </div>
                   <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1D1F] mb-6 leading-snug">
                     {selectedArticle.title}
                   </h1>
                   <div className="flex items-center gap-3 mb-10 pb-8 border-b border-[#E8E8ED]">
                     <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedArticle.author}`} alt="avatar" />
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-[#1D1D1F]">{selectedArticle.author}</div>
                       <div className="text-xs text-[#86868B]">官方科普认证机构</div>
                     </div>
                   </div>

                   <article className="prose prose-pink lg:prose-xl max-w-none text-[#1D1D1F] leading-relaxed selection:bg-pink-100">
                     {selectedArticle.content.split('\n').filter(Boolean).map((line, i) => {
                       if (line.startsWith('# ')) {
                         return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-gray-900">{line.replace('# ', '')}</h1>;
                       }
                       if (line.startsWith('## ')) {
                         return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 pb-2 border-b-2 border-pink-100 text-gray-800">{line.replace('## ', '')}</h2>;
                       }
                       if (line.startsWith('### ')) {
                         return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-800 flex items-center gap-2">
                           <span className="w-1.5 h-6 bg-pink-400 rounded-full inline-block" />
                           {line.replace('### ', '')}
                         </h3>;
                       }
                       if (line.startsWith('- ')) {
                         return <li key={i} className="ml-4 mb-2 text-gray-700 list-disc marker:text-pink-500">{line.replace('- ', '')}</li>;
                       }
                       if (line.startsWith('> ')) {
                         return <blockquote key={i} className="border-l-4 border-pink-300 pl-6 py-2 my-8 bg-pink-50/50 rounded-r-2xl italic text-gray-600">
                           {line.replace('> ', '').replace(/\"/g, '')}
                         </blockquote>;
                       }
                       if (line.startsWith('---')) {
                         return <hr key={i} className="my-12 border-gray-100" />;
                       }
                       if (line.startsWith('*') && line.endsWith('*')) {
                         return <p key={i} className="text-sm text-gray-400 text-center mt-12 italic">{line.replace(/\*/g, '')}</p>;
                       }
                       
                       // Handle bold text like **text**
                       const parts = line.split(/(\*\*.*?\*\*)/g);
                       return (
                         <p key={i} className="mb-6 leading-loose text-gray-700">
                           {parts.map((part, pi) => {
                             if (part.startsWith('**') && part.endsWith('**')) {
                               return <strong key={pi} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                             }
                             return part;
                           })}
                         </p>
                       );
                     })}
                   </article>

                   {/* Article Footer */}
                   <div className="mt-20 p-8 bg-[#F5F5F7] rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">💡</div>
                        <div>
                          <h4 className="font-bold text-gray-900">觉得这篇科普有用吗？</h4>
                          <p className="text-sm text-gray-500">收藏或分享给更多需要的宝妈吧</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => toggleFavorite(selectedArticle.id)}
                          className={cn(
                            "px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2",
                            favoriteIds.has(selectedArticle.id) 
                              ? "bg-pink-100 text-pink-600" 
                              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                          )}
                        >
                          <Bookmark className="w-5 h-5" />
                          {favoriteIds.has(selectedArticle.id) ? "已收藏" : "收藏"}
                        </button>
                        <button 
                          onClick={(e) => handleShareClick(e, selectedArticle)}
                          className="px-6 py-3 rounded-2xl bg-[#0066CC] text-white font-bold hover:bg-[#0055AA] transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                        >
                          <Share className="w-5 h-5" />
                          分享
                        </button>
                      </div>
                   </div>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sheet QR Share */}
      <AnimatePresence>
        {isShareOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[90] glass rounded-t-[32px] p-8 pb-12 max-w-lg mx-auto flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
              <button 
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="absolute top-6 right-6 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#1D1D1F]" />
              </button>
              
              <div className="w-16 h-1.5 bg-gray-300/80 rounded-full mb-6"></div>
              
              <h2 className="text-xl font-semibold text-[#1D1D1F] mb-6">分享科普给宝妈</h2>
              
              <div className="p-8 bg-white rounded-3xl shadow-sm border border-[#E8E8ED] flex flex-col items-center gap-4 mb-2 min-w-[240px]">
                <QrCode className="w-36 h-36 text-[#0066CC]" />
                <p className="text-sm font-semibold text-[#86868B] tracking-wide">微信扫一扫，阅读全文</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
