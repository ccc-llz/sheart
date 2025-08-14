// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  nickname: string;
  phone?: string;
  email?:string;
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  followUser: (userId: string, userNickname: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;
  likedItems: any[];
  toggleLike: (id: string) => void;
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
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 新增点赞状态
  const [likedItems, setLikedItems] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('sheart_likes') || '[]'); }
    catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const next = prev.map(it => it.id === id ? { ...it, isLiked: !it.isLiked } : it);
      localStorage.setItem('sheart_likes', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('sheart_user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
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

    await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return true;
  };

  // 登录：仅密码
  const login = async (phone: string, password?: string): Promise<boolean> => {
    const body: Record<string, any> = { phone };
    if (password) body.password = password;

    const data = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!data?.token || !data?.user) throw new Error('登录返回数据不完整');
    setSession(data.token, data.user);
    return data;
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
            isLoading
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
