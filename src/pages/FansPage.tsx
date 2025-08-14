import React from 'react';
import { ChevronLeft, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Fan = {
    id: string;
    avatar: string;
    nickname: string;
    bio: string;
    // 后端 /api/relations/fans 返回的是否“已回关”标记
    isFollowing?: boolean;
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

const FansPage: React.FC = () => {
    const [fans, setFans] = React.useState<Fan[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState('');
    const navigate = useNavigate();

    const handleGoBack = () => navigate('/profile');

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await apiFetch('/api/relations/fans');
                setFans(Array.isArray(data.fans) ? data.fans : []);
            } catch (e: any) {
                setErr(e?.message || '获取粉丝失败');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleFollow = async (fanId: string) => {
        // 乐观更新
        setFans(prev => prev.map(f => f.id === fanId ? { ...f, isFollowing: true } : f));
        try {
            await apiFetch(`/api/relations/follow/${fanId}`, { method: 'POST' });
        } catch {
            // 回滚
            setFans(prev => prev.map(f => f.id === fanId ? { ...f, isFollowing: false } : f));
            alert('关注失败');
        }
    };

    const handleUnfollow = async (fanId: string) => {
        setFans(prev => prev.map(f => f.id === fanId ? { ...f, isFollowing: false } : f));
        try {
            await apiFetch(`/api/relations/follow/${fanId}`, { method: 'DELETE' });
        } catch {
            setFans(prev => prev.map(f => f.id === fanId ? { ...f, isFollowing: true } : f));
            alert('取消关注失败');
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
                        <h1 className="text-xl font-bold">我的粉丝</h1>
                        <p className="text-sm text-gray-500">{fans.length} 位粉丝</p>
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
                    ) : fans.length > 0 ? (
                        fans.map(fan => (
                            <div key={fan.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={fan.avatar || 'https://placehold.co/100x100?text=User'}
                                        alt={`${fan.nickname}'s avatar`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-black">{fan.nickname}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{fan.bio}</p>
                                    </div>
                                </div>

                                {fan.isFollowing ? (
                                    <button
                                        onClick={() => handleUnfollow(fan.id)}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center"
                                    >
                                        <UserCheck className="w-4 h-4 mr-1" />
                                        已关注
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFollow(fan.id)}
                                        className="px-3 py-1.5 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors flex items-center"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        回关
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">还没有粉丝哦，快去互动吧！</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FansPage;
