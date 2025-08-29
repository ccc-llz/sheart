import { DailyPost } from '../models/models.js';

// 获取日常分享列表
export const getDailyPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, author } = req.query;
        const skip = (page - 1) * limit;
        
        let query = { isPublic: true };
        if (author) {
            query.author = author;
        }
        
        const posts = await DailyPost.find(query)
            .populate('author', 'nickname avatar')
            .populate('comments.author', 'nickname avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await DailyPost.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                posts: posts.map(post => ({
                    id: post._id,
                    content: post.content,
                    images: post.images || [],
                    video: post.video,
                    author: {
                        id: post.author._id,
                        nickname: post.author.nickname,
                        avatar: post.author.avatar
                    },
                    timestamp: post.createdAt,
                    likes: post.likes,
                    comments: post.comments.map(comment => ({
                        id: comment._id,
                        content: comment.content,
                        author: {
                            id: comment.author._id,
                            nickname: comment.author.nickname,
                            avatar: comment.author.avatar
                        },
                        timestamp: comment.createdAt
                    })),
                    isLiked: req.userId ? post.likedBy.includes(req.userId) : false
                })),
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取日常分享列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取日常分享列表失败'
        });
    }
};

// 创建新的日常分享
export const createDailyPost = async (req, res) => {
    try {
        const { content, images = [], video } = req.body;
        const userId = req.userId;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '内容不能为空'
            });
        }
        
        if (content.length > 500) {
            return res.status(400).json({
                success: false,
                error: '内容不能超过500字'
            });
        }
        
        // 验证图片数量
        if (images.length > 9) {
            return res.status(400).json({
                success: false,
                error: '图片数量不能超过9张'
            });
        }
        
        const post = new DailyPost({
            content: content.trim(),
            images: Array.isArray(images) ? images : [],
            video: video || null,
            author: userId
        });
        
        await post.save();
        
        // 重新查询以获取作者信息
        const populatedPost = await DailyPost.findById(post._id)
            .populate('author', 'nickname avatar');
        
        res.status(201).json({
            success: true,
            data: {
                id: populatedPost._id,
                content: populatedPost.content,
                images: populatedPost.images,
                video: populatedPost.video,
                author: {
                    id: populatedPost.author._id,
                    nickname: populatedPost.author.nickname,
                    avatar: populatedPost.author.avatar
                },
                timestamp: populatedPost.createdAt,
                likes: 0,
                comments: [],
                isLiked: false
            }
        });
    } catch (error) {
        console.error('创建日常分享失败:', error);
        res.status(500).json({
            success: false,
            error: '创建日常分享失败'
        });
    }
};

// 点赞/取消点赞
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;
        
        const post = await DailyPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '日常分享不存在'
            });
        }
        
        const hasLiked = post.likedBy.includes(userId);
        
        if (hasLiked) {
            // 取消点赞
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            // 添加点赞
            post.likedBy.push(userId);
            post.likes += 1;
        }
        
        await post.save();
        
        res.json({
            success: true,
            data: {
                likes: post.likes,
                hasLiked: !hasLiked
            }
        });
    } catch (error) {
        console.error('点赞操作失败:', error);
        res.status(500).json({
            success: false,
            error: '点赞操作失败'
        });
    }
};

// 添加评论
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能为空'
            });
        }
        
        if (content.length > 200) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能超过200字'
            });
        }
        
        const post = await DailyPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '日常分享不存在'
            });
        }
        
        const comment = {
            content: content.trim(),
            author: userId
        };
        
        post.comments.push(comment);
        await post.save();
        
        // 重新查询以获取评论作者信息
        const populatedPost = await DailyPost.findById(postId)
            .populate('comments.author', 'nickname avatar');
        
        const newComment = populatedPost.comments[populatedPost.comments.length - 1];
        
        res.status(201).json({
            success: true,
            data: {
                id: newComment._id,
                content: newComment.content,
                author: {
                    id: newComment.author._id,
                    nickname: newComment.author.nickname,
                    avatar: newComment.author.avatar
                },
                timestamp: newComment.createdAt
            }
        });
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({
            success: false,
            error: '添加评论失败'
        });
    }
};

// 获取单个日常分享详情
export const getDailyPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await DailyPost.findById(postId)
            .populate('author', 'nickname avatar')
            .populate('comments.author', 'nickname avatar');
            
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '日常分享不存在'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: post._id,
                content: post.content,
                images: post.images || [],
                video: post.video,
                author: {
                    id: post.author._id,
                    nickname: post.author.nickname,
                    avatar: post.author.avatar
                },
                timestamp: post.createdAt,
                likes: post.likes,
                comments: post.comments.map(comment => ({
                    id: comment._id,
                    content: comment.content,
                    author: {
                        id: comment.author._id,
                        nickname: comment.author.nickname,
                        avatar: comment.author.avatar
                    },
                    timestamp: comment.createdAt
                })),
                isLiked: req.userId ? post.likedBy.includes(req.userId) : false
            }
        });
    } catch (error) {
        console.error('获取日常分享详情失败:', error);
        res.status(500).json({
            success: false,
            error: '获取日常分享详情失败'
        });
    }
};

// 删除日常分享
export const deleteDailyPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;
        
        const post = await DailyPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '日常分享不存在'
            });
        }
        
        // 检查是否是作者本人
        if (post.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: '只能删除自己的日常分享'
            });
        }
        
        await DailyPost.findByIdAndDelete(postId);
        
        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除日常分享失败:', error);
        res.status(500).json({
            success: false,
            error: '删除日常分享失败'
        });
    }
};

// 获取用户的日常分享
export const getUserDailyPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        
        const posts = await DailyPost.find({ 
            author: userId, 
            isPublic: true 
        })
            .populate('author', 'nickname avatar')
            .populate('comments.author', 'nickname avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await DailyPost.countDocuments({ 
            author: userId, 
            isPublic: true 
        });
        
        res.json({
            success: true,
            data: {
                posts: posts.map(post => ({
                    id: post._id,
                    content: post.content,
                    images: post.images || [],
                    video: post.video,
                    author: {
                        id: post.author._id,
                        nickname: post.author.nickname,
                        avatar: post.author.avatar
                    },
                    timestamp: post.createdAt,
                    likes: post.likes,
                    comments: post.comments.map(comment => ({
                        id: comment._id,
                        content: comment.content,
                        author: {
                            id: comment.author._id,
                            nickname: comment.author.nickname,
                            avatar: comment.author.avatar
                        },
                        timestamp: comment.createdAt
                    })),
                    isLiked: req.userId ? post.likedBy.includes(req.userId) : false
                })),
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取用户日常分享失败:', error);
        res.status(500).json({
            success: false,
            error: '获取用户日常分享失败'
        });
    }
}; 