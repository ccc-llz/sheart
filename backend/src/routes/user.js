// routes/user.js
import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
