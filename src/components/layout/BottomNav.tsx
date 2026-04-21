import { Home, Calculator, Bookmark, User, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../lib/auth";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isDoctor = user?.role === "DOCTOR" || user?.role === "ADMIN";

  const navItems = [
    { label: "首页", icon: Home, path: "/" },
    { label: "工具", icon: Calculator, path: "/tools" },
    ...(isDoctor ? [{ label: "发布", icon: PlusCircle, path: "/doctor/editor" }] : []),
    { label: "收藏", icon: Bookmark, path: "/favorites" },
    { label: "我的", icon: User, path: user ? "/profile" : "/login" }, // Simplified profile for now
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-pink-50 text-pink-600 scale-110" : "text-gray-400 group-hover:text-gray-600"
              )}>
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wider transition-colors",
                isActive ? "text-pink-600" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
