import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getConfessions,
    createConfession,
    toggleLike,
    addComment,
    getConfessionById,
    deleteConfession,
    getPopularTags
} from '../controllers/confessionController.js';

const router = express.Router();

// 公开接口 - 不需要登录
router.get('/', getConfessions); // 获取吐槽列表
router.get('/tags', getPopularTags); // 获取热门标签
router.get('/:confessionId', getConfessionById); // 获取单个吐槽详情

// 需要登录的接口
router.post('/', authMiddleware, createConfession); // 创建新吐槽
router.post('/:confessionId/like', authMiddleware, toggleLike); // 点赞/取消点赞
router.post('/:confessionId/comments', authMiddleware, addComment); // 添加评论
router.delete('/:confessionId', authMiddleware, deleteConfession); // 删除吐槽（仅作者）

export default router; 