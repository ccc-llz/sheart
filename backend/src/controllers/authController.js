// controllers/authController.js
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';              // 注意保留 .js 扩展名
import InviteCode from '../models/inviteCode.model.js';

const SECRET_KEY = process.env.JWT_SECRET || 'yoursecret';

/**
 * 注册：必须携带 inviteCode

 */
export const register = async (req, res) => {
    const { email, password, nickname, realName, idCard, inviteCode } = req.body || {};
    if (!inviteCode) return res.status(400).json({ error: '缺少邀请码' });
    if (!email || !password || !nickname) {
        return res.status(400).json({ error: '缺少必填字段' });
    }

    try {
        // 1) 消耗邀请码（并发安全的自增在模型里做了）
        const consumed = await InviteCode.consume(inviteCode, { email }); // 见下方模型修复
        if (!consumed) throw new Error('邀请码无效或已过期/已用完');

        // 2) 防重复
        const exists = await User.findOne({ email });
        if (exists) throw new Error('邮箱已注册');

        // 3) 创建用户
        const user = await User.create({
            email, password, nickname, realName, idCard, role: consumed.role || 'user'
        });

        // 4) 记录使用者（非关键失败可忽略）
        await InviteCode.appendUsedBy(consumed._id, user._id);

        // 5) 返回
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
        res.status(201).json({ token, user });
    } catch (err) {
        console.error('register error:', err);
        // ☆ 可选：如果你希望强一致性，这里可以用 codeDigest 找到该码，把 usedCount 减 1（注意防脏数据）
        return res.status(400).json({ error: err.message || '注册失败' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: '用户不存在' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ error: '密码错误' });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user });
};
