// models/Like.js
import mongoose from './db.js';
const { Schema } = mongoose;

const LikeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: { type: String, enum: ['post', 'comment', 'debate'], required: true, index: true },
    targetId: { type: String, required: true, index: true }, // 目标ID（字符串，兼容不同集合）
    content: { type: String },       // 简要内容
    postContent: { type: String },   // 若是点赞评论，可带原帖片段
    author: {
        name: String,
        avatar: String,
    },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// 防重复：同一用户、同一目标只能点一次
LikeSchema.index({ user: 1, type: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Like', LikeSchema);
