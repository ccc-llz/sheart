import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Users, Crown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Debate {
  id: string;
  title: string;
  type: 'official' | 'user';
  author?: string;
  proSide: string;
  conSide: string;
  proCount: number;
  conCount: number;
  timestamp: string;
  comments: any[];
}

const DebateSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const { followUser, unfollowUser, isFollowing, isFriend } = useAuth();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'participated'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDebate, setNewDebate] = useState({ title: '', proSide: '', conSide: '' });
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedDebates = JSON.parse(localStorage.getItem('sheart_debates') || '[]');
    
    if (savedDebates.length === 0) {
      const sampleDebates = [
        {
          id: '1',
          title: '女性在职场中是否应该隐藏情绪？',
          type: 'official' as const,
          proSide: '应该控制情绪，保持专业形象',
          conSide: '真实表达有助于建立更好的工作关系',
          proCount: 234,
          conCount: 189,
          timestamp: new Date().toISOString(),
          comments: []
        },
        {
          id: '2',
          title: '现代女性应该追求事业还是家庭？',
          type: 'user' as const,
          author: '职场小白',
          proSide: '事业成功能带来更多自主权',
          conSide: '家庭幸福是人生最重要的追求',
          proCount: 156,
          conCount: 98,
          timestamp: new Date().toISOString(),
          comments: []
        }
      ];
      localStorage.setItem('sheart_debates', JSON.stringify(sampleDebates));
      setDebates(sampleDebates);
    } else {
      setDebates(savedDebates);
    }
  }, []);

  const createDebate = () => {
    if (!newDebate.title.trim() || !newDebate.proSide.trim() || !newDebate.conSide.trim()) {
      return;
    }

    const debate: Debate = {
      id: Date.now().toString(),
      title: newDebate.title,
      type: 'user',
      author: '我',
      proSide: newDebate.proSide,
      conSide: newDebate.conSide,
      proCount: 0,
      conCount: 0,
      timestamp: new Date().toISOString(),
      comments: []
    };

    const updatedDebates = [debate, ...debates];
    setDebates(updatedDebates);
    localStorage.setItem('sheart_debates', JSON.stringify(updatedDebates));
    setNewDebate({ title: '', proSide: '', conSide: '' });
    setShowCreateModal(false);
  };

  const getFilteredDebates = () => {
    switch (activeTab) {
      case 'mine':
        return debates.filter(debate => debate.author === '我');
      case 'participated':
        // In a real app, this would filter debates the user has commented on
        return debates.slice(0, 1);
      default:
        return debates;
    }
  };

  const handleFollow = (author: string) => {
    if (author === '我') return;
    
    const userId = `user_${author}`;
    if (followedUsers.has(author)) {
      unfollowUser(userId);
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(author);
        return newSet;
      });
    } else {
      followUser(userId, author);
      setFollowedUsers(prev => new Set(prev).add(author));
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Announcement */}
      <div className="bg-white border-b border-gray-100">
        {/* Announcement */}
        <div 
          onClick={() => navigate('/debate/featured')}
          className="bg-yellow-50 border-b border-yellow-100 px-6 py-3 cursor-pointer hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              上周最受认可的女王发言新鲜出炉，请点击
            </span>
            <span className="text-sm text-yellow-600 font-semibold ml-1">查看</span>
            <span className="text-sm text-yellow-800">！</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">辩论空间</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            发起辩题
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6">
          {[
            { key: 'all', label: '全部辩题' },
            { key: 'mine', label: '我发布的辩题' },
            { key: 'participated', label: '我讨论的内容' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-black border-black'
                  : 'text-gray-500 border-transparent hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Debate List */}
      <div className="px-6 py-6 space-y-4">
        {getFilteredDebates().map((debate) => (
          <div key={debate.id} className="bg-white rounded-2xl p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {debate.type === 'official' ? (
                    <Crown className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      debate.type === 'official' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      [{debate.type === 'official' ? '官方' : '用户'}]
                    </span>
                    {debate.author && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{debate.author}</span>
                        {isFriend(`user_${debate.author}`) && (
                          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                            朋友
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {debate.author !== '我' && (
                <button 
                  onClick={() => handleFollow(debate.author!)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors ${
                    followedUsers.has(debate.author!) || isFollowing(`user_${debate.author}`)
                      ? 'bg-black text-white'
                      : 'text-black border border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {followedUsers.has(debate.author!) || isFollowing(`user_${debate.author}`) ? '已关注' : '关注'}
                </button>
              )}
            </div>

            {/* Title */}
            <h3 className={`font-bold text-lg text-black mb-4 ${
              debate.type === 'official' ? 'text-xl' : ''
            }`}>
              #{debate.title}
            </h3>

            {/* Sides */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-green-800 font-medium">正方：{debate.proSide}</span>
                <span className="text-green-600 font-bold">{debate.proCount}人</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-red-800 font-medium">反方：{debate.conSide}</span>
                <span className="text-red-600 font-bold">{debate.conCount}人</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                本周辩论赛开始了哦，已经有{debate.proCount + debate.conCount}位女性参与讨论~
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate(`/debate/${debate.id}`)}
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              立即参与
            </button>
          </div>
        ))}

        {getFilteredDebates().length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">暂无辩题</p>
            <p className="text-gray-400 text-sm mt-2">来发起第一个辩题吧</p>
          </div>
        )}
      </div>

      {/* Create Debate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">发起新辩题</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">辩题标题</label>
                <input
                  type="text"
                  value={newDebate.title}
                  onChange={(e) => setNewDebate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入辩题标题..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">正方观点</label>
                <textarea
                  value={newDebate.proSide}
                  onChange={(e) => setNewDebate(prev => ({ ...prev, proSide: e.target.value }))}
                  placeholder="输入正方观点..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">反方观点</label>
                <textarea
                  value={newDebate.conSide}
                  onChange={(e) => setNewDebate(prev => ({ ...prev, conSide: e.target.value }))}
                  placeholder="输入反方观点..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={createDebate}
                  className="flex-1 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  发起辩题
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateSpacePage;