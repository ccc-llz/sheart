import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit, Users, Heart, Settings, ChevronRight } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    tags: user?.tags || ['', '', '']
  });

  const handleSave = () => {
    updateUser({
      nickname: editForm.nickname,
      bio: editForm.bio,
      tags: editForm.tags.filter(tag => tag.trim() !== '')
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open file picker
    alert('头像上传功能（实际应用中会打开文件选择器）');
  };

  const menuItems = [
    { icon: Users, label: '我的好友', count: user?.friends || 0 },
    { icon: Users, label: '关注', count: user?.following || 0 },
    { icon: Users, label: '粉丝', count: user?.followers || 0 },
    { icon: Heart, label: '我的点赞' },
    { icon: Settings, label: '设置' }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-100">
        <div className="text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div 
              onClick={handleAvatarUpload}
              className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Name & Bio */}
          {isEditing ? (
            <div className="space-y-4 max-w-sm mx-auto">
              <input
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                className="w-full px-4 py-2 text-center border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                placeholder="昵称"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                rows={3}
                placeholder="介绍一下你自己吧"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-black">自我标签</p>
                {editForm.tags.map((tag, index) => (
                  <input
                    key={index}
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...editForm.tags];
                      newTags[index] = e.target.value;
                      setEditForm(prev => ({ ...prev, tags: newTags }));
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder={`标签 ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-2">
                <h2 className="text-xl font-bold text-black mr-2">{user.nickname}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-500 hover:text-black transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                {user.bio || '介绍一下你自己吧'}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {user.tags && user.tags.length > 0 ? (
                  user.tags.map((tag, index) => (
                    <span key={index} className="bg-black text-white text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-200 text-gray-500 text-sm px-3 py-1 rounded-full">自我标签</span>
                    <span className="bg-gray-200 text-gray-500 text-sm px-3 py-1 rounded-full">自我标签</span>
                    <span className="bg-gray-200 text-gray-500 text-sm px-3 py-1 rounded-full">自我标签</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{user.friends}</div>
                  <div className="text-sm text-gray-500">朋友</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{user.following}</div>
                  <div className="text-sm text-gray-500">关注</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{user.followers}</div>
                  <div className="text-sm text-gray-500">粉丝</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => alert(`${item.label}功能（实际应用中会跳转到相应页面）`)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-black font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.count !== undefined && (
                    <span className="text-gray-500">{item.count}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-6">
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;