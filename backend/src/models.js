const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const News = mongoose.model('News', newsSchema);
const debateSchema = new mongoose.Schema({
    topic: String,
    description: String,
    author: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    votes: {
        pros: { type: Number, default: 0 },
        cons: { type: Number, default: 0 }
    },
    comments: [
        {
            user: String,
            content: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const Debate = mongoose.model('Debate', debateSchema);
