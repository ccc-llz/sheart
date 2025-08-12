// controllers/newsController.js  (ESM)
import { News } from '../models/models.js';

// 获取所有新闻
export const getAllNews = async (req, res) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        res.json(newsList);
    } catch (err) {
        res.status(500).json({ error: '获取新闻失败' });
    }
};

// 获取单条新闻详情
export const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ error: '新闻不存在' });
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: '获取新闻详情失败' });
    }
};

// 创建新闻（后台使用）
export const createNews = async (req, res) => {
    try {
        const { title, content, imageUrl, tags } = req.body;
        const news = new News({ title, content, imageUrl, tags });
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(500).json({ error: '创建新闻失败' });
    }
};

// 兼容默认导入（可选，但很省心）
export default {
    getAllNews,
    getNewsById,
    createNews,
};
