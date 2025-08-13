import React from 'react';
import { ChevronLeft, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 模拟数据
const mockFans = [
    { 
        id: 1, avatar: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=A', 
        nickname: 'Andrew', 
        bio: '你的忠实粉丝，喜欢你的所有分享',
        isFollowing: false
    },
    { 
        id: 2, 
        avatar: 'https://placehold.co/100x100/A3B894/FFFFFF?text=B', 
        nickname: 'Levi', 
        bio: '特别喜欢你的摄影作品',
        isFollowing: true
    },
    { 
        id: 3, 
        avatar: 'https://placehold.co/100x100/B894A3/FFFFFF?text=C', 
        nickname: 'Erwin', 
        bio: '跟着你的攻略去了好多地方',
        isFollowing: false
    },
];

const FansPage = () => {
    const [following, setFollowing] = React.useState(mockFans);
    const [fans, setFans] = React.useState(mockFans);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/profile');
    };

    const handleFollow = (fanId: number) => {
        setFans(fans.map(fan => 
            fan.id === fanId ? { ...fan, isFollowing: true } : fan
        ));
        alert('关注成功');
    };

    const handleUnfollow = (fanId: number) => {
        setFans(fans.map(fan => 
            fan.id === fanId ? { ...fan, isFollowing: false } : fan
        ));
        alert('已取消关注');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={handleGoBack}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="text-center">
                        <h1 className="text-xl font-bold">我的粉丝</h1>
                        <p className="text-sm text-gray-500">{following.length}位粉丝</p>
                      </div>
                      <div className="w-6"></div> 
                    </div>
                  </div>
        
            {/* Fans List */}
            <div className="p-6">
                <div className="bg-white rounded-2xl overflow-hidden">
                    {fans.length > 0 ? (
                        fans.map((fan) => (
                            <div key={fan.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center space-x-4">
                                    {/* Avatar */}
                                    <img
                                        src={fan.avatar}
                                        alt={`${fan.nickname}'s avatar`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-black">{fan.nickname}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{fan.bio}</p>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center space-x-2">
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
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            还没有粉丝哦，快去互动吧！
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FansPage;