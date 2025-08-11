const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    idCard: { type: String, required: true, unique: true }, // 身份证号码
    realName: { type: String, required: true }, // 真实姓名
    nickname: { type: String, required: true, unique: true }, // 昵称
    phone: { type: String, required: true, unique: true }, // 手机号
    password: { type: String, required: true }, // 密码
    bio: { type: String, default: '' }, // 简介
    tags: { type: [String], default: [] }, // 标签
    avatar: { type: String, default: '' }, // 头像
    friends: { type: Number, default: 0 }, // 好友数
    following: { type: Number, default: 0 }, // 关注数
    followers: { type: Number, default: 0 }, // 粉丝数
    token: { type: String } // 认证令牌
});

// 密码加密
UserSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// 密码校验
UserSchema.methods.comparePassword = async function (passw) {
    return await bcrypt.compare(passw, this.password);
});

module.exports = mongoose.model('User', UserSchema);