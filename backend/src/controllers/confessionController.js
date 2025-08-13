import { Confession } from '../models/models.js';

// 获取吐槽列表
export const getConfessions = async (req, res) => {
    try {
        const { tag, page = 1, limit = 10, sort = 'createdAt' } = req.query;
        
        // 构建查询条件
        const query = {};
        if (tag && tag !== '全部') {
            query.tags = tag;
        }
        
        // 构建排序条件
        const sortOptions = {};
        if (sort === 'likes') {
            sortOptions.likes = -1;
        } else {
            sortOptions.createdAt = -1; // 默认按时间倒序
        }
        
        // 分页
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const confessions = await Confession.find(query)
            .populate('author', 'nickname') // 只获取昵称，前端显示匿名
            .populate('comments.author', 'nickname')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        // 获取总数用于分页
        const total = await Confession.countDocuments(query);
        
        // 处理数据，确保前端显示匿名
        const processedConfessions = confessions.map(confession => ({
            id: confession._id,
            content: confession.content,
            tags: confession.tags,
            timestamp: confession.createdAt,
            likes: confession.likes,
            comments: confession.comments.map(comment => ({
                id: comment._id,
                content: comment.content,
                timestamp: comment.createdAt
            })),
            // 前端显示匿名，但后端保留作者信息用于权限控制
            isAnonymous: confession.isAnonymous
        }));
        
        res.json({
            success: true,
            data: {
                confessions: processedConfessions,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / parseInt(limit)),
                    totalCount: total
                }
            }
        });
    } catch (error) {
        console.error('获取吐槽列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取吐槽列表失败'
        });
    }
};

// 创建新吐槽
export const createConfession = async (req, res) => {
    try {
        const { content, tags = [], isAnonymous = true } = req.body;
        const userId = req.user.id; // 从JWT中获取用户ID
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '吐槽内容不能为空'
            });
        }
        
        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                error: '吐槽内容不能超过1000字'
            });
        }
        
        const confession = new Confession({
            content: content.trim(),
            tags: Array.isArray(tags) ? tags : [],
            author: userId,
            isAnonymous
        });
        
        await confession.save();
        
        res.status(201).json({
            success: true,
            data: {
                id: confession._id,
                content: confession.content,
                tags: confession.tags,
                timestamp: confession.createdAt,
                likes: 0,
                comments: []
            }
        });
    } catch (error) {
        console.error('创建吐槽失败:', error);
        res.status(500).json({
            success: false,
            error: '创建吐槽失败'
        });
    }
};

// 点赞/取消点赞
export const toggleLike = async (req, res) => {
    try {
        const { confessionId } = req.params;
        const userId = req.user.id;
        
        const confession = await Confession.findById(confessionId);
        if (!confession) {
            return res.status(404).json({
                success: false,
                error: '吐槽不存在'
            });
        }
        
        const hasLiked = confession.likedBy.includes(userId);
        
        if (hasLiked) {
            // 取消点赞
            confession.likedBy = confession.likedBy.filter(id => id.toString() !== userId);
            confession.likes = Math.max(0, confession.likes - 1);
        } else {
            // 添加点赞
            confession.likedBy.push(userId);
            confession.likes += 1;
        }
        
        await confession.save();
        
        res.json({
            success: true,
            data: {
                likes: confession.likes,
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
        const { confessionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        
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
        
        const confession = await Confession.findById(confessionId);
        if (!confession) {
            return res.status(404).json({
                success: false,
                error: '吐槽不存在'
            });
        }
        
        const newComment = {
            content: content.trim(),
            author: userId,
            createdAt: new Date()
        };
        
        confession.comments.push(newComment);
        await confession.save();
        
        // 返回新评论信息
        const addedComment = confession.comments[confession.comments.length - 1];
        
        res.status(201).json({
            success: true,
            data: {
                id: addedComment._id,
                content: addedComment.content,
                timestamp: addedComment.createdAt
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

// 获取单个吐槽详情
export const getConfessionById = async (req, res) => {
    try {
        const { confessionId } = req.params;
        
        const confession = await Confession.findById(confessionId)
            .populate('author', 'nickname')
            .populate('comments.author', 'nickname')
            .lean();
        
        if (!confession) {
            return res.status(404).json({
                success: false,
                error: '吐槽不存在'
            });
        }
        
        // 检查当前用户是否已点赞
        const userId = req.user?.id;
        const hasLiked = userId ? confession.likedBy.includes(userId) : false;
        
        const processedConfession = {
            id: confession._id,
            content: confession.content,
            tags: confession.tags,
            timestamp: confession.createdAt,
            likes: confession.likes,
            hasLiked,
            comments: confession.comments.map(comment => ({
                id: comment._id,
                content: comment.content,
                timestamp: comment.createdAt
            }))
        };
        
        res.json({
            success: true,
            data: processedConfession
        });
    } catch (error) {
        console.error('获取吐槽详情失败:', error);
        res.status(500).json({
            success: false,
            error: '获取吐槽详情失败'
        });
    }
};

// 删除吐槽（仅作者可删除）
export const deleteConfession = async (req, res) => {
    try {
        const { confessionId } = req.params;
        const userId = req.user.id;
        
        const confession = await Confession.findById(confessionId);
        if (!confession) {
            return res.status(404).json({
                success: false,
                error: '吐槽不存在'
            });
        }
        
        // 检查权限
        if (confession.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: '无权限删除此吐槽'
            });
        }
        
        await Confession.findByIdAndDelete(confessionId);
        
        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除吐槽失败:', error);
        res.status(500).json({
            success: false,
            error: '删除吐槽失败'
        });
    }
};

// 获取热门标签
export const getPopularTags = async (req, res) => {
    try {
        const tags = await Confession.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        const popularTags = tags.map(tag => ({
            name: tag._id,
            count: tag.count
        }));
        
        res.json({
            success: true,
            data: popularTags
        });
    } catch (error) {
        console.error('获取热门标签失败:', error);
        res.status(500).json({
            success: false,
            error: '获取热门标签失败'
        });
    }
}; 