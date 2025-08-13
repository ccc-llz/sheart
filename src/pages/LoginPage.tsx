// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.phone, formData.password);
      navigate('/home');
    } catch (error: any) {
      if (error.message === '用户不存在，请先注册' || error.message === '手机号未注册') {
        navigate('/register');
      } else {
        setError(error.message || '登录失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/cover" className="text-black hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-black ml-6">登录</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div>
              <input
                  type="tel"
                  placeholder="输入您的手机号码"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                  maxLength={11}
                  required
              />
            </div>

            {/* Password */}
            <div>
              <input
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                  required
              />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-8">
            <Link to="/register" className="text-black hover:opacity-70 transition-opacity">
              还没有账号？点击注册
            </Link>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
