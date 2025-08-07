const express = require('express');
const router = express.Router();

const newsController = require('../controllers/newsController');

// 新闻模块路由
router.get('/news', newsController.getAllNews);
router.get('/news/:id', newsController.getNewsById);
router.post('/news', newsController.createNews); // 可选，管理后台用

module.exports = router;
