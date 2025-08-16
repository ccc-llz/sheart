import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listMyLikes, unlikeByTarget } from '../api/likes';

type LikeType = 'post' | 'comment' | 'debate';
interface Author { name: string; avatar: string; }
interface LikedItem {
    id: string;
    type: LikeType;
    targetId: string;
    content: string;
    postContent?: string;
    timestamp: string;
    author: Author;
    isLiked: boolean;
}

export default function LikesPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<LikedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | LikeType>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const likes = await listMyLikes(); // 从后端取我点赞过的
                setItems(likes);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const tmp = items.filter(it => {
            const hitQ =
                it.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (it.postContent || '').toLowerCase().includes(searchQuery.toLowerCase());
            const hitT = filterType === 'all' || it.type === filterType;
            return hitQ && hitT && it.isLiked;
        });
        return tmp.sort((a, b) =>
            sortOrder === 'newest'
                ? +new Date(b.timestamp) - +new Date(a.timestamp)
                : +new Date(a.timestamp) - +new Date(b.timestamp)
        );
    }, [items, searchQuery, filterType, sortOrder]);

    const handleUnlike = async (item: LikedItem) => {
        if (isRemoving) return;
        setIsRemoving(item.id);
        // 乐观更新
        setItems(prev => prev.map(p => (p.id === item.id ? { ...p, isLiked: false } : p)));
        try {
            await unlikeByTarget({ type: item.type, targetId: item.targetId });
            // 真删本地列表（也可保留 isLiked=false 的记录，随你）
            setItems(prev => prev.filter(p => p.id !== item.id));
        } catch (e) {
            // 回滚
            setItems(prev => prev.map(p => (p.id === item.id ? { ...p, isLiked: true } : p)));
        } finally {
            setIsRemoving(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* 头部/筛选搜索栏（略） */}

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center p-6">
                    <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchQuery ? '没有找到匹配的点赞内容' : '你还没有点赞任何内容'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        {searchQuery ? '尝试使用不同的关键词搜索' : '浏览内容时，点击心形图标可以点赞喜欢的内容'}
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                        浏览内容
                    </button>
                </div>
            ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence mode="wait">
                        {filtered.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                            >
                                <div className="flex items-start">
                                    <img src={item.author.avatar} alt={item.author.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="ml-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{item.author.name}</p>
                                            <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(item.timestamp).toLocaleString()}
                      </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                            {item.postContent ? `"${item.postContent}"` : item.content}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleUnlike(item)}
                                        disabled={isRemoving === item.id}
                                        className="p-2 text-red-500 hover:text-red-600 transition-colors ml-2"
                                        aria-label="取消点赞"
                                        title="取消点赞"
                                    >
                                        {isRemoving === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-current" />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
