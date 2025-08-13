// src/routes/avatar.js  (ESM)
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from '../middleware/authMiddleware.js'; // 你现在的鉴权中间件
import User from '../models/User.js'; // 如果你的模型不在这条路径，请把相对路径改一下

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

        // 生成输出路径
        const baseUploads = path.join(process.cwd(), 'uploads', 'avatars', userId);
        ensureDirSync(baseUploads);
        const key = `${uuid()}.webp`;
        const filePath = path.join(baseUploads, key);

        // 用 sharp 统一裁剪成 512x512 的正方形（cover 模式）
        await sharp(req.file.buffer)
            .resize(512, 512, { fit: 'cover', position: 'centre' })
            .webp({ quality: 90 })
            .toFile(filePath);

        // 生成可访问 URL（注意生产环境改成你的域名/CDN）
        const publicUrl = `/uploads/avatars/${userId}/${key}`;

        // 如果有旧头像文件，可以尝试删除（可选）
        if (me.avatar && me.avatar.startsWith('/uploads/')) {
            try {
                const oldAbs = path.join(process.cwd(), me.avatar.replace('/uploads', 'uploads'));
                if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
            } catch (e) {
                // 静默失败即可
            }
        }

        // 更新数据库里的头像 URL
        me.avatar = publicUrl;
        await me.save();

        return res.status(201).json({ avatar: publicUrl });
    } catch (err) {
        console.error(err);
        const msg = /File too large/i.test(err?.message) ? '图片过大（>5MB）' : (err?.message || '上传失败');
        return res.status(500).json({ error: msg });
    }
});

export default router;
