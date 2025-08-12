// controllers/relationsController.js
import mongoose from 'mongoose';
import User from '../models/User.js';

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

export const follow = async (req, res) => {
    try {
        const meId = req.userId;
        const targetId = req.params.targetId;

        if (!mongoose.isValidObjectId(targetId)) {
            return res.status(400).json({ error: '无效的用户ID' });
        }
        if (meId === targetId) {
            return res.status(400).json({ error: '不能关注自己' });
        }

        const me = await User.findById(meId);
        const target = await User.findById(targetId);
        if (!me || !target) return res.status(404).json({ error: '用户不存在' });

        const meObjId = toObjectId(meId);
        const targetObjId = toObjectId(targetId);

        const alreadyFollowing = (me.followingList || []).some(id => id.equals(targetObjId));
        if (alreadyFollowing) {
            return res.status(200).json({ message: '已关注', me });
        }

        // 1) A 增加 following / followingList
        await User.updateOne(
            { _id: meObjId },
            {
                $addToSet: { followingList: targetObjId },
                $inc: { following: 1 }
            }
        );

        // 2) B 增加 followers / followersList
        await User.updateOne(
            { _id: targetObjId },
            {
                $addToSet: { followersList: meObjId },
                $inc: { followers: 1 }
            }
        );

        // 3) 如果 B 已经关注了 A，则互为好友
        const targetNow = await User.findById(targetObjId, 'followingList friends friendsList');
        const isMutual =
            Array.isArray(targetNow.followingList) &&
            targetNow.followingList.some(id => id.equals(meObjId));

        if (isMutual) {
            await User.updateOne(
                { _id: meObjId, friendsList: { $ne: targetObjId } },
                {
                    $addToSet: { friendsList: targetObjId },
                    $inc: { friends: 1 }
                }
            );
            await User.updateOne(
                { _id: targetObjId, friendsList: { $ne: meObjId } },
                {
                    $addToSet: { friendsList: meObjId },
                    $inc: { friends: 1 }
                }
            );
        }

        const meLatest = await User.findById(meObjId);
        res.json({ message: '关注成功', me: meLatest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '关注失败' });
    }
};

export const unfollow = async (req, res) => {
    try {
        const meId = req.userId;
        const targetId = req.params.targetId;

        if (!mongoose.isValidObjectId(targetId)) {
            return res.status(400).json({ error: '无效的用户ID' });
        }
        if (meId === targetId) {
            return res.status(400).json({ error: '不能对自己取关' });
        }

        const me = await User.findById(meId, 'followingList friendsList friends following');
        const target = await User.findById(targetId, 'followersList friendsList friends followers');
        if (!me || !target) return res.status(404).json({ error: '用户不存在' });

        const meObjId = toObjectId(meId);
        const targetObjId = toObjectId(targetId);

        const wasFollowing = Array.isArray(me.followingList) && me.followingList.some(id => id.equals(targetObjId));
        if (!wasFollowing) {
            return res.status(200).json({ message: '未关注，无需取关', me });
        }

        // 1) A 减 following 并移除列表
        await User.updateOne(
            { _id: meObjId },
            {
                $pull: { followingList: targetObjId },
                $inc: { following: -1 }
            }
        );

        // 2) B 减 followers 并移除列表
        await User.updateOne(
            { _id: targetObjId },
            {
                $pull: { followersList: meObjId },
                $inc: { followers: -1 }
            }
        );

        // 3) 若原来是好友（互关），需要双方 friends -1 且各自从 friendsList 移除
        const wasFriend =
            Array.isArray(me.friendsList) && me.friendsList.some(id => id.equals(targetObjId));
        if (wasFriend) {
            await User.updateOne(
                { _id: meObjId, friendsList: targetObjId },
                { $pull: { friendsList: targetObjId }, $inc: { friends: -1 } }
            );
            await User.updateOne(
                { _id: targetObjId, friendsList: meObjId },
                { $pull: { friendsList: meObjId }, $inc: { friends: -1 } }
            );
        }

        const meLatest = await User.findById(meObjId);
        res.json({ message: '取关成功', me: meLatest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '取关失败' });
    }
};

// 可选：查询关系状态
export const relationStatus = async (req, res) => {
    try {
        const meId = req.userId;
        const targetId = req.params.targetId;

        if (!mongoose.isValidObjectId(targetId)) {
            return res.status(400).json({ error: '无效的用户ID' });
        }

        const [me, target] = await Promise.all([
            User.findById(meId, 'followingList friendsList'),
            User.findById(targetId, 'followingList friendsList')
        ]);

        if (!me || !target) return res.status(404).json({ error: '用户不存在' });

        const meObjId = toObjectId(meId);
        const targetObjId = toObjectId(targetId);

        const iFollowHim = Array.isArray(me.followingList) && me.followingList.some(id => id.equals(targetObjId));
        const heFollowsMe = Array.isArray(target.followingList) && target.followingList.some(id => id.equals(meObjId));
        const isFriend =
            Array.isArray(me.friendsList) && me.friendsList.some(id => id.equals(targetObjId));

        res.json({ iFollowHim, heFollowsMe, isFriend });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '获取关系失败' });
    }
};
