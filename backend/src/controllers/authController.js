const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 你的 UserSchema 文件
const SECRET_KEY = process.env.JWT_SECRET || 'yoursecret';

const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: '用户不存在' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: '密码错误' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user });
};

module.exports = {
    register,
    login
};
