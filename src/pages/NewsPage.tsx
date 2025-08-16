import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listMyLikes, likeOnce, unlikeByTarget } from '../api/likes';


interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: NewsComment[];
  isLiked: boolean;
}

interface NewsComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const NewsPage: React.FC = () => {
  const { followUser, unfollowUser, isFollowing, isFriend } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const categories = [
    '全部', '军事', '政治', '美妆', '宠物', '哲学', '经济', '科技', 
    '娱乐', '健康', '教育', '文化', '体育', '国际', '社会'
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
    const savedNews = JSON.parse(localStorage.getItem('sheart_news') || '[]');
    
    if (savedNews.length === 0) {
      const sampleNews = [
        {
          id: '1',
          title: '职场女性如何平衡工作与生活',
          summary: '专家建议：设立明确边界，学会说不，优先照顾自己的身心健康...',
          content: `现代职场女性面临着前所未有的挑战。在追求事业成功的同时，她们还需要承担家庭责任，这种双重压力常常让人感到疲惫不堪。

根据最新研究，成功平衡工作与生活的关键在于：

1. 设立明确的边界：下班后尽量不处理工作事务
2. 学会说不：对不合理的要求要勇于拒绝
3. 优先级管理：分清轻重缓急，专注最重要的事情
4. 寻求支持：不要害怕向家人朋友求助
5. 照顾自己：定期运动，保证充足睡眠

记住，完美的平衡并不存在，重要的是找到适合自己的节奏。`,
          images: ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600'],
          category: '社会',
          timestamp: new Date().toISOString(),
          likes: 128,
          comments: [
            { id: '1', author: '职场妈妈', content: '说得太对了！边界很重要，我现在下班就不看工作消息了。', timestamp: new Date().toISOString() }
          ],
          isLiked: false
        },
        {
          id: '2',
          title: '2024年最受欢迎的护肤成分解析',
          summary: '烟酰胺、视黄醇、玻尿酸等成分持续火热，专家教你如何正确搭配使用...',
          content: `护肤品中的活性成分越来越受到关注，以下是今年最受欢迎的几种成分：

烟酰胺：
- 功效：控油、缩毛孔、美白
- 建议浓度：2-5%
- 注意：避免与酸性成分同时使用

视黄醇：
- 功效：抗老、去痘印
- 使用：从低浓度开始，晚上使用
- 注意：需要严格防晒

玻尿酸：
- 功效：保湿锁水
- 适合：所有肤质
- 搭配：最好配合其他保湿成分

使用护肤品时，建议先了解自己的肌肤状况，选择合适的产品组合。`,
          images: [
            'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600'
          ],
          category: '美妆',
          timestamp: new Date().toISOString(),
          likes: 89,
          comments: [],
          isLiked: false
        },
        {
          id: '3',
          title: '宠物陪伴对女性心理健康的积极影响',
          summary: '研究表明，养宠物能有效缓解压力，提供情感支持，特别是对独居女性而言...',
          content: `最新心理学研究显示，宠物陪伴对女性心理健康有着显著的积极影响：

情感支持：
- 宠物提供无条件的爱和陪伴
- 减少孤独感和焦虑情绪
- 增加生活的乐趣和意义

身体健康：
- 遛狗增加运动量
- 抚摸宠物降低血压
- 规律的照料作息

社交机会：
- 遛狗时结识新朋友
- 宠物话题促进交流
- 参加宠物相关活动

然而，养宠物也需要考虑：
- 时间和精力投入
- 经济成本
- 生活空间要求

选择养宠物前，建议充分考虑自己的生活状况和能力。`,
          video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          category: '宠物',
          timestamp: new Date().toISOString(),
          likes: 156,
          comments: [],
          isLiked: false
        }
      ];
      localStorage.setItem('sheart_news', JSON.stringify(sampleNews));
      setArticles(sampleNews);
    } else {
      setArticles(savedNews);
    }
  };

