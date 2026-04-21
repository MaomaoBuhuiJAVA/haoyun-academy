import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      const user = await registerUser({ name, email, password, role });
      login(user);
      navigate("/");
    } catch (err: any) {
      setError("注册失败，该邮箱可能已被占用");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-pink-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            加入好孕学堂
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账号？{" "}
            <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
              立即登录
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="电子邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="密码 (不少于6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">注册身份：</span>
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="VIEWER" 
                  checked={role === "VIEWER"} 
                  onChange={(e) => setRole(e.target.value)}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span>孕妈/宝妈</span>
              </label>
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="DOCTOR" 
                  checked={role === "DOCTOR"} 
                  onChange={(e) => setRole(e.target.value)}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span>医生</span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors disabled:opacity-50"
            >
              {loading ? "正在注册..." : "立即注册"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
