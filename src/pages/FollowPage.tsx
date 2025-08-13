import React from 'react';
import { ChevronLeft, UserCheck, UserMinus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

//模拟数据
const mockFollowing = [
  { 
    id: 1,
    avatar: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=A',
    nickname: '旅行博主', 
    bio: '分享旅行攻略',
    lastPost: '重庆15天旅游攻略',
    isFriend: false
  },
  { 
    id: 2,
    avatar: 'https://placehold.co/100x100/A3B894/FFFFFF?text=B',
    nickname: '美食家', 
    bio: '米其林餐厅探店',
    lastPost: '更新了「上海必吃榜」',
    isFriend: true
  },
  { 
    id: 3,
    avatar: 'https://placehold.co/100x100/B894A3/FFFFFF?text=C',
    nickname: '时尚达人', 
    bio: '随心穿搭分享',
    lastPost: '秋季开学穿搭',
    isFriend: false
  }
];

const FollowingPage = () => {
  const [following, setFollowing] = React.useState(mockFollowing);
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const handleGoBack = () => navigate('/profile');

  const openUnfollowConfirm = (userId: number) => {
    setSelectedUserId(userId);
    setIsConfirmOpen(true);
  };
  const confirmUnfollow = () => {
    if (selectedUserId) {
      setFollowing(following.filter(user => user.id !== selectedUserId));
      // 这里可以添加实际的API调用
      alert(`已取消关注用户ID: ${selectedUserId}`);
    }
    setIsConfirmOpen(false);
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
            <h1 className="text-xl font-bold">我的关注</h1>
            <p className="text-sm text-gray-500">{following.length}位关注</p>
          </div>
          <div className="w-6"></div> 
        </div>
      </div>

      {/* Follow List */}
      <div className="p-6">

      
      <div className="bg-white rounded-2xl overflow-hidden">
        {following.length > 0 ? (
          following.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <img
                  src={user.avatar}
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
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {user.lastPost}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
    <div className="flex justify-end space-x-2 mt-auto">
    <button 
        onClick={() => openUnfollowConfirm(user.id)} 
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center"
    >
        <UserCheck className="w-4 h-4 mr-1" />已关注
    </button>
    <Dialog 
        open={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30"
    >
    <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl p-6">
    <Dialog.Title className="text-lg font-bold">确认操作</Dialog.Title>
    <Dialog.Description className="mt-2 text-gray-600">
        确定不再关注该作者吗？
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