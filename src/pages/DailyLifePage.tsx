import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Camera, Video, Plus, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DailyPost {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: PostComment[];
  isLiked: boolean;
}

interface PostComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const DailyLifePage: React.FC = () => {
  const { followUser, unfollowUser, isFollowing, isFriend } = useAuth();
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', images: [] as string[] });
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostForComment, setCurrentPostForComment] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('sheart_daily_posts') || '[]');
    
    if (savedPosts.length === 0) {
      const samplePosts = [
        {
          id: '1',
          author: '小雨',
          content: '今天尝试了新的化妆技巧，感觉整个人都精神了很多！分享给大家～',
          images: ['https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400'],
          timestamp: new Date().toISOString(),
          likes: 23,
          comments: [
            { id: '1', author: '小美', content: '好看！请问用的什么口红？', timestamp: new Date().toISOString() }
          ],
          isLiked: false
        },
        {
          id: '2',
          author: '阳光女孩',
          content: '周末和闺蜜们一起做的手工，虽然不是很完美，但过程很开心！',
          images: ['https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=400'],
          timestamp: new Date().toISOString(),
          likes: 18,
          comments: [],
          isLiked: false
        }
      ];
      localStorage.setItem('sheart_daily_posts', JSON.stringify(samplePosts));
      setPosts(samplePosts);
    } else {
      setPosts(savedPosts);
    }
  }, []);

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('sheart_daily_posts', JSON.stringify(updatedPosts));
  };

  const createPost = () => {
    if (!newPost.content.trim()) return;

    const post: DailyPost = {
      id: Date.now().toString(),
      author: '我',
      content: newPost.content,
      images: newPost.images,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('sheart_daily_posts', JSON.stringify(updatedPosts));
    setNewPost({ content: '', images: [] });
    setShowCreateModal(false);
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

  const handleComment = (postId: string) => {
    setCurrentPostForComment(postId);
    setShowCommentModal(true);
  };

  const submitComment = () => {
    if (!newComment.trim() || !currentPostForComment) return;

    const comment: PostComment = {
      id: Date.now().toString(),
      author: '我',
      content: newComment,
      timestamp: new Date().toISOString()
    };

    const updatedPosts = posts.map(post => {
      if (post.id === currentPostForComment) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('sheart_daily_posts', JSON.stringify(updatedPosts));
    setNewComment('');
    setShowCommentModal(false);
    setCurrentPostForComment(null);
  };

  const handleImageUpload = () => {
    // In a real app, this would open file picker
    alert('图片上传功能（实际应用中会打开文件选择器，支持最多9张图片）');
  };

  const handleVideoUpload = () => {
    // In a real app, this would open file picker for videos
    alert('视频上传功能（实际应用中会打开文件选择器，支持最多60秒视频）');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">点滴日常</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center text-black hover:opacity-70 transition-opacity"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>发布新日常</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="px-6 py-6 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-black">{post.author}</h3>
                  <p className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</p>
                </div>
              </div>
              
              {post.author !== '我' && (
                <button 
                  onClick={() => handleFollow(post.author)}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    followedUsers.has(post.author) || isFollowing(`user_${post.author}`)
                      ? 'bg-black text-white'
                      : 'text-black border border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {followedUsers.has(post.author) || isFollowing(`user_${post.author}`) ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      已关注
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      关注
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <div className="flex items-center mb-2">
                <span className="font-semibold text-black">{post.author}</span>
                {isFriend(`user_${post.author}`) && (
                  <span className="ml-2 bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                    朋友
                  </span>
                )}
              </div>
              <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
              
              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    post.isLiked 
                      ? 'text-red-500 bg-red-50' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                
                <button 
                  onClick={() => handleComment(post.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments.length}</span>
                </button>
              </div>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-sm text-black">{comment.author}:</span>
                      <span className="text-sm text-gray-700">{comment.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">还没有日常分享</p>
            <p className="text-gray-400 text-sm mt-2">来分享第一条日常吧</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">发布新日常</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                关闭
              </button>
            </div>

            {/* Content Input */}
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="分享你的日常生活..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none mb-4"
              maxLength={500}
            />

            {/* Media Upload */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleImageUpload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">添加图片</span>
              </button>
              
              <button
                onClick={handleVideoUpload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Video className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">添加视频</span>
              </button>
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{newPost.content.length}/500</span>
              <button
                onClick={createPost}
                disabled={!newPost.content.trim()}
                className="bg-black text-white px-6 py-2 rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
              >
                发布日常
              </button>
            </div>

            <div className="text-center mt-4 text-xs text-gray-500">
              * 禁止商品推广和价格信息
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[60vh] rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">发表评论</h3>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCurrentPostForComment(null);
                  setNewComment('');
                }}
                className="text-gray-500 hover:text-black transition-colors"
              >
                关闭
              </button>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的想法..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none mb-4"
              maxLength={200}
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{newComment.length}/200</span>
              <button
                onClick={submitComment}
                disabled={!newComment.trim()}
                className="bg-black text-white px-6 py-2 rounded-xl disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
              >
                发表评论
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLifePage;