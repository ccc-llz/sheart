import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // 注意 .js 扩展名，ESM 必须写
const SECRET_KEY = process.env.JWT_SECRET || 'yoursecret';

export const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
        console.log('Generated token:', token);

        res.json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
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
    console.log('Generated token:', token); // 调试

    res.json({ token, user });
};

