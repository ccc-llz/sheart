const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// 获取新闻
router.get('/', newsController.getNews);

// 点赞
router.post('/:id/like', newsController.toggleLike);

// 收藏
router.post('/:id/favorite', newsController.toggleFavorite);

// 评论
router.post('/:id/comment', newsController.addComment);

module.exports = router;
