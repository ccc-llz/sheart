// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    idCard: '',
    realName: '',
    nickname: '',
    email: '',
    inviteCode: '',
    password: '',
    confirmPassword: ''
  });

  const [validations, setValidations] = useState({
    idCard: false,
    realName: false,
    nickname: false,
    email: false,
    inviteCode: false,
    password: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 从 URL 自动填充 ?invite=XXXX
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invite = params.get('invite');
    if (invite) {
      setFormData(prev => ({ ...prev, inviteCode: invite }));
      validateField('inviteCode', invite);
    }
  }, [location.search]);

  const validateField = (name: string, value: string) => {
    let isValid = false;

    switch (name) {
      case 'idCard':
        isValid = /^\d{18}$/.test(value);
        break;
      case 'realName':
        isValid = value.length >= 2 && /^[\u4e00-\u9fa5]+$/.test(value);
        break;
      case 'nickname':
        isValid = value.length >= 1 && value.length <= 20;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'inviteCode':
        isValid = /^[A-Za-z0-9]{6,12}$/.test(value.trim());
        break;
      case 'password':
        isValid = value.length >= 8 && value.length <= 12;
        break;
      case 'confirmPassword':
        isValid = value === formData.password && value.length >= 8;
        break;
    }

    setValidations(prev => ({ ...prev, [name]: isValid }));
    return isValid;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    if (name === 'password') {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  // 发送邀请码到邮箱（走你的 /api/admin/invites/generate）
  const sendVerificationCode = async () => {
    if (!validations.email) {
      alert('请输入正确的邮箱地址');
      return;
    }
    try {
      const res = await fetch('/api/admin/invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1, email: formData.email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '发送失败');

      // 可选：开发调试用，正式环境可去掉 codes 提示
      if (Array.isArray(data?.codes) && data.codes[0]) {
        console.log('本次明文邀请码：', data.codes[0]);
      }

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
      alert(`邀请码已发送至：${formData.email}`);
    } catch (e: any) {
      alert(e?.message || '发送邀请码失败，请重试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: string[] = [];
    if (!validations.idCard) newErrors.push('请输入正确的18位身份证号码');
    if (!validations.realName) newErrors.push('请输入正确的真实姓名');
    if (!validations.nickname) newErrors.push('请输入昵称（1-20字）');
    if (!validations.email) newErrors.push('请输入正确的邮箱地址');
    if (!validations.inviteCode) newErrors.push('请输入有效的邀请码（6-12位字母或数字）');
    if (!validations.password) newErrors.push('请输入8-12位密码');
    if (!validations.confirmPassword) newErrors.push('两次密码输入不一致');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        idCard: formData.idCard,
        realName: formData.realName,
        nickname: formData.nickname,
        email: formData.email,
        inviteCode: formData.inviteCode,
        password: formData.password
      } as any); // 与 AuthContext 保持一致（下方给出对应改动）
      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      if (error.message === '您不符合注册条件') {
        alert('您不符合注册条件');
      } else {
        setErrors([error.message || '注册失败，请重试']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">注册成功！</h2>
            <p className="text-gray-600">3秒后自动跳转到登录页...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/cover" className="text-black hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-black ml-6">注册</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Card */}
            <div>
              <div className="relative">
                <input
                    type="text"
                    placeholder="输入您的身份证号码"
                    value={formData.idCard}
                    onChange={(e) => handleInputChange('idCard', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                    maxLength={18}
                />
                {validations.idCard && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Real Name */}
            <div>
              <div className="relative">
                <input
                    type="text"
                    placeholder="输入您的真实姓名"
                    value={formData.realName}
                    onChange={(e) => handleInputChange('realName', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                />
                {validations.realName && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Nickname */}
            <div>
              <div className="relative">
                <input
                    type="text"
                    placeholder="输入您的昵称（1-20字）"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                    maxLength={20}
                />
                {validations.nickname && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Email + Send Invite */}
            <div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                      type="email"
                      placeholder="输入您的邮箱地址（用于接收邀请码）"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                  />
                  {validations.email && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={countdown > 0 || !validations.email}
                    className="px-6 py-4 bg-black text-white rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '发送邀请码'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">我们会将邀请码发送到该邮箱</p>
            </div>

            {/* Invite Code */}
            <div>
              <div className="relative">
                <input
                    type="text"
                    placeholder="输入您收到的邀请码"
                    value={formData.inviteCode}
                    onChange={(e) => handleInputChange('inviteCode', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                    maxLength={12}
                />
                {validations.inviteCode && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                    type="password"
                    placeholder="请输入8-12位密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                    maxLength={12}
                />
                {validations.password && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                    type="password"
                    placeholder="请与第一次输入的密码一致"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                    maxLength={12}
                />
                {validations.confirmPassword && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  {errors.map((error, index) => (
                      <div key={index} className="flex items-center text-red-600 text-sm">
                        <X className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                      </div>
                  ))}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8">
            <Link to="/login" className="text-black hover:opacity-70 transition-opacity">
              已有账号？点击登录
            </Link>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;
