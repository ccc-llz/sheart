const { Debate } = require('../models/models.js');

// 获取所有辩题
exports.getAllDebates = async (req, res) => {
    try {
        const debates = await Debate.find().sort({ createdAt: -1 });
        res.json(debates);
    } catch (err) {
        res.status(500).json({ error: '获取辩题失败' });
    }
};

// 获取辩题详情
exports.getDebateById = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '获取辩题详情失败' });
    }
};

// 发布辩题
exports.createDebate = async (req, res) => {
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
exports.voteDebate = async (req, res) => {
    const { id } = req.params;
    const { side } = req.body; // side: 'pros' or 'cons'
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

// 添加评论
exports.addComment = async (req, res) => {
    const { id } = req.params;
    const { user, content } = req.body;
    try {
        const debate = await Debate.findById(id);
        if (!debate) return res.status(404).json({ error: '辩题不存在' });

        debate.comments.push({ user, content });
        await debate.save();
        res.json(debate);
    } catch (err) {
        res.status(500).json({ error: '评论失败' });
    }
};
