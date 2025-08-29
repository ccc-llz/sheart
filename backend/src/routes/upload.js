// src/routes/upload.js (ESM)
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 图片上传配置
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ok = /^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.mimetype);
        cb(ok ? null : new Error('不支持的图片类型'), ok);
    }
});

// 视频上传配置
const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const ok = /^video\/(mp4|webm|ogg|mov|avi)$/i.test(file.mimetype);
        cb(ok ? null : new Error('不支持的视频类型'), ok);
    }
});

// 多图片上传配置
const multipleImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
        const ok = /^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.mimetype);
        cb(ok ? null : new Error('不支持的图片类型'), ok);
    }
});

// POST /api/upload/image - 上传单张图片
router.post('/image', authMiddleware, imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '请上传图片文件' });

        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: '未授权' });

        // 输出路径：<项目>/uploads/daily-posts/<userId>/images/<uuid>.webp
        const uploadsRoot = path.join(process.cwd(), 'uploads');
        const userDir = path.join(uploadsRoot, 'daily-posts', userId, 'images');
        ensureDirSync(userDir);
        const key = `${uuid()}.webp`;
        const absPath = path.join(userDir, key);

        // 用 sharp 处理图片（保持宽高比，最大宽度1200px）
        await sharp(req.file.buffer)
            .resize(1200, null, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toFile(absPath);

        // 相对路径（供静态服务使用）
        const publicPath = `/uploads/daily-posts/${userId}/images/${key}`;

        // 绝对 URL
        const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const absoluteUrl = `${base}${publicPath}`;

        console.log('Image saved to:', absPath);

        return res.status(201).json({ 
            success: true,
            url: absoluteUrl,
            path: publicPath
        });
    } catch (err) {
        console.error('Image upload error:', err);
        const msg = /File too large/i.test(err?.message) ? '图片过大（>10MB）' : (err?.message || '上传失败');
        return res.status(500).json({ error: msg });
    }
});

// POST /api/upload/images - 上传多张图片
router.post('/images', authMiddleware, multipleImageUpload.array('images', 9), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '请上传图片文件' });
        }

        if (req.files.length > 9) {
            return res.status(400).json({ error: '图片数量不能超过9张' });
        }

        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: '未授权' });

        const uploadsRoot = path.join(process.cwd(), 'uploads');
        const userDir = path.join(uploadsRoot, 'daily-posts', userId, 'images');
        ensureDirSync(userDir);

        const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const uploadedImages = [];

        // 处理每张图片
        for (const file of req.files) {
            const key = `${uuid()}.webp`;
            const absPath = path.join(userDir, key);

            // 用 sharp 处理图片
            await sharp(file.buffer)
                .resize(1200, null, { 
                    fit: 'inside', 
                    withoutEnlargement: true 
                })
                .webp({ quality: 85 })
                .toFile(absPath);

            const publicPath = `/uploads/daily-posts/${userId}/images/${key}`;
            const absoluteUrl = `${base}${publicPath}`;

            uploadedImages.push({
                url: absoluteUrl,
                path: publicPath
            });

            console.log('Image saved to:', absPath);
        }

        return res.status(201).json({ 
            success: true,
            images: uploadedImages
        });
    } catch (err) {
        console.error('Multiple images upload error:', err);
        const msg = /File too large/i.test(err?.message) ? '图片过大（>10MB）' : (err?.message || '上传失败');
        return res.status(500).json({ error: msg });
    }
});

// POST /api/upload/video - 上传视频
router.post('/video', authMiddleware, videoUpload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '请上传视频文件' });

        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: '未授权' });

        // 输出路径：<项目>/uploads/daily-posts/<userId>/videos/<uuid>.<ext>
        const uploadsRoot = path.join(process.cwd(), 'uploads');
        const userDir = path.join(uploadsRoot, 'daily-posts', userId, 'videos');
        ensureDirSync(userDir);

        // 保持原始文件扩展名
        const ext = path.extname(req.file.originalname) || '.mp4';
        const key = `${uuid()}${ext}`;
        const absPath = path.join(userDir, key);

        // 直接保存视频文件（不进行转码，保持原始格式）
        fs.writeFileSync(absPath, req.file.buffer);

        // 相对路径（供静态服务使用）
        const publicPath = `/uploads/daily-posts/${userId}/videos/${key}`;

        // 绝对 URL
        const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const absoluteUrl = `${base}${publicPath}`;

        console.log('Video saved to:', absPath);

        return res.status(201).json({ 
            success: true,
            url: absoluteUrl,
            path: publicPath,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (err) {
        console.error('Video upload error:', err);
        const msg = /File too large/i.test(err?.message) ? '视频过大（>100MB）' : (err?.message || '上传失败');
        return res.status(500).json({ error: msg });
    }
});

export default router;
