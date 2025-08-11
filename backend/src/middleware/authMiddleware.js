import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET || 'yoursecret';

export const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未提供 Token' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token 无效' });
        req.userId = decoded.id;
        next();
    });
};


