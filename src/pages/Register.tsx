import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api";
import { useAuth } from "../lib/auth";
import { HeartPulse, User as UserIcon, Mail, Lock, ChevronRight, Smartphone } from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await registerUser({ name, email, password, phone, role });
      login(user);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "注册失败，请检查输入信息");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side: Image Stack Decor */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F0F7FF] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="bg-[#0066CC] p-2 rounded-2xl shadow-lg">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">好孕学堂</h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-[#1D1D1F] leading-tight mb-6">
            加入我们<br />
            <span className="text-[#0066CC]">开启健康新生活</span>
          </h2>
          <p className="text-xl text-gray-500 mb-12">
            成为好孕社区的一员，获取量身定制的孕产指导与专家建议。
          </p>

          <div className="relative h-[400px] w-full mt-12 hidden md:block">
            <div className="absolute top-0 right-10 w-64 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[10deg] border-8 border-white hover:rotate-0 transition-transform duration-500 z-10">
              <img src="/BabyPhotos/image_010.jpg" alt="Baby 1" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-10 right-32 w-64 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[-5deg] border-8 border-white hover:rotate-0 transition-transform duration-500 z-20">
              <img src="/BabyPhotos/image_011.jpg" alt="Baby 2" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Register Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F5F7]">
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">立即加入</h2>
              <p className="text-gray-500">创建一个属于您的健康档案</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    placeholder="您的昵称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    placeholder="电子邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    placeholder="手机号码 (可选)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    placeholder="密码 (不少于6位)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-center space-x-6 bg-gray-50 p-4 rounded-2xl">
                  <span className="text-sm text-gray-500 font-medium">身份：</span>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                    <input 
                      type="radio" 
                      name="role" 
                      value="VIEWER" 
                      checked={role === "VIEWER"} 
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <span className={role === "VIEWER" ? "text-pink-600 font-bold" : "text-gray-600"}>孕妈/宝妈</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                    <input 
                      type="radio" 
                      name="role" 
                      value="DOCTOR" 
                      checked={role === "DOCTOR"} 
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <span className={role === "DOCTOR" ? "text-pink-600 font-bold" : "text-gray-600"}>专家医生</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all shadow-lg shadow-pink-200 disabled:opacity-50"
              >
                {loading ? "正在注册..." : "立即注册"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500">
              已有账号？{" "}
              <Link to="/login" className="font-bold text-pink-600 hover:text-pink-500 underline decoration-2 underline-offset-4">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
