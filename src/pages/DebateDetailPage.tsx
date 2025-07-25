import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare, Share, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

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
  comments: DebateComment[];
  likes: number;
}

interface DebateComment {
  id: string;
  content: string;
  side: 'pro' | 'con';
  timestamp: string;
  likes: number;
}

const DebateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'pro' | 'con'>('pro');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (id === 'featured') {
      // Featured comments page
      return;
    }
    
    const savedDebates = JSON.parse(localStorage.getItem('sheart_debates') || '[]');
    const foundDebate = savedDebates.find((d: any) => d.id === id);
    
    if (foundDebate) {
      // Add sample comments if none exist
      if (!foundDebate.comments) {
        foundDebate.comments = [
          {
            id: '1',
            content: '我觉得在职场中适度控制情绪是必要的，但不应该完全隐藏真实的自己。',
            side: 'pro',
            timestamp: new Date().toISOString(),
            likes: 5
          },
          {
            id: '2',
            content: '真实表达情感能让同事更好地理解我们，建立更深层的工作关系。',
            side: 'con',
            timestamp: new Date().toISOString(),
            likes: 8
          }
        ];
        foundDebate.likes = 23;
      }
      setDebate(foundDebate);
    }
  }, [id]);

  const handleVote = (side: 'pro' | 'con') => {
    if (!debate) return;
    
    const updatedDebate = {
      ...debate,
      proCount: side === 'pro' ? debate.proCount + 1 : debate.proCount,
      conCount: side === 'con' ? debate.conCount + 1 : debate.conCount
    };
    
    setDebate(updatedDebate);
    
    // Update localStorage
    const savedDebates = JSON.parse(localStorage.getItem('sheart_debates') || '[]');
    const updatedDebates = savedDebates.map((d: any) => 
      d.id === debate.id ? updatedDebate : d
    );
    localStorage.setItem('sheart_debates', JSON.stringify(updatedDebates));
  };

  const handleLike = () => {
    if (!debate) return;
    
    const updatedDebate = { ...debate, likes: debate.likes + 1 };
    setDebate(updatedDebate);
  };

  const submitComment = () => {
    if (!commentText.trim() || !debate) return;

    const newComment: DebateComment = {
      id: Date.now().toString(),
      content: commentText.trim(),
      side: selectedSide,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    const updatedDebate = {
      ...debate,
      comments: [...debate.comments, newComment]
    };

    setDebate(updatedDebate);
    
    // Update localStorage
    const savedDebates = JSON.parse(localStorage.getItem('sheart_debates') || '[]');
    const updatedDebates = savedDebates.map((d: any) => 
      d.id === debate.id ? updatedDebate : d
    );
    localStorage.setItem('sheart_debates', JSON.stringify(updatedDebates));
    
    setCommentText('');
    setShowCommentModal(false);
  };

  const generateShareCard = () => {
    if (!debate) return;
    
    const winningPercent = debate.proCount / (debate.proCount + debate.conCount) * 100;
    const proWinning = winningPercent > 50;
    
    alert(`辩题分享功能：\n\n${debate.title}\n\n${proWinning ? '↑' : '↓'} 正方：${debate.proSide}\n${!proWinning ? '↑' : '↓'} 反方：${debate.conSide}\n\n(实际应用中会生成图片并可保存到相册)`);
  };

  if (id === 'featured') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center">
          <button
            onClick={() => navigate('/debate')}
            className="text-black hover:opacity-70 transition-opacity mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-black">精选女王发言</h1>
        </div>

        {/* Featured Comments */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">👑</span>
              </div>
              <span className="text-yellow-800 font-semibold">本周女王发言</span>
            </div>
            <p className="text-gray-800 leading-relaxed mb-3">
              "作为女性，我们不应该被要求在职场中隐藏自己的真实情感。情感是我们的力量源泉，适当的情感表达能让我们在工作中更有创造力和感染力。关键在于学会合适的表达方式，而不是完全压抑。"
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>来自辩题：女性在职场中是否应该隐藏情绪？</span>
              <span>获得 156 个赞同</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 font-bold text-sm">🌟</span>
              </div>
              <span className="text-gray-700 font-semibold">优质观点</span>
            </div>
            <p className="text-gray-800 leading-relaxed mb-3">
              "每个女性都有自己的节奏和选择。有些人天生适合冲锋陷阵，有些人更享受细水长流。重要的是遵从内心的声音，不被外界的标准绑架。无论是事业还是家庭，都是我们人生的重要组成部分。"
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>来自辩题：现代女性应该追求事业还是家庭？</span>
              <span>获得 89 个赞同</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-gray-500">辩题不存在</p>
          <button
            onClick={() => navigate('/debate')}
            className="mt-4 text-black hover:opacity-70 transition-opacity"
          >
            返回辩论空间
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate('/debate')}
          className="text-black hover:opacity-70 transition-opacity mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-black">辩题详情</h1>
      </div>

      <div className="px-6 py-6">
        {/* Debate Title */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h1 className="text-xl font-bold text-black mb-4">#{debate.title}</h1>
          
          {/* Voting Section */}
          <div className="space-y-3 mb-6">
            <motion.button
              onClick={() => handleVote('pro')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">正方：{debate.proSide}</span>
              </div>
              <span className="text-green-600 font-bold">{debate.proCount}人</span>
            </motion.button>
            
            <motion.button
              onClick={() => handleVote('con')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">反方：{debate.conSide}</span>
              </div>
              <span className="text-red-600 font-bold">{debate.conCount}人</span>
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around border-t pt-4">
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart className="w-6 h-6" />
              <span>{debate.likes}</span>
            </motion.button>
            
            <button
              onClick={() => setShowCommentModal(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
              <span>{debate.comments.length}</span>
            </button>
            
            <button
              onClick={generateShareCard}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share className="w-6 h-6" />
              <span>分享</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">讨论区</h3>
          
          {debate.comments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有人参与讨论</p>
              <button
                onClick={() => setShowCommentModal(true)}
                className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                来发表第一个观点
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {debate.comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      comment.side === 'pro' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {comment.side === 'pro' ? '正' : '反'}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">{comment.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>匿名用户</span>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">发表观点</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                关闭
              </button>
            </div>

            {/* Side Selection */}
            <div className="flex space-x-3 mb-4">
              <button
                onClick={() => setSelectedSide('pro')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  selectedSide === 'pro' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                支持正方
              </button>
              <button
                onClick={() => setSelectedSide('con')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  selectedSide === 'con' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                支持反方
              </button>
            </div>

            {/* Comment Input */}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="分享你的观点..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none mb-4"
              maxLength={300}
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{commentText.length}/300</span>
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="bg-black text-white px-6 py-2 rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
              >
                发表观点
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateDetailPage;