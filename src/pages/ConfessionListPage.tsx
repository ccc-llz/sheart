import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Confession {
  id: string;
  content: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  timestamp: string;
}

const ConfessionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [currentConfession, setCurrentConfession] = useState<Confession | null>(null);
  const [commentText, setCommentText] = useState('');

  const tags = ['全部', '职场', '家庭', '情感', '生活感悟', '兴趣爱好'];

  useEffect(() => {
    const savedConfessions = JSON.parse(localStorage.getItem('sheart_confessions') || '[]');
    
    // Add some sample data if empty
    if (savedConfessions.length === 0) {
      const sampleConfessions = [
        {
          id: '1',
          content: '今天在公司被领导当众批评了，真的很难受。明明我已经很努力了，但似乎还是不够好...',
          tags: ['职场'],
          timestamp: new Date().toISOString(),
          likes: 12,
          comments: [
            { id: '1', content: '抱抱，我也经历过类似的事情，你已经很棒了！', timestamp: new Date().toISOString() }
          ]
        },
        {
          id: '2',
          content: '和男朋友吵架了，他总是不理解我的感受。有时候真的觉得很累...',
          tags: ['情感'],
          timestamp: new Date().toISOString(),
          likes: 8,
          comments: []
        },
        {
          id: '3',
          content: '妈妈又催婚了，说我都这个年纪了还不找对象。压力好大...',
          tags: ['家庭'],
          timestamp: new Date().toISOString(),
          likes: 15,
          comments: []
        }
      ];
      localStorage.setItem('sheart_confessions', JSON.stringify(sampleConfessions));
      setConfessions(sampleConfessions);
    } else {
      setConfessions(savedConfessions);
    }
  }, []);

  const filteredConfessions = selectedTag === '全部' 
    ? confessions 
    : confessions.filter(confession => confession.tags.includes(selectedTag));

  const handleLike = (confessionId: string) => {
    const updatedConfessions = confessions.map(confession =>
      confession.id === confessionId
        ? { ...confession, likes: confession.likes + 1 }
        : confession
    );
    setConfessions(updatedConfessions);
    localStorage.setItem('sheart_confessions', JSON.stringify(updatedConfessions));
  };

  const handleComment = (confession: Confession) => {
    setCurrentConfession(confession);
    setShowComments(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || !currentConfession) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedConfessions = confessions.map(confession =>
      confession.id === currentConfession.id
        ? { ...confession, comments: [...confession.comments, newComment] }
        : confession
    );

    setConfessions(updatedConfessions);
    localStorage.setItem('sheart_confessions', JSON.stringify(updatedConfessions));
    setCommentText('');
    setShowComments(false);
  };

  const nextCard = () => {
    if (currentIndex < filteredConfessions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-black hover:opacity-70 transition-opacity mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-black">大家的烦恼</h1>
        </div>
        <button
          onClick={() => navigate('/confession')}
          className="flex items-center text-black hover:opacity-70 transition-opacity"
        >
          <Edit3 className="w-5 h-5 mr-1" />
          <span>我也写一条...</span>
        </button>
      </div>

      {/* Tags */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex space-x-3 overflow-x-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Card Area */}
      <div className="px-6 py-8">
        {filteredConfessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">暂无内容</p>
            <p className="text-gray-400 text-sm mt-2">来发布第一条吐槽吧</p>
          </div>
        ) : (
          <div className="relative">
            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-black text-white rounded-2xl p-6 min-h-[400px] relative"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {filteredConfessions[currentIndex].tags.map((tag) => (
                    <span key={tag} className="text-sm px-2 py-1 bg-gray-700 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="mb-8">
                  <p className="text-lg leading-relaxed">
                    {filteredConfessions[currentIndex].content}
                  </p>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      (匿名)
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(filteredConfessions[currentIndex].id)}
                        className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="w-6 h-6 group-hover:fill-current" />
                        </motion.div>
                        <span>{filteredConfessions[currentIndex].likes}</span>
                      </button>
                      
                      <button
                        onClick={() => handleComment(filteredConfessions[currentIndex])}
                        className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>{filteredConfessions[currentIndex].comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="px-6 py-2 bg-white text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                上一条
              </button>
              <span className="flex items-center px-4 py-2 bg-gray-200 rounded-full text-sm">
                {currentIndex + 1} / {filteredConfessions.length}
              </span>
              <button
                onClick={nextCard}
                disabled={currentIndex === filteredConfessions.length - 1}
                className="px-6 py-2 bg-white text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                下一条
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-gray-600 leading-relaxed">
            我们重视你的每一步成长，也心疼你的每一个迷茫
          </p>
        </div>
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {showComments && currentConfession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">评论</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  关闭
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {currentConfession.comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">还没有评论，来第一个留言吧</p>
                ) : (
                  currentConfession.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-800 mb-2">{comment.content}</p>
                      <p className="text-xs text-gray-500">匿名用户</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写下你的建议..."
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{commentText.length}/200</span>
                  <button
                    onClick={submitComment}
                    disabled={!commentText.trim()}
                    className="bg-black text-white px-6 py-2 rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
                  >
                    发布建议
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfessionListPage;