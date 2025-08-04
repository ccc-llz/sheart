import express from 'express';
import { createDebate, getDebateList, getDebateDetails } from '../controllers/debateController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// 创建辩题
router.post('/', authMiddleware, createDebate);

// 获取辩题列表
router.get('/', getDebateList);

// 获取某个辩题的详情
router.get('/:id', getDebateDetails);

export default router;
