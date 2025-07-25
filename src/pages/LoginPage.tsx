import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'verification' | 'password'>('verification');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    verificationCode: ''
  });
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendVerificationCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号');
      return;
    }
    
    // Check if phone is registered
    const savedUser = localStorage.getItem('sheart_user');
    const savedCredentials = localStorage.getItem('sheart_credentials');
    
    if (!savedUser || !savedCredentials) {
      navigate('/register');
      return;
    }
    
    const credentials = JSON.parse(savedCredentials);
    if (credentials.phone !== formData.phone) {
      navigate('/register');
      return;
    }
    
    // Simulate sending verification code
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginMethod === 'verification') {
        await login(formData.phone, undefined, formData.verificationCode);
      } else {
        await login(formData.phone, formData.password);
      }
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

          {loginMethod === 'verification' ? (
            /* Verification Code Method */
            <div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="验证码"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className="flex-1 px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={countdown > 0 || !/^1[3-9]\d{9}$/.test(formData.phone)}
                  className="px-6 py-4 bg-black text-white rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
          ) : (
            /* Password Method */
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
          )}

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

          {/* Switch Login Method */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setLoginMethod(loginMethod === 'verification' ? 'password' : 'verification')}
              className="text-black hover:opacity-70 transition-opacity underline"
            >
              {loginMethod === 'verification' ? '使用密码登录' : '使用验证码登录'}
            </button>
          </div>
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