// routes/relations.js
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { follow, unfollow, relationStatus } from '../controllers/relationsController.js';

const router = Router();

// 关注
router.post('/follow/:targetId', authMiddleware, follow);

// 取关
router.delete('/follow/:targetId', authMiddleware, unfollow);

// 可选：关系状态
router.get('/status/:targetId', authMiddleware, relationStatus);

export default router;
