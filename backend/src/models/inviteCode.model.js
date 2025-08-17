// ESM + Mongoose 邀请码模型（仅存哈希，不存明文）
// models/inviteCode.model.js
import mongoose from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const { Schema } = mongoose;

/**
 * 设计要点：
 * - codeHash：bcrypt 哈希，用于最终校验（慢哈希，防撞库）
 * - codeDigest：SHA-256 摘要，用于索引 & 快速查找（对高熵随机码安全性足够）
 * - usedCount/maxUses：使用计数 & 限额
 * - expiresAt：过期时间（可选）
 * - bindPhone：若设置，仅允许该手机号使用（可选）
 * - role/note：注册赋权 & 备注（可选）
 */
const inviteCodeSchema = new Schema(
    {
        codeHash: { type: String, required: true },
        codeDigest: { type: String, required: true, unique: true, index: true },

        maxUses: { type: Number, default: 1 },
        usedCount: { type: Number, default: 0 },
        expiresAt: { type: Date },
        bindPhone: { type: String },

        role: { type: String, default: 'user' },
        note: { type: String },

        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        usedAt: [{ type: Date }],

        active: { type: Boolean, default: true } // 软删除/停用
    },
    { timestamps: true }
);

// 屏蔽敏感字段的输出
inviteCodeSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.codeHash;
        delete ret.codeDigest;
        return ret;
    }
});

/** 工具：生成随机邀请码明文（默认 10 位十六进制，大小写不敏感） */
function genPlainCode(bytes = 5) {
    return crypto.randomBytes(bytes).toString('hex').toLowerCase(); // 如 "a1b2c3d4e5"
}

/** 工具：求 SHA-256 摘要（十六进制字符串） */
function sha256Hex(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
}

/**
 * 静态方法：批量生成邀请码
 * @param {Object} opts
 * @param {number} [opts.count=100]
 * @param {number} [opts.maxUses=1]
 * @param {Date}   [opts.expiresAt]
 * @param {string} [opts.role='user']
 * @param {string} [opts.note]
 * @param {string|ObjectId} [opts.createdBy]
 * @returns {Promise<{codes: string[], docs: any[]}>} codes 为这次唯一返回的明文
 */
inviteCodeSchema.statics.generateBatch = async function (opts = {}) {
    const {
        count = 100,
        maxUses = 1,
        expiresAt,
        role = 'user',
        note,
        createdBy
    } = opts;

    // 1) 先在内存里生成不重复的明文（极低概率碰撞）
    const plainSet = new Set();
    while (plainSet.size < count) {
        plainSet.add(genPlainCode(5)); // 10 hex chars
    }
    const plainCodes = Array.from(plainSet);

    // 2) 生成哈希 & 摘要
    const docs = await Promise.all(
        plainCodes.map(async (code) => {
            const codeHash = await bcrypt.hash(code, 10);
            const codeDigest = sha256Hex(code);
            return {
                codeHash,
                codeDigest,
                maxUses,
                expiresAt,
                role,
                note,
                createdBy
            };
        })
    );

    // 3) 写库（若意外发生摘要唯一索引冲突，可在外层重试一次）
    const inserted = await this.insertMany(docs, { ordered: false });

    // 4) 仅本次返回明文给管理员；DB 里从不保存明文
    return { codes: plainCodes, docs: inserted };
};

/**
 * 静态方法：预校验某个邀请码是否可用（不消耗）
 * 返回可用的文档或 null
 */
inviteCodeSchema.statics.verifyUsable = async function (code, { phone } = {}) {
    const now = new Date();
    const codeDigest = sha256Hex(String(code).trim().toLowerCase());

    const q = {
        codeDigest,
        active: true,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
        $expr: { $lt: ['$usedCount', '$maxUses'] }
    };

    if (phone) {
        q.$or = [
            ...(q.$or || []),
            { bindPhone: { $exists: false } },
            { bindPhone: null },
            { bindPhone: phone }
        ];
    }

    const doc = await this.findOne(q);
    if (!doc) return null;

    // 额外用慢哈希再确认（防止摘要被伪造）
    const ok = await bcrypt.compare(String(code).trim().toLowerCase(), doc.codeHash);
    return ok ? doc : null;
};

/**
 * 静态方法：原子消耗邀请码（并发安全）
 * 成功返回“更新后的文档”；失败返回 null
 * 可与注册放在同一事务 session 中使用
 */
inviteCodeSchema.statics.consume = async function (code, { email, session } = {}) {
    const now = new Date();
    const plain = String(code).trim().toLowerCase();
    const codeDigest = sha256Hex(plain);

    // 先按摘要筛选候选，再用 bcrypt 二次确认
    const baseQuery = {
        codeDigest,
        active: true,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
        $expr: { $lt: ['$usedCount', '$maxUses'] }
    };

    if (email) {
        baseQuery.$or = [
            ...(baseQuery.$or || []),
            { bindEmail: { $exists: false } },
            { bindEmail: null },
            { bindEmail: email }
        ];
    }

    const candidate = await this.findOne(baseQuery).session?.(session) ?? await this.findOne(baseQuery);
    if (!candidate) return null;

    const ok = await bcrypt.compare(plain, candidate.codeHash);
    if (!ok) return null;

    // 原子 + 条件更新，防止并发超额
    const updated = await this.findOneAndUpdate(
        {
            _id: candidate._id,
            active: true,
            $expr: { $lt: ['$usedCount', '$maxUses'] }
        },
        { $inc: { usedCount: 1 }, $push: { usedAt: now } },
        { new: true, session }
    );

    return updated;
};

/**
 * 静态方法：在用户创建完成后，补记使用者（可放在同一事务里）
 */
inviteCodeSchema.statics.appendUsedBy = async function (id, userId, { session } = {}) {
    if (!id || !userId) return;
    await this.updateOne(
        { _id: id },
        { $addToSet: { usedBy: userId } },
        { session }
    );
};

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);
export default InviteCode;
