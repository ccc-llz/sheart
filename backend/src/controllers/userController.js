// controllers/userController.js
import { User } from '../models/User.js';

/**
 * GET /api/users/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: '用户不存在' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: '获取用户信息失败' });
    }
};

/**
 * PATCH /api/users/me
 */
export const updateMe = async (req, res) => {
    try {
        const allowedFields = ['nickname', 'bio', 'tags', 'avatar'];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (updateData.tags && !Array.isArray(updateData.tags)) {
            return res.status(400).json({ error: 'tags 必须是字符串数组' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) return res.status(404).json({ error: '用户不存在' });

        res.json({ user: updatedUser });
    } catch (err) {
        if (err && err.code === 11000) {
            const key = Object.keys(err.keyPattern || {})[0] || '字段';
            return res.status(409).json({ error: `${key} 已被占用` });
        }
        res.status(400).json({ error: '更新资料失败' });
    }
};
