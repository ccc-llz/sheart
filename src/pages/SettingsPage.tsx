import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Bell, Lock, HelpCircle, Info, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  if (!user) return null;

  const settingsItems = [
    { icon: Bell, label: '通知设置', description: '管理你的通知偏好' },
    { icon: Lock, label: '隐私设置', description: '控制谁可以看到你的内容' },
    { icon: HelpCircle, label: '帮助中心', description: '获取帮助和支持' },
    { icon: Info, label: '关于我们', description: '了解应用信息' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-black">设置</h1>
        </div>
      </div>

      {/* 账户信息 */}
      <div className="bg-white p-4 mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">账户</h2>
        <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <img 
            src={user.avatar || 'https://picsum.photos/id/64/200'} 
            alt={user.nickname} 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <p className="font-medium text-black">{user.nickname}</p>
            <p className="text-sm text-gray-500">点击编辑个人资料</p>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-black transition-colors"
          >
            编辑
          </button>
        </div>
      </div>

      {/* 通用设置 */}
      <div className="bg-white p-4 mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">通用</h2>
        
        {/* 深色模式 */}
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-full">
              {darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium text-black">深色模式</p>
              <p className="text-sm text-gray-500">切换深色/浅色主题</p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-5 rounded-full ${darkMode ? 'bg-black' : 'bg-gray-300'} flex items-center transition-colors`}
          >
            <div className={`w-4 h-4 rounded-full bg-white ${darkMode ? 'ml-5' : 'ml-0'} transition-transform`}></div>
          </button>
        </div>
        
        {/* 通知设置 */}
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-black">通知</p>
              <p className="text-sm text-gray-500">接收新消息和活动通知</p>
            </div>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-10 h-5 rounded-full ${notifications ? 'bg-black' : 'bg-gray-300'} flex items-center transition-colors`}
          >
            <div className={`w-4 h-4 rounded-full bg-white ${notifications ? 'ml-5' : 'ml-0'} transition-transform`}></div>
          </button>
        </div>
      </div>

      {/* 其他设置 */}
      <div className="bg-white p-4 mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">其他</h2>
        {settingsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-black">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 退出登录 */}
      <div className="p-4 mt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;