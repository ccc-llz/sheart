// routes/debateRoutes.js
import express from 'express';
import {
    createDebate,
    getDebateList,
    getDebateDetails,
    voteDebate,
    likeDebate,
    commentOnDebate,
} from '../controllers/debateController';

import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// 获取辩论列表 /api/debate
router.get('/', getDebateList);

// 创建辩论 /api/debate
router.post('/', authMiddleware, createDebate);

// 获取详情 /api/debate/:id
router.get('/:id', getDebateDetails);

// 投票操作 /api/debate/:id/vote
router.post('/:id/vote', authMiddleware, voteDebate);

// 点赞操作 /api/debate/:id/like
router.post('/:id/like', authMiddleware, likeDebate);

// 评论操作 /api/debate/:id/comment
router.post('/:id/comment', authMiddleware, commentOnDebate);

export default router;
