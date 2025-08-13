// src/routes/avatar.js  (ESM)
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = Router();

// 用内存存储，方便交给 sharp 处理
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const ok = /^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.mimetype);
        cb(ok ? null : new Error('不支持的图片类型'), ok);
    }
});

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// POST /api/users/me/avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '请上传图片文件' });

        const userId = req.userId; // 来自 authMiddleware
        if (!userId) return res.status(401).json({ error: '未授权' });

        // 查询用户
        const me = await User.findById(userId);
        if (!me) return res.status(404).json({ error: '用户不存在' });

        // 输出路径：<项目>/uploads/avatars/<userId>/<uuid>.webp
        const uploadsRoot = path.join(process.cwd(), 'uploads');
        const userDir = path.join(uploadsRoot, 'avatars', req.userId);
        ensureDirSync(userDir);
        const key = `${uuid()}.webp`;
        const absPath = path.join(userDir, key);

        // 用 sharp 统一裁剪成 512x512 的正方形（cover 模式）
        await sharp(req.file.buffer)
            .resize(512, 512, { fit: 'cover', position: 'centre' })
            .webp({ quality: 90 })
            .toFile(absPath);

        // 相对路径（供静态服务使用）
        const publicPath = `/uploads/avatars/${req.userId}/${key}`;

        // 绝对 URL（优先 .env 的 BASE_URL；否则回退当前请求的协议和 Host）
        const base =
            process.env.BASE_URL ||
            `${req.protocol}://${req.get('host')}`;
        const absoluteUrl = `${base}${publicPath}`;

        if (me.avatar) {
            try {
                const oldPathname = me.avatar.startsWith('http')
                    ? new NodeURL(me.avatar).pathname
                    : me.avatar; // 可能是 /uploads/...
                if (oldPathname.startsWith('/uploads/')) {
                    const oldAbs = path.join(process.cwd(), oldPathname.replace('/uploads', 'uploads'));
                    if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
                }
            } catch {/* 忽略删除失败 */}
        }

        // 更新 DB
        me.avatar = absoluteUrl;    // 数据库存绝对 URL，前端不用再拼端口
        await me.save();
        console.log('Avatar saved to:', absPath);

        return res.status(201).json({ avatar: absoluteUrl });
    } catch (err) {
        console.error(err);
        const msg = /File too large/i.test(err?.message) ? '图片过大（>5MB）' : (err?.message || '上传失败');
        return res.status(500).json({ error: msg });
    }
});

export default router;