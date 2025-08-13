// routes/admin.invites.js  (ESM)
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import InviteCode from '../models/inviteCode.model.js';

const router = Router();

// 简单的管理员鉴权示例（按你项目替换）
function requireAdmin(req, res, next) {
    // 假设上游已把 user 注入到 req.user
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
}

/** 工具：生成随机明文码（10位十六进制） */
function genPlainCode(bytes = 5) {
    return crypto.randomBytes(bytes).toString('hex').toLowerCase();
}
/** 工具：sha256 摘要 */
function sha256Hex(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
}

/**
 * POST /admin/invites/generate
 * body: { count=100, maxUses=1, expiresAt?, role='user', note? }
 * 返回：{ codes: string[] } —— 仅本次返回明文
 */
router.post('/admin/invites/generate', requireAdmin, async (req, res) => {
    const { count = 100, maxUses = 1, expiresAt, role = 'user', note } = req.body || {};
    try {
        const codes = [];
        const docs = [];
        // 在内存里生成
        const set = new Set();
        while (set.size < Number(count)) set.add(genPlainCode(5));
        const arr = Array.from(set);

        for (const plain of arr) {
            const codeHash = await bcrypt.hash(plain, 10);
            const codeDigest = sha256Hex(plain);
            docs.push({ codeHash, codeDigest, maxUses, expiresAt, role, note, createdBy: req.user?._id });
            codes.push(plain);
        }
        await InviteCode.insertMany(docs, { ordered: false });

        res.json({ codes }); // 仅这次返回明文
    } catch (err) {
        console.error('generate invites error:', err);
        res.status(500).json({ error: '生成失败' });
    }
});

/**
 * GET /admin/invites?status=unused|partial|exhausted&limit=100
 * 查看使用情况（不包含明文）
 */
router.get('/admin/invites', requireAdmin, async (req, res) => {
    const { status, limit = 200 } = req.query;
    const q = {};
    if (status === 'unused') q.$expr = { $lt: ['$usedCount', '$maxUses'] };
    if (status === 'exhausted') q.$expr = { $gte: ['$usedCount', '$maxUses'] };
    // partial 就不额外处理了，前端自己判断 usedCount>0 && <maxUses

    const list = await InviteCode.find(q).sort('-createdAt').limit(Number(limit));
    res.json(list);
});

/**
 * GET /invites/verify?code=xxx&phone=138...
 * 仅校验，不消耗
 */
router.get('/invites/verify', async (req, res) => {
    const { code, phone } = req.query;
    if (!code) return res.status(400).json({ ok: false, reason: '缺少 code' });
    const doc = await InviteCode.verifyUsable(String(code), { phone: phone ? String(phone) : undefined });
    if (!doc) return res.json({ ok: false, reason: '不可用/过期/已用尽/手机号不匹配' });
    res.json({ ok: true, maxUses: doc.maxUses, usedCount: doc.usedCount, expiresAt: doc.expiresAt, note: doc.note, role: doc.role });
});

export default router;
