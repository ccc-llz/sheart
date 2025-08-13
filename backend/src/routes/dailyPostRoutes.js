import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getDailyPosts,
    createDailyPost,
    toggleLike,
    addComment,
    getDailyPostById,
    deleteDailyPost,
    getUserDailyPosts
} from '../controllers/dailyPostController.js';

const router = express.Router();

// Public routes
router.get('/', getDailyPosts);
router.get('/:postId', getDailyPostById);
router.get('/users/:userId/daily-posts', getUserDailyPosts);

// Authenticated routes
router.post('/', authMiddleware, createDailyPost);
router.post('/:postId/like', authMiddleware, toggleLike);
router.post('/:postId/comments', authMiddleware, addComment);
router.delete('/:postId', authMiddleware, deleteDailyPost);

export default router; 