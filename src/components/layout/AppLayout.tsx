import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "flex-1" : "flex-1 mt-16 pb-20"}>
        <Outlet />
      </main>
    </div>
  );
}
