// models/models.js (ESM)
import mongoose from 'mongoose';

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

export const News = mongoose.model('News', newsSchema);
export const Debate = mongoose.model('Debate', debateSchema);
