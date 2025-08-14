import React, { useEffect, useState } from 'react';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Friend = {
    id: string;
    nickname: string;
    avatar: string;
    bio: string;
};

const FriendsPage: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string>('');
    const navigate = useNavigate();

    const handleGoBack = () => navigate('/profile');
    const handleAddFriend = (friendNickname: string) => {
        alert(`添加 ${friendNickname} 为好友`);
    };

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        (async () => {
            try {
                const res = await fetch('/api/relations/friends', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || '获取好友失败');
                setFriends(Array.isArray(data.friends) ? data.friends : []);
            } catch (e: any) {
                setError(e?.message || '获取好友失败');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center">
                <button
                    onClick={handleGoBack}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-black">我的好友</h1>
                <div className="w-8"></div>
            </div>

            {/* List */}
            <div className="p-6">
                <div className="bg-white rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">加载中...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : friends.length > 0 ? (
                        friends.map(friend => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={friend.avatar || 'https://placehold.co/100x100?text=User'}
                                        alt={`${friend.nickname}'s avatar`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-black">{friend.nickname}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{friend.bio}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddFriend(friend.nickname)}
                                    className="p-2 text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">还没有好友哦，快去添加吧！</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;
