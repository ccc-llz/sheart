// controllers/authController.js
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';              // 注意保留 .js 扩展名
import InviteCode from '../models/inviteCode.model.js';

const SECRET_KEY = process.env.JWT_SECRET || 'yoursecret';

/**
 * 注册：必须携带 inviteCode
 * 前端 body 应包含 { phone, password, nickname, realName, idCard, inviteCode }
 */
export const register = async (req, res) => {
    const { phone, password, nickname, realName, idCard, inviteCode } = req.body || {};
    if (!inviteCode) return res.status(400).json({ error: '缺少邀请码' });
    if (!phone || !password || !nickname) {
        return res.status(400).json({ error: '缺少必填字段' });
    }

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // 1) 原子校验并消耗邀请码（可绑定手机号）
            const consumed = await InviteCode.consume(inviteCode, { phone, session });
            if (!consumed) throw new Error('邀请码无效或已过期/已用完');

            // 2) 防重复注册
            const exists = await User.findOne({ phone }).session(session);
            if (exists) throw new Error('手机号已注册');

            // 3) 创建用户（如你的 User 模型有 pre-save hash，在此直接传明文 password 即可）
            const [user] = await User.create([{
                phone,
                password,
                nickname,
                realName,
                idCard,
                role: consumed.role || 'user'
            }], { session });

            // 4) 回写使用者
            await InviteCode.appendUsedBy(consumed._id, user._id, { session });

            // 5) 返回 token + user（维持你原先行为）
            const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
            res.status(201).json({ token, user });
        });
    } catch (err) {
        console.error('register error:', err);
        return res.status(400).json({ error: err.message || '注册失败' });
    } finally {
        session.endSession();
    }
};

export const login = async (req, res) => {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
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
