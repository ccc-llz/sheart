const NewsItem = require('../models/NewsItem');
const User = require('../models/User');

// 获取新闻列表
exports.getNews = async (req, res) => {
  try {
    const { category, sort } = req.query;
    const filter = category ? { category } : {};
    const news = await NewsItem.find(filter)
      .sort(sort === 'hot' ? { likes: -1, comments: -1 } : { createdAt: -1 })
      .populate('comments.userId', 'username');
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取新闻失败' });
  }
};

// 点赞 / 取消点赞
exports.toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    const news = await NewsItem.findById(id);
    if (!news) return res.status(404).json({ error: '新闻不存在' });

    const index = news.likes.indexOf(userId);
    if (index > -1) news.likes.splice(index, 1);
    else news.likes.push(userId);

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '操作失败' });
  }
};

// 收藏 / 取消收藏
exports.toggleFavorite = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    const news = await NewsItem.findById(id);
    if (!news) return res.status(404).json({ error: '新闻不存在' });

    const index = news.favorites.indexOf(userId);
    if (index > -1) news.favorites.splice(index, 1);
    else news.favorites.push(userId);

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '操作失败' });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const { userId, content } = req.body;
    const { id } = req.params;
    const news = await NewsItem.findById(id);
    if (!news) return res.status(404).json({ error: '新闻不存在' });

    news.comments.push({ userId, content });
    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '评论失败' });
  }
};
