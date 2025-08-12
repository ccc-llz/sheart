// controllers/debateController.js
import { Debate } from '../models/models.js';

// 列表
export const getDebateList = async (req, res) => {
    try {
        const debates = await Debate.find().sort({ createdAt: -1 });
        res.json(debates);
    } catch (err) {
        res.status(500).json({ error: '获取辩题失败' });
    }
};

// 详情
export const getDebateDetails = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '获取辩题详情失败' });
    }
};

// 创建
export const createDebate = async (req, res) => {
    try {
        const { topic, description, author, tags } = req.body;
        const debate = new Debate({ topic, description, author, tags });
        await debate.save();
        res.status(201).json(debate);
    } catch (err) {
        res.status(500).json({ error: '创建辩题失败' });
    }
};

// 投票
export const voteDebate = async (req, res) => {
    const { id } = req.params;
    const { side } = req.body; // 'pros' | 'cons'
    try {
        const debate = await Debate.findById(id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });

        if (side === 'pros') debate.votes.pros += 1;
        else if (side === 'cons') debate.votes.cons += 1;

        await debate.save();
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '投票失败' });
    }
};

// 点赞
export const likeDebate = async (req, res) => {
    const { id } = req.params;
    try {
        const debate = await Debate.findById(id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });

        debate.likes = (debate.likes || 0) + 1;
        await debate.save();
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '点赞失败' });
    }
};

// 评论
export const commentOnDebate = async (req, res) => {
    const { id } = req.params;
    const { user, content } = req.body;
    try {
        const debate = await Debate.findById(id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });

        debate.comments.push({ user, content, createdAt: new Date() });
        await debate.save();
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '评论失败' });
    }
};

// 可选：补一个默认导出，避免外部使用默认导入时报错
export default {
    getDebateList,
    getDebateDetails,
    createDebate,
    voteDebate,
    likeDebate,
    commentOnDebate,
};
