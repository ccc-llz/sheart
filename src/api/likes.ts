import { http } from './http';

export type LikeType = 'post' | 'comment' | 'debate';

export async function listMyLikes() {
    const data = await http('/likes'); // GET /api/likes
    return data.likes;
}

export async function likeOnce(input: {
    type: LikeType;
    targetId: string;
    content?: string;
    postContent?: string;
    author?: { name?: string; avatar?: string };
}) {
    return http('/likes', { method: 'POST', body: JSON.stringify(input) });
}

export async function unlikeByTarget(input: { type: LikeType; targetId: string }) {
    return http('/likes', { method: 'DELETE', body: JSON.stringify(input) });
}
