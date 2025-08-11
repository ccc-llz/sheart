import React from 'react';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate

// 假设的好友数据，实际应用中会从后端 API 获取
const mockFriends = [
    { id: 1, avatar: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=A', nickname: 'Alice', bio: '热爱编程和猫咪的开发者。' },
    { id: 2, avatar: 'https://placehold.co/100x100/A3B894/FFFFFF?text=B', nickname: 'Bob', bio: '喜欢旅行和摄影。' },
    { id: 3, avatar: 'https://placehold.co/100x100/B894A3/FFFFFF?text=C', nickname: 'Charlie', bio: '一个爱看书的设计师。' },
    { id: 4, avatar: 'https://placehold.co/100x100/A3B894/FFFFFF?text=D', nickname: 'David', bio: '喜欢篮球和音乐。' },
];

const FriendsPage = () => {
    // 在实际应用中，您可能会从全局状态或 API 获取好友列表
    const friends = mockFriends;
    const navigate = useNavigate(); // 使用 useNavigate 钩子

    // 模拟返回功能，实际应用中会使用 react-router-dom 的 useNavigate
    const handleGoBack = () => {
        // navigate(-1); // 这会返回到历史记录中的上一页，不一定是 profile
        navigate('/profile'); // 明确地导航到 /profile 页面
    };

    const handleAddFriend = (friendNickname: string) => {
        alert(`添加 ${friendNickname} 为好友`);
    };

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
                {/* Placeholder to center the title */}
                <div className="w-8"></div>
            </div>

            {/* Friends List */}
            <div className="p-6">
                <div className="bg-white rounded-2xl overflow-hidden">
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center space-x-4">
                                    {/* Avatar */}
                                    <img
                                        src={friend.avatar}
                                        alt={`${friend.nickname}'s avatar`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-black">{friend.nickname}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{friend.bio}</p>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleAddFriend(friend.nickname)}
                                        className="p-2 text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            还没有好友哦，快去添加吧！
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;