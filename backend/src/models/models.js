// models/models.js (ESM)
import mongoose from './db.js';

// News
const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: String,
        imageUrl: String,
        tags: { type: [String], default: [] }
    },
    { timestamps: true } // 自动生成 createdAt/updatedAt
);

// Debate
const debateSchema = new mongoose.Schema(
    {
        topic: { type: String, required: true },
        description: String,
        author: String,
        tags: { type: [String], default: [] },
        votes: {
            pros: { type: Number, default: 0 },
            cons: { type: Number, default: 0 }
        },
        likes: { type: Number, default: 0 }, // 点赞计数（或改用 likedBy 存用户列表）
        // likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [
            {
                user: String,
                content: String,
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

// Confession (吐槽)
const confessionSchema = new mongoose.Schema(
    {
        content: { type: String, required: true, maxlength: 1000 },
        tags: { type: [String], default: [] },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 关联用户，但前端显示匿名
        likes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 记录哪些用户点赞了
        comments: [
            {
                content: { type: String, required: true, maxlength: 200 },
                author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 评论作者，前端显示匿名
                createdAt: { type: Date, default: Date.now }
            }
        ],
        isAnonymous: { type: Boolean, default: true } // 是否匿名发布
    },
    { timestamps: true }
);

// 添加索引以提高查询性能
confessionSchema.index({ tags: 1 });
confessionSchema.index({ createdAt: -1 });
confessionSchema.index({ likes: -1 });

// DailyPost (日常分享)
const dailyPostSchema = new mongoose.Schema(
    {
        content: { type: String, required: true, maxlength: 500 },
        images: [{ type: String }], // 图片URL数组
        video: { type: String }, // 视频URL
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 记录哪些用户点赞了
        comments: [
            {
                content: { type: String, required: true, maxlength: 200 },
                author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        isPublic: { type: Boolean, default: true } // 是否公开
    },
    { timestamps: true }
);

// 添加索引以提高查询性能
dailyPostSchema.index({ author: 1, createdAt: -1 });
dailyPostSchema.index({ createdAt: -1 });
dailyPostSchema.index({ likes: -1 });

export const News = mongoose.model('News', newsSchema);
export const Debate = mongoose.model('Debate', debateSchema);
export const Confession = mongoose.model('Confession', confessionSchema);
export const DailyPost = mongoose.model('DailyPost', dailyPostSchema);
