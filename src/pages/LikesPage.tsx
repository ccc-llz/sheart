import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Calendar,
    Search,
    X,
    Trash2,
    Loader2,
    Filter,
    Clock,
    Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface Author {
    name: string;
    avatar: string;
}

interface LikedItem {
    id: string;
    type: 'post' | 'comment' | 'debate';
    targetId: string;
    content: string;
    postContent?: string;
    timestamp: string;
    author: Author;
    isLiked: boolean; // Added to track like status
}

const LikesPage: React.FC = () => {
    const { likedItems, toggleLike, isLoading } = useAuth(); // Changed from removeLike to toggleLike
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    // Filter and sort logic remains the same
    const filteredLikes = React.useMemo(() => {
        let result = likedItems.filter((item: { content: string; postContent: string; type: string; isLiked: boolean }) => {
            const matchesSearch =
                item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.postContent && item.postContent.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = filterType === 'all' || item.type === filterType;
            return matchesSearch && matchesType && item.isLiked; // Only show liked items
        });

        return result.sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });
    }, [likedItems, searchQuery, filterType, sortOrder]);

    // ... (keep all other existing helper functions like formatTimeAgo and getTypeInfo)

    // Modified to use toggleLike instead of removeLike
    const handleConfirmRemove = async (itemId: string) => {
        if (isRemoving) return;
        setIsRemoving(itemId);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toggleLike(itemId); // This should toggle the like status
        } finally {
            setIsRemoving(null);
            setShowDeleteConfirm(null);
        }
    };

    // ... (keep all the existing JSX rendering code)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Header remains the same */}
            {/* ... */}

            {/* Content rendering */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            ) : filteredLikes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center p-6">
                    <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchQuery ? '没有找到匹配的点赞内容' : '你还没有点赞任何内容'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        {searchQuery
                            ? '尝试使用不同的关键词搜索'
                            : '浏览内容时，点击心形图标可以点赞喜欢的内容'}
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
                        {filteredLikes.map((item: LikedItem) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                            >
                                <div className="flex items-start">
                                    {/* Author avatar */}
                                    <img
                                        src={item.author.avatar}
                                        alt={item.author.name}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />

                                    {/* Content area */}
                                    <div className="ml-3 flex-1 cursor-pointer" onClick={() => goToItemDetail(item)}>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{item.author.name}</p>
                                            <span className={`text-xs ${getTypeInfo(item.type).color}`}>
                                                点赞了{getTypeInfo(item.type).text}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatTimeAgo(item.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                            {item.postContent ? `"${item.postContent}"` : item.content}
                                        </p>
                                    </div>

                                    {/* Like button - modified to show filled heart for liked items */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmRemove(item.id);
                                        }}
                                        className="p-2 text-red-500 hover:text-red-600 transition-colors ml-2"
                                        aria-label="取消点赞"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowDeleteConfirm(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">取消点赞？</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            你确定要取消对这条内容的点赞吗？
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleConfirmRemove(showDeleteConfirm)}
                                disabled={isRemoving === showDeleteConfirm}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {isRemoving === showDeleteConfirm ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    '确认取消'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default LikesPage;