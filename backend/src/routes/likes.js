// routes/likes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { listMyLikes, like, unlike } from '../controllers/likeController.js';

const router = express.Router();

router.get('/', authMiddleware, listMyLikes);
router.post('/', authMiddleware, like);
router.delete('/', authMiddleware, unlike);
router.delete('/:id', authMiddleware, unlike);

export default router;
