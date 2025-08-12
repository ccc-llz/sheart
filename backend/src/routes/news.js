// routes/newsRoutes.js
import express from 'express';
import * as newsController from '../controllers/newsController.js';
// 或者命名导入: import { getAllNews, getNewsById, createNews } from '../controllers/newsController.js';

const router = express.Router();

// 新闻模块路由
router.get('/news', newsController.getAllNews);
router.get('/news/:id', newsController.getNewsById);
router.post('/news', newsController.createNews); // 可选，管理后台用

export default router;
