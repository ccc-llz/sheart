import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit, Users, Heart, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    tags: user?.tags || ['', '', '']
  });

  // 新增的头像上传相关状态
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const navigate = useNavigate();

  const handleSave = () => {
    updateUser({
      nickname: editForm.nickname,
      bio: editForm.bio,
      tags: editForm.tags.filter(tag => tag.trim() !== '')
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    setAvatarError('');
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('请选择图片文件');
      return;
    }
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      setAvatarError(`图片过大，请选择小于 ${MAX_MB}MB 的图片`);
      return;
    }

    try {
      setAvatarUploading(true);

      const fd = new FormData();
      fd.append('avatar', file);

      // 从 localStorage 拿 token（AuthContext 登录时已写入）
      const token = localStorage.getItem('token') || '';

      const resp = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        // 如果你用 cookie 会话：加上 credentials: 'include'
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `上传失败(${resp.status})`);
      }

      // 服务端返回 { avatar: url }
      if (data?.avatar) {
        updateUser({ avatar: data.avatar });
      }
    } catch (err: any) {
      console.error(err);
      setAvatarError(err.message || '上传失败，请重试');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const menuItems = [
    { icon: Users, label: '我的好友', count: user?.friends || 0, onClick: () => navigate('/friends') },
    { icon: Users, label: '关注', count: user?.following || 0, onClick: () => alert('关注页面功能（实际应用中会跳转到相应页面）') },
    { icon: Users, label: '粉丝', count: user?.followers || 0, onClick: () => alert('粉丝页面功能（实际应用中会跳转到相应页面）') },
    { icon: Heart, label: '我的点赞', onClick: () => alert('我的点赞页面功能（实际应用中会跳转到相应页面）') },
    { icon: Settings, label: '设置', onClick: () => alert('设置页面功能（实际应用中会跳转到相应页面）') }
  ];

  if (!user) return null;

  return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white px-6 py-8 border-b border-gray-100">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {/* 隐藏的文件选择器 */}
              <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
              />

              <div
                  onClick={handleAvatarUpload}
                  className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
                  title="点击上传头像"
              >
                {avatarUploading ? (
                    <div className="animate-pulse text-gray-500 text-sm">上传中…</div>
                ) : user.avatar ? (
                    <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          // 加个加载失败的回退
                          (e.currentTarget as HTMLImageElement).src =
                              'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22><rect width=%22256%22 height=%22256%22 fill=%22%23eee%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2220%22>头像加载失败</text></svg>';
                        }}
                    />
                ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* 右下角小相机按钮（只是视觉，点击同样触发） */}
              <div
                  onClick={handleAvatarUpload}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                  title="更换头像"
              >
                <Camera className="w-4 h-4 text-white" />
              </div>

              {/* 错误提示 */}
              {avatarError && (
                  <div className="mt-2 text-xs text-red-600 text-center">{avatarError}</div>
              )}
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
                      onClick={item.onClick}
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