  const filteredArticles = selectedCategory === '全部' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // Sort by likes (popular first)
  const sortedArticles = [...filteredArticles].sort((a, b) => b.likes - a.likes);

  const handleLike = (articleId: string) => {
    const updatedArticles = articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          likes: article.isLiked ? article.likes - 1 : article.likes + 1,
          isLiked: !article.isLiked
        };
      }
      return article;
    });
    setArticles(updatedArticles);
    localStorage.setItem('sheart_news', JSON.stringify(updatedArticles));
  };

  const handleComment = (article: NewsArticle) => {
    setCurrentArticle(article);
    setShowCommentModal(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || !currentArticle) return;

    const newComment: NewsComment = {
      id: Date.now().toString(),
      author: '我',
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedArticles = articles.map(article =>
      article.id === currentArticle.id
        ? { ...article, comments: [...article.comments, newComment] }
        : article
    );

    setArticles(updatedArticles);
    localStorage.setItem('sheart_news', JSON.stringify(updatedArticles));
    setCommentText('');
    setShowCommentModal(false);
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
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would fetch new data from API
    setIsRefreshing(false);
  };

  const toggleExpandArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const articleTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - articleTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-black">热点资讯</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center text-black hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 pb-4">
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-xl text-black hover:bg-gray-200 transition-colors"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedCategory === category ? 'bg-black text-white' : 'text-black'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Articles */}
      <div className="px-6 py-6 space-y-4">
        {sortedArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">该分类暂无资讯</p>
            <p className="text-gray-400 text-sm mt-2">换个分类试试吧</p>
          </div>
        ) : (
          sortedArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-2xl p-6">
              {/* Category Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">{formatTimeAgo(article.timestamp)}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-black mb-3 leading-tight">
                {article.title}
              </h3>

              {/* Summary/Content */}
              <div className="text-gray-700 mb-4 leading-relaxed">
                {expandedArticle === article.id ? (
                  <div className="whitespace-pre-line">{article.content}</div>
                ) : (
                  <p>{article.summary}</p>
                )}
              </div>

              {/* Images */}
              {article.images && article.images.length > 0 && (
                <div className={`grid gap-2 mb-4 ${
                  article.images.length === 1 ? 'grid-cols-1' : 
                  article.images.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-3'
                }`}>
                  {article.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              
              {/* Video */}
              {article.video && (
                <div className="mb-4">
                  <video
                    src={article.video}
                    controls
                    className="w-full h-48 object-cover rounded-lg"
                    poster="https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600"
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              )}

              {/* Read More/Less */}
              <button
                onClick={() => toggleExpandArticle(article.id)}
                className="text-black font-medium hover:opacity-70 transition-opacity mb-4"
              >
                {expandedArticle === article.id ? '收起' : '阅读全文'}
              </button>

              {/* Actions */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => handleLike(article.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      article.isLiked 
                        ? 'text-red-500 bg-red-50' 
                        : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${article.isLiked ? 'fill-current' : ''}`} />
                    <span>{article.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleComment(article)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{article.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Comments Preview */}
              {article.comments.length > 0 && (
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <h4 className="text-sm font-semibold text-black mb-2">热门评论</h4>
                  <div className="space-y-2">
                    {article.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-sm text-black">{comment.author}:</span>
                          <span className="text-sm text-gray-700">{comment.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && currentArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">发表评论</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                关闭
              </button>
            </div>

            {/* Article Title */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-black">{currentArticle.title}</h4>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {currentArticle.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">还没有评论，来发表第一个观点吧</p>
              ) : (
                currentArticle.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 mb-1">{comment.content}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">{comment.author}</p>
                          {isFriend(`user_${comment.author}`) && (
                            <span className="bg-pink-100 text-pink-800 text-xs px-1 py-0.5 rounded-full">
                              朋友
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="space-y-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的看法..."
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
                  发布评论
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;