// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  nickname: string;
  phone?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  tags?: string[];
  followers: number;
  following: number;
  friends: number;
  followingList?: string[];
  followersList?: string[];
  friendsList?: string[];
}

interface RegisterData {
  idCard: string;
  realName: string;
  nickname: string;
  email: string;
  password: string;
  inviteCode: string;
}

type LikeType = 'post' | 'comment' | 'debate';
interface LikedItem {
  id: string;                // 后端 Like 文档 _id
  type: LikeType;            // 目标类型
  targetId: string;          // 目标内容 id（帖子/评论/辩论）
  content: string;           // 目标内容摘要
  postContent?: string;      // 若是评论/辩论可带原帖片段
  timestamp: string;         // createdAt
  author: { name: string; avatar: string };
  isLiked: boolean;          // 永远为 true（前端用来过滤/显示填充心形）
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  followUser: (userId: string, userNickname: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;

  likedItems: LikedItem[];
  /**
   * 点赞/取消点赞：
   * - 如果传入的是 “likeId”（已经在 likedItems 里的 id），则直接取消该点赞（DELETE /likes/:id）
   * - 如果传入的是目标 targetId + type，则创建或取消该目标的点赞（POST/DELETE /likes）
   */
  toggleLike: (idOrTargetId: string, type?: LikeType, payload?: Partial<LikedItem>) => Promise<void>;

  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = '/api';

function toStringIds(arr: any[] | undefined): string[] {
  return (arr || []).map((x: any) => (typeof x === 'string' ? x : x?.toString?.() ?? String(x)));
}

function normalizeUser(u: any): User {
  return {
    id: u.id || u._id || '',
    nickname: u.nickname,
    phone: u.phone,
    avatar: u.avatar,
    bio: u.bio,
    tags: u.tags || [],
    email: u.email,
    followers: typeof u.followers === 'number' ? u.followers : 0,
    following: typeof u.following === 'number' ? u.following : 0,
    friends: typeof u.friends === 'number' ? u.friends : 0,
    followingList: toStringIds(u.followingList),
    followersList: toStringIds(u.followersList),
    friendsList: toStringIds(u.friendsList),
  };
}

async function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 点赞从后端初始化
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 恢复会话并拉取点赞列表
  useEffect(() => {
    const savedUser = localStorage.getItem('sheart_user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
        // 拉取我点赞过的列表
        authFetch('/likes')
            .then((data) => {
              const arr = Array.isArray(data.likes) ? data.likes : [];
              const normalized: LikedItem[] = arr.map((l: any) => ({
                id: l.id || l._id,
                type: l.type,
                targetId: l.targetId,
                content: l.content || '',
                postContent: l.postContent || '',
                timestamp: l.timestamp || l.createdAt,
                author: { name: l.author?.name || '', avatar: l.author?.avatar || '' },
                isLiked: true,
              }));
              setLikedItems(normalized);
            })
            .catch(() => setLikedItems([]));
      } catch {
        localStorage.removeItem('sheart_user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const setSession = (token: string, rawUser: any) => {
    const u = normalizeUser(rawUser);
    localStorage.setItem('token', token);
    localStorage.setItem('sheart_user', JSON.stringify(u));
    setUser(u);
    setIsAuthenticated(true);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('sheart_user');
    setUser(null);
    setIsAuthenticated(false);
    setLikedItems([]);
  };

  const validateIdCard = (idCard: string): { isValid: boolean; isFemale: boolean } => {
    if (idCard.length !== 18) return { isValid: false, isFemale: false };
    const genderDigit = parseInt(idCard[16]);
    const isFemale = genderDigit % 2 === 0;
    const isValid = /^\d{17}[\dX]$/.test(idCard);
    return { isValid, isFemale };
  };

  // 注册：携带 inviteCode
  const register = async (userData: RegisterData): Promise<boolean> => {
    const { isValid, isFemale } = validateIdCard(userData.idCard);
    if (!isValid) throw new Error('身份证格式无效');
    if (!isFemale) throw new Error('您不符合注册条件');

    const payload = {
      idCard: userData.idCard,
      realName: userData.realName,
      nickname: userData.nickname,
      email: userData.email,
      password: userData.password,
      inviteCode: userData.inviteCode,
    };

    await authFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    return true;
  };

  // 登录：使用 email + password（与后端一致）
  const login = async (email: string, password?: string): Promise<boolean> => {
    const body: Record<string, any> = { email };
    if (password) body.password = password;

    const data = await authFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    if (!data?.token || !data?.user) throw new Error('登录返回数据不完整');

    setSession(data.token, data.user);

    // 登录成功后拉取点赞列表
    try {
      const likesRes = await authFetch('/likes');
      const arr = Array.isArray(likesRes.likes) ? likesRes.likes : [];
      const normalized: LikedItem[] = arr.map((l: any) => ({
        id: l.id || l._id,
        type: l.type,
        targetId: l.targetId,
        content: l.content || '',
        postContent: l.postContent || '',
        timestamp: l.timestamp || l.createdAt,
        author: { name: l.author?.name || '', avatar: l.author?.avatar || '' },
        isLiked: true,
      }));
      setLikedItems(normalized);
    } catch {
      setLikedItems([]);
    }

    return true;
  };

  const logout = () => clearSession();

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedLocal = { ...user, ...userData };
    setUser(updatedLocal);
    localStorage.setItem('sheart_user', JSON.stringify(updatedLocal));
    authFetch('/users/me', { method: 'PATCH', body: JSON.stringify(userData) })
        .then((data) => {
          const merged = normalizeUser(data.user);
          setUser(merged);
          localStorage.setItem('sheart_user', JSON.stringify(merged));
        })
        .catch((e) => console.error(e));
  };

  // 关注 / 取关：走后端 relations 接口，并用返回的 me 刷新本地用户
  const followUser = async (targetUserId: string, _userNickname: string) => {
    if (!user || targetUserId === user.id) return;
    try {
      const data = await authFetch(`/relations/follow/${targetUserId}`, { method: 'POST' });
      const me = normalizeUser(data.me);
      setUser(me);
      localStorage.setItem('sheart_user', JSON.stringify(me));
    } catch (e) {
      console.error('followUser failed:', e);
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;
    try {
      const data = await authFetch(`/relations/follow/${targetUserId}`, { method: 'DELETE' });
      const me = normalizeUser(data.me);
      setUser(me);
      localStorage.setItem('sheart_user', JSON.stringify(me));
    } catch (e) {
      console.error('unfollowUser failed:', e);
    }
  };

  const isFollowing = (targetId: string) => !!user?.followingList?.includes(targetId);
  const isFriend = (targetId: string) => !!user?.friendsList?.includes(targetId);

  // 点赞/取消点赞：支持两种形态
  // A) toggleLike(likeId)  —— 取消这条点赞（用于 LikesPage）
  // B) toggleLike(targetId, type, payload?) —— 若已点赞则取消，否则创建
  const toggleLike: AuthContextType['toggleLike'] = async (idOrTargetId, type, payload) => {
    // 形态 A：把参数当作 likeId
    const byId = likedItems.find((x) => x.id === idOrTargetId);
    if (byId) {
      // 乐观更新：先从本地移除
      setLikedItems((prev) => prev.filter((x) => x.id !== idOrTargetId));
      try {
        await authFetch(`/likes/${idOrTargetId}`, { method: 'DELETE' });
      } catch (e) {
        // 回滚
        setLikedItems((prev) => [byId, ...prev]);
      }
      return;
    }

    // 形态 B：按 (targetId, type) 处理
    if (!type) return; // 没有 type 无法知道目标类型，直接返回
    const exists = likedItems.find((x) => x.type === type && x.targetId === idOrTargetId);

    if (exists) {
      // 取消点赞（乐观更新）
      setLikedItems((prev) => prev.filter((x) => !(x.type === type && x.targetId === idOrTargetId)));
      try {
        await authFetch('/likes', { method: 'DELETE', body: JSON.stringify({ type, targetId: idOrTargetId }) });
      } catch (e) {
        // 回滚
        setLikedItems((prev) => [exists, ...prev]);
      }
    } else {
      // 新增点赞（乐观新增，再用后端 id 替换）
      const temp: LikedItem = {
        id: `temp_${Date.now()}`,
        type,
        targetId: idOrTargetId,
        content: payload?.content || '',
        postContent: payload?.postContent || '',
        timestamp: new Date().toISOString(),
        author: { name: payload?.author?.name || '', avatar: payload?.author?.avatar || '' },
        isLiked: true,
      };
      setLikedItems((prev) => [temp, ...prev]);
      try {
        const data = await authFetch('/likes', {
          method: 'POST',
          body: JSON.stringify({
            type,
            targetId: idOrTargetId,
            content: temp.content,
            postContent: temp.postContent,
            author: temp.author,
          }),
        });
        if (data?.id) {
          setLikedItems((prev) => prev.map((x) => (x.id === temp.id ? { ...temp, id: data.id } : x)));
        }
      } catch (e) {
        // 回滚
        setLikedItems((prev) => prev.filter((x) => x.id !== temp.id));
      }
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated,
            login,
            register,
            logout,
            updateUser,
            followUser,
            unfollowUser,
            isFollowing,
            isFriend,
            likedItems,
            toggleLike,
            isLoading,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
