import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getCaptcha } from "../lib/api";
import { useAuth } from "../lib/auth";
import { HeartPulse, Mail, Lock, ChevronRight, RefreshCw, ShieldCheck } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaData, setCaptchaId] = useState<{ id: string; code: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptchaId(data);
      setCaptchaCode(""); // Clear input on refresh
    } catch (err) {
      console.error("Failed to load captcha");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaData) return;
    
    setError("");
    setLoading(true);
    try {
      const user = await loginUser({ 
        email, 
        password, 
        captchaId: captchaData.id, 
        captchaCode 
      });
      login(user);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "登录失败，请检查输入信息");
      refreshCaptcha(); // Refresh captcha on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side: Image Stack Decor */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FFF0F5] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#0066CC] p-2 rounded-2xl shadow-lg">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">好孕学堂</h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-[#1D1D1F] leading-tight mb-6">
            陪伴每一位准妈妈<br />
            <span className="text-pink-500">科学育儿</span>
          </h2>
          <p className="text-xl text-gray-500 mb-12">
            获取专家医生认证的专业知识，开启您的科学好孕之旅。
          </p>

          <div className="relative h-[400px] w-full mt-12">
            <div className="absolute top-0 left-0 w-64 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[-10deg] border-8 border-white hover:rotate-0 transition-transform duration-500 z-10">
              <img src="/BabyPhotos/image_001.jpg" alt="Baby 1" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-10 left-32 w-64 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[5deg] border-8 border-white hover:rotate-0 transition-transform duration-500 z-20">
              <img src="/BabyPhotos/image_002.jpg" alt="Baby 2" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-24 left-16 w-64 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[-5deg] border-8 border-white hover:rotate-0 transition-transform duration-500 z-30">
              <img src="/BabyPhotos/image_003.jpg" alt="Baby 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F5F7]">
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden">
            
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">欢迎回来</h2>
              <p className="text-gray-500">请登录您的账号以继续</p>
            </div>

            <form onSubmit={handlePasswordLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                      placeholder="验证码"
                      value={captchaCode}
                      onChange={(e) => setCaptchaCode(e.target.value)}
                    />
                  </div>
                  <div 
                    onClick={refreshCaptcha}
                    className="w-32 h-14 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors group relative overflow-hidden"
                    title="点击刷新验证码"
                  >
                    {captchaData ? (
                      <span className="text-2xl font-black tracking-widest text-pink-600 italic select-none">
                        {captchaData.code}
                      </span>
                    ) : (
                      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-500">记住我</label>
                </div>
                <Link to="#" className="text-sm font-medium text-pink-600 hover:text-pink-500">忘记密码？</Link>
              </div>

              <button
                type="submit"
                disabled={loading || !captchaCode}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all shadow-lg shadow-pink-200 disabled:opacity-50"
              >
                {loading ? "正在登录..." : "登 录"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-3">
                <p className="text-xs text-gray-400 text-center mb-2 font-medium uppercase tracking-wider">快捷测试登录</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => { setEmail("admin@haoyun.local"); setPassword("admin123"); }} className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-full text-gray-600 font-medium transition-colors">管理员</button>
                  <button onClick={() => { setEmail("doctor@haoyun.local"); setPassword("doctor123"); }} className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-full text-gray-600 font-medium transition-colors">医生</button>
                  <button onClick={() => { setEmail("user@haoyun.local"); setPassword("user123"); }} className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-full text-gray-600 font-medium transition-colors">准妈妈</button>
                </div>
              </div>
            </div>

            <p className="mt-10 text-center text-gray-500">
              还没有账号？{" "}
              <Link to="/register" className="font-bold text-pink-600 hover:text-pink-500 underline decoration-2 underline-offset-4">
                立即免费注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
