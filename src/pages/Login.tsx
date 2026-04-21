import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser({ email, password });
      login(user);
      navigate("/");
    } catch (err: any) {
      setError("登录失败，请检查邮箱和密码是否正确");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-pink-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录好孕学堂
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{" "}
            <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500">
              注册新账号
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="电子邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors disabled:opacity-50"
            >
              {loading ? "正在登录..." : "登录"}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 text-center mb-4">测试账号：</p>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => { setEmail("admin@haoyun.local"); setPassword("admin123"); }}
              className="text-xs bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded text-gray-600 text-left"
            >
              管理员: admin@haoyun.local / admin123
            </button>
            <button 
              onClick={() => { setEmail("doctor@haoyun.local"); setPassword("doctor123"); }}
              className="text-xs bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded text-gray-600 text-left"
            >
              医生: doctor@haoyun.local / doctor123
            </button>
            <button 
              onClick={() => { setEmail("user@haoyun.local"); setPassword("user123"); }}
              className="text-xs bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded text-gray-600 text-left"
            >
              普通用户: user@haoyun.local / user123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
