import { FadeInUp } from "../components/ui/FadeInUp";
import { Bookmark, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listFavorites, type ApiResource } from "../lib/api";
import { getStageCover, withCoverFallback } from "../lib/covers";

export function Favorites() {
  const [items, setItems] = useState<ApiResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    listFavorites()
      .then((list) => {
        if (!alive) return;
        setItems(list);
      })
      .finally(() => {
        if (!alive) return;
        setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hasAny = items.length > 0;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 h-full flex flex-col">
      <FadeInUp>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">我的收藏</h1>
        <p className="text-[#86868B] mb-10">随时随地，温故知新</p>
      </FadeInUp>

      <FadeInUp delay={0.1} className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#86868B]">正在加载收藏...</div>
        ) : hasAny ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((r) => (
              <div key={r.id} className="bento-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={withCoverFallback(r.image, r.filterTag, { id: r.id, title: r.title })}
                      alt={r.title}
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fallback = getStageCover(r.filterTag);
                        if (!img.src.endsWith(fallback)) img.src = fallback;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1D1D1F] truncate">{r.title}</div>
                    <div className="text-xs text-[#86868B]">{r.author}</div>
                  </div>
                </div>
                <div className="text-sm text-[#86868B] line-clamp-3 flex-1">{r.content}</div>
                <Link
                  to={`/?q=${encodeURIComponent(r.title)}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0066CC] hover:bg-[#0055AA] text-white rounded-full text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  去查看
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <Bookmark className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-medium text-[#1D1D1F] mb-2">暂无收藏内容</h2>
            <p className="text-sm text-[#86868B] mb-8 max-w-sm text-center">
              您还没有收藏任何科普文章或视频。在科普库中看到喜欢的内容，点击右上角的收藏图标即可保存到这里。
            </p>
            <Link to="/" className="px-6 py-3 bg-[#0066CC] hover:bg-[#0055AA] text-white rounded-full text-sm font-medium transition-colors shadow-md hover:shadow-lg">
              去发现科普
            </Link>
          </div>
        )}
      </FadeInUp>
    </div>
  );
}
