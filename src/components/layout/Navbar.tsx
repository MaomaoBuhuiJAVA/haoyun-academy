import { Search, HeartPulse, User as UserIcon, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState, FormEvent } from "react";
import { cn } from "../../lib/utils";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();

  const isDoctor = user?.role === "DOCTOR" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!isDropdownOpen) return;
      const el = dropdownRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setIsDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isDropdownOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#0066CC] p-1.5 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[#1D1D1F] text-lg hidden sm:block">
              好孕学堂
            </span>
          </Link>

          {/* Search Bar - Animated Expand */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-8 mr-4 relative flex justify-end">
             <div
                className={cn(
                  "relative flex items-center bg-[#E8E8ED] rounded-full overflow-hidden transition-all duration-300",
                  isSearchFocused ? "bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] ring-2 ring-[#0066CC] w-full" : "w-[240px]"
                )}
             >
               <button type="submit" className="pl-3 py-2 text-[#86868B] hover:text-[#0066CC] transition-colors">
                 <Search className="w-4 h-4" />
               </button>
               <input 
                 type="text" 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="搜索孕产育儿知识..."
                 className="w-full bg-transparent border-none outline-none py-2 px-2 text-sm text-[#1D1D1F] placeholder:text-[#86868B]"
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setIsSearchFocused(false)}
               />
             </div>
          </form>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#1D1D1F]">
             <Link to="/" className="text-[#0066CC] transition-colors">发现首页</Link>
             <Link to="/tools" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors">孕产工具</Link>
             <Link to="/favorites" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors">我的收藏</Link>
             
             {isDoctor && (
                <Link to="/doctor/editor" className="bg-[#0066CC] text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-sm font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  发布科普
                </Link>
             )}

             <div className="relative ml-2" ref={dropdownRef}>
               <div 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066CC] to-blue-400 flex items-center justify-center cursor-pointer shadow-sm hover:opacity-90 active:scale-95 transition-all"
               >
                  <UserIcon className="w-4 h-4 text-white" />
               </div>

               {/* Profile Dropdown */}
               {isDropdownOpen && (
                 <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 flex flex-col z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                           <p className="text-xs text-[#86868B] font-medium tracking-wide">欢迎回来</p>
                           <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5 truncate">{user.name}</p>
                           <p className="text-[10px] text-pink-600 bg-pink-50 inline-block px-1.5 py-0.5 rounded mt-1 font-bold">
                             {user.role === 'ADMIN' ? '超级管理员' : user.role === 'DOCTOR' ? '专家医生' : '准妈妈'}
                           </p>
                        </div>
                        
                        {isAdmin && (
                          <Link to="/admin/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-500" />
                            管理后台
                          </Link>
                        )}
                        
                        {isDoctor && (
                          <Link to="/doctor/editor" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
                            <Settings className="w-4 h-4 text-gray-500" />
                            我的发布
                          </Link>
                        )}

                        <button 
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                            navigate("/login");
                          }}
                          className="flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 mb-1">
                          <p className="text-sm text-gray-600">加入好孕学堂，获取更多专业知识</p>
                        </div>
                        <Link to="/login" onClick={() => setIsDropdownOpen(false)} className="mx-4 my-1 bg-pink-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors">
                          立即登录
                        </Link>
                        <Link to="/register" onClick={() => setIsDropdownOpen(false)} className="text-center py-2 text-sm text-pink-600 hover:underline">
                          注册新账号
                        </Link>
                      </>
                    )}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

