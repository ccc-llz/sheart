import React from 'react';
import { ChevronLeft, UserCheck, UserMinus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

type FollowingUser = {
  id: string;
  avatar: string;
  nickname: string;
  bio: string;
  lastPost?: string;
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

const FollowingPage: React.FC = () => {
  const [following, setFollowing] = React.useState<FollowingUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoBack = () => navigate('/profile');

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/api/relations/following');
        setFollowing(Array.isArray(data.following) ? data.following : []);
      } catch (e: any) {
        setErr(e?.message || '获取关注列表失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openUnfollowConfirm = (userId: string) => {
    setSelectedUserId(userId);
    setIsConfirmOpen(true);
  };

  const confirmUnfollow = async () => {
    if (!selectedUserId) return;
    // 乐观更新
    const prev = following;
    setFollowing(prev.filter(u => u.id !== selectedUserId));
    try {
      await apiFetch(`/api/relations/follow/${selectedUserId}`, { method: 'DELETE' });
    } catch {
      // 回滚
      setFollowing(prev);
      alert('取关失败');
    } finally {
      setIsConfirmOpen(false);
      setSelectedUserId(null);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button onClick={handleGoBack} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold">我的关注</h1>
              <p className="text-sm text-gray-500">{following.length} 位关注</p>
            </div>
            <div className="w-6" />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-white rounded-2xl overflow-hidden">
            {loading ? (
                <div className="p-6 text-center text-gray-500">加载中...</div>
            ) : err ? (
                <div className="p-6 text-center text-red-600">{err}</div>
            ) : following.length > 0 ? (
                following.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <img
                            src={user.avatar || 'https://placehold.co/100x100?text=User'}
                            alt={user.nickname}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-black truncate">{user.nickname}</h3>
                              <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                            </div>
                          </div>
                          {user.lastPost && (
                              <p className="text-xs text-gray-400 mt-2 truncate">{user.lastPost}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 mt-auto">
                        <button
                            onClick={() => openUnfollowConfirm(user.id)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          已关注
                        </button>

                        <Dialog
                            open={isConfirmOpen}
                            onClose={() => setIsConfirmOpen(false)}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
                        >
                          <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl p-6">
                            <Dialog.Title className="text-lg font-bold">确认操作</Dialog.Title>
                            <Dialog.Description className="mt-2 text-gray-600">
                              确定不再关注该用户吗？
                            </Dialog.Description>
                            <div className="mt-6 flex justify-end space-x-3">
                              <button
                                  onClick={() => setIsConfirmOpen(false)}
                                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                取消
                              </button>
                              <button
                                  onClick={confirmUnfollow}
                                  className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 flex items-center"
                              >
                                <UserMinus className="w-4 h-4 mr-1" />
                                不再关注
                              </button>
                            </div>
                          </Dialog.Panel>
                        </Dialog>
                      </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">你还没有关注任何人</p>
                  <button
                      onClick={() => navigate('/home')}
                      className="mt-4 px-4 py-2 bg-black text-white rounded-full text-sm"
                      style={{ backgroundColor: '#000' }}
                  >
                    去发现更多用户
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default FollowingPage;
