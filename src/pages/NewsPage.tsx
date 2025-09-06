// src/pages/NewsPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

interface Comment {
  userId: string;
  username: string;
  content: string;
  date: string;
}

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  url: string;
  image?: string;
  video?: string;
  likes: string[];
  favorites: string[];
  comments: Comment[];
}

const categories = ['全部', '军事', '政治', '美妆', '宠物', '哲学', '经济'];
const PAGE_LIMIT = 10; // 每页加载数量
const PULL_THRESHOLD = 50; // 下拉刷新触发距离

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('全部');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const pulling = useRef<boolean>(false);

  // 无限滚动
  const observer = useRef<IntersectionObserver | null>(null);
  const lastNewsRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchNews = async (pageNum = 1, categoryParam = '') => {
    setLoading(true);
    try {
      const res = await api.get(
        `/news?page=${pageNum}&limit=${PAGE_LIMIT}${categoryParam ? `&category=${categoryParam}` : ''}`
      );
      if (pageNum === 1) {
        setNewsList(res.data);
      } else {
        setNewsList(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === PAGE_LIMIT);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchNews(1, category === '全部' ? '' : category);
  }, [category]);

  useEffect(() => {
    if (page === 1) return;
    fetchNews(page, category === '全部' ? '' : category);
  }, [page]);

  // 点赞
  const handleLike = async (itemId: string) => {
    if (!user) return alert('请先登录');
    try {
      const res = await api.post(`/news/${itemId}/like`);
      setNewsList(prev => prev.map(item => (item._id === itemId ? res.data.news : item)));
    } catch (err) {
      console.error(err);
    }
  };

  // 收藏
  const handleFavorite = async (itemId: string) => {
    if (!user) return alert('请先登录');
    try {
      const res = await api.post(`/news/${itemId}/favorite`);
      setNewsList(prev => prev.map(item => (item._id === itemId ? res.data.news : item)));
    } catch (err) {
      console.error(err);
    }
  };

  // 添加评论
  const handleComment = async (itemId: string, content: string) => {
    if (!user) return alert('请先登录');
    if (!content) return;
    try {
      const res = await api.post(`/news/${itemId}/comment`, { content });
      setNewsList(prev => prev.map(item => (item._id === itemId ? res.data.news : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchNews(1, category === '全部' ? '' : category);
    setRefreshing(false);
  };

  // 下拉刷新手势
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const touchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > PULL_THRESHOLD && !refreshing) {
        handleRefresh();
        pulling.current = false;
      }
    };

    const touchEnd = () => {
      pulling.current = false;
    };

    container.addEventListener('touchstart', touchStart);
    container.addEventListener('touchmove', touchMove);
    container.addEventListener('touchend', touchEnd);

    return () => {
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchmove', touchMove);
      container.removeEventListener('touchend', touchEnd);
    };
  }, [refreshing, category]);

  return (
    <div ref={scrollContainerRef} className="p-4 max-w-3xl mx-auto overflow-auto h-screen">
      {/* 分类导航 */}
      <div className="flex gap-2 overflow-x-auto mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full border ${
              category === c ? 'bg-black text-white' : 'bg-white border-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={handleRefresh}
          className="ml-auto flex items-center space-x-1 text-gray-500 hover:text-black"
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} />
          <span>刷新</span>
        </button>
      </div>

      {/* 新闻列表 */}
      {newsList.map((item, idx) => {
        if (idx === newsList.length - 1) {
          return (
            <motion.div
              ref={lastNewsRef}
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 shadow rounded-lg mb-4 overflow-hidden"
            >
              <NewsCard item={item} user={user} handleLike={handleLike} handleFavorite={handleFavorite} handleComment={handleComment} />
            </motion.div>
          );
        } else {
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 shadow rounded-lg mb-4 overflow-hidden"
            >
              <NewsCard item={item} user={user} handleLike={handleLike} handleFavorite={handleFavorite} handleComment={handleComment} />
            </motion.div>
          );
        }
      })}

      {loading && <div className="text-center text-gray-500">加载中...</div>}
      {!hasMore && !loading && <div className="text-center text-gray-400 mt-2">没有更多新闻了</div>}
    </div>
  );
};

interface NewsCardProps {
  item: NewsItem;
  user: any;
  handleLike: (id: string) => void;
  handleFavorite: (id: string) => void;
  handleComment: (id: string, content: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, user, handleLike, handleFavorite, handleComment }) => {
  return (
    <div className="p-4">
      {item.image && <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />}
      {item.video && (
        <video controls className="w-full h-48 object-cover">
          <source src={item.video} />
        </video>
      )}
      <a href={item.url} target="_blank" rel="noreferrer">
        <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
      </a>
      <p className="text-gray-600 mb-2">{item.content}</p>

      <div className="flex items-center space-x-4">
        <button
          className={`flex items-center space-x-1 ${item.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-500'}`}
          onClick={() => handleLike(item._id)}
        >
          <Heart size={18} />
          <span>{item.likes.length}</span>
        </button>

        <button
          className={`flex items-center space-x-1 ${item.favorites.includes(user?.id || '') ? 'text-yellow-500' : 'text-gray-500'}`}
          onClick={() => handleFavorite(item._id)}
        >
          <Star size={18} />
          <span>{item.favorites.length}</span>
        </button>

        <div className="flex items-center space-x-1">
          <MessageCircle size={18} />
          <span>{item.comments.length}</span>
        </div>
      </div>

      <div className="mt-2">
        <input
          type="text"
          placeholder="写评论..."
          className="w-full border rounded px-2 py-1 text-sm"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleComment(item._id, (e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </div>

      {item.comments.length ? (
        <div className="mt-2 max-h-40 overflow-y-auto">
          {item.comments.map((c, idx) => (
            <div key={idx} className="text-sm text-gray-700 border-b py-1">
              <span className="font-semibold">{c.username || c.userId}</span>: {c.content}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NewsPage;
