import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  nickname: string;
  phone: string;
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
  phone: string;
  password: string;
  verificationCode: string; // 若后端不需要可忽略
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password?: string, verificationCode?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void; // 本地立即更新；若有后端 PATCH 会同步覆盖
  followUser: (userId: string, userNickname: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ====== 配置你的后端基础路径 ======
const API_BASE = '/api';

// ====== 工具函数 ======
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

// ====== Provider ======
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 恢复本地会话
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

  // 本地身份证验证（与你原逻辑一致）
  const validateIdCard = (idCard: string): { isValid: boolean; isFemale: boolean } => {
    if (idCard.length !== 18) return { isValid: false, isFemale: false };
    const genderDigit = parseInt(idCard[16]);
    const isFemale = genderDigit % 2 === 0;
    const isValid = /^\d{17}[\dX]$/.test(idCard);
    return { isValid, isFemale };
  };

  // 注册：调用后端接口（保持你原交互——注册成功跳转登录页，不直接登录）
  const register = async (userData: RegisterData): Promise<boolean> => {
    const { isValid, isFemale } = validateIdCard(userData.idCard);
    if (!isValid) throw new Error('身份证格式无效');
    if (!isFemale) throw new Error('您不符合注册条件');

    const payload = {
      idCard: userData.idCard,
      realName: userData.realName,
      nickname: userData.nickname,
      phone: userData.phone,
      password: userData.password,
      // verificationCode: userData.verificationCode, // 若后端需要，取消注释
    };

    await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return true;
  };

  // 登录：调用后端，保存 token + user
  const login = async (phone: string, password?: string, _verificationCode?: string): Promise<boolean> => {
    const body: Record<string, any> = { phone };
    if (password) body.password = password; // 当前用密码登录；验证码登录可扩展

    const data = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!data?.token || !data?.user) throw new Error('登录返回数据不完整');
    setSession(data.token, data.user);
    return true;
  };

  const logout = () => {
    clearSession();
  };

  // 更新资料：先本地更新；如果后端开了 PATCH /api/users/me，这里会再覆盖为服务端返回
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    // 本地立即更新
    const updatedLocal = { ...user, ...userData };
    setUser(updatedLocal);
    localStorage.setItem('sheart_user', JSON.stringify(updatedLocal));

    // 若有后端接口，发送并以服务端为准覆盖
    authFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
        .then((data) => {
          const merged = normalizeUser(data.user);
          setUser(merged);
          localStorage.setItem('sheart_user', JSON.stringify(merged));
        })
        .catch((e) => {
          console.error(e);
          // 失败时你也可以选择回滚本地状态
        });
  };

  // 关注：对接后端 /api/relations/follow/:targetId
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

  // 取关：对接后端 /api/relations/follow/:targetId
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

  // 使用本地 user 判定；需要更严格一致性可调用 /api/relations/status/:id 校准
  const isFollowing = (targetId: string) => {
    return !!user?.followingList?.includes(targetId);
  };

  const isFriend = (targetId: string) => {
    return !!user?.friendsList?.includes(targetId);
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
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
