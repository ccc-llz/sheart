// controllers/likeController.js
import Like from '../models/Like.js';

// GET /api/likes  我点赞过的
export const listMyLikes = async (req, res) => {
    try {
        const likes = await Like.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
        const mapped = likes.map(l => ({
            id: l._id.toString(),
            type: l.type,
            targetId: l.targetId,
            content: l.content || '',
            postContent: l.postContent || '',
            timestamp: l.createdAt,
            author: { name: l.author?.name || '', avatar: l.author?.avatar || '' },
            isLiked: true,
        }));
        res.json({ likes: mapped });
    } catch (err) {
        console.error('listMyLikes error:', err);
        res.status(500).json({ error: '获取点赞列表失败' });
    }
};

// POST /api/likes  点赞
// body: { type, targetId, content?, postContent?, author? }
export const like = async (req, res) => {
    try {
        const { type, targetId, content, postContent, author } = req.body || {};
        if (!type || !targetId) return res.status(400).json({ error: '缺少参数' });

        const doc = await Like.findOneAndUpdate(
            { user: req.userId, type, targetId },
            {
                $setOnInsert: {
                    user: req.userId,
                    type, targetId, content, postContent, author,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ ok: true, id: doc._id.toString() });
    } catch (err) {
        // 可能是唯一索引冲突（已经点过）
        if (err?.code === 11000) return res.status(200).json({ ok: true, dup: true });
        console.error('like error:', err);
        res.status(500).json({ error: '点赞失败' });
    }
};

// DELETE /api/likes  取消点赞
// body: { type, targetId }  或  DELETE /api/likes/:id
export const unlike = async (req, res) => {
    try {
        const { id } = req.params;
        let cond;
        if (id) {
            cond = { _id: id, user: req.userId };
        } else {
            const { type, targetId } = req.body || {};
            if (!type || !targetId) return res.status(400).json({ error: '缺少参数' });
            cond = { user: req.userId, type, targetId };
        }

        const del = await Like.findOneAndDelete(cond);
        res.json({ ok: true, deleted: !!del });
    } catch (err) {
        console.error('unlike error:', err);
        res.status(500).json({ error: '取消点赞失败' });
    }
};
