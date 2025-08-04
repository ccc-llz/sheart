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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password?: string, verificationCode?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  followUser: (userId: string, userNickname: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;
}

interface RegisterData {
  idCard: string;
  realName: string;
  nickname: string;
  phone: string;
  password: string;
  verificationCode: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('sheart_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const validateIdCard = (idCard: string): { isValid: boolean; isFemale: boolean } => {
    if (idCard.length !== 18) return { isValid: false, isFemale: false };
    
    const genderDigit = parseInt(idCard[16]);
    const isFemale = genderDigit % 2 === 0;
    
    // Simple validation - in real app, this would call government API
    const isValid = /^\d{17}[\dX]$/.test(idCard);
    
    return { isValid, isFemale };
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const { isValid, isFemale } = validateIdCard(userData.idCard);
      
      if (!isValid) {
        throw new Error('身份证格式无效');
      }
      
      if (!isFemale) {
        throw new Error('您不符合注册条件');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        nickname: userData.nickname,
        phone: userData.phone,
        followers: 0,
        following: 0,
        friends: 0
      };
      
      localStorage.setItem('sheart_user', JSON.stringify(newUser));
      localStorage.setItem('sheart_credentials', JSON.stringify({
        phone: userData.phone,
        password: userData.password
      }));
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (phone: string, password?: string, verificationCode?: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUser = localStorage.getItem('sheart_user');
      const savedCredentials = localStorage.getItem('sheart_credentials');
      
      if (!savedUser || !savedCredentials) {
        throw new Error('用户不存在，请先注册');
      }
      
      const credentials = JSON.parse(savedCredentials);
      if (credentials.phone !== phone) {
        throw new Error('手机号未注册');
      }
      
      if (password && credentials.password !== password) {
        throw new Error('密码错误');
      }
      
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sheart_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('sheart_user', JSON.stringify(updatedUser));
    }
  };

  const followUser = (userId: string, userNickname: string) => {
    if (user && userId !== user.id) {
      const updatedUser = {
        ...user,
        following: user.following + 1,
        followingList: [...(user.followingList || []), userId]
      };
      setUser(updatedUser);
      localStorage.setItem('sheart_user', JSON.stringify(updatedUser));
      
      // Update the followed user's followers count (simulate)
      const followedUserKey = `sheart_user_${userId}`;
      const followedUserData = localStorage.getItem(followedUserKey);
      if (followedUserData) {
        const followedUser = JSON.parse(followedUserData);
        const updatedFollowedUser = {
          ...followedUser,
          followers: followedUser.followers + 1,
          followersList: [...(followedUser.followersList || []), user.id]
        };
        
        // Check if mutual follow (friend)
        if (followedUser.followingList?.includes(user.id)) {
          updatedUser.friends = user.friends + 1;
          updatedUser.friendsList = [...(user.friendsList || []), userId];
          updatedFollowedUser.friends = followedUser.friends + 1;
          updatedFollowedUser.friendsList = [...(followedUser.friendsList || []), user.id];
          setUser(updatedUser);
          localStorage.setItem('sheart_user', JSON.stringify(updatedUser));
        }
        
        localStorage.setItem(followedUserKey, JSON.stringify(updatedFollowedUser));
      }
    }
  };

  const unfollowUser = (userId: string) => {
    if (user && userId !== user.id) {
      const updatedUser = {
        ...user,
        following: Math.max(0, user.following - 1),
        followingList: (user.followingList || []).filter(id => id !== userId),
        friends: (user.friendsList || []).includes(userId) ? Math.max(0, user.friends - 1) : user.friends,
        friendsList: (user.friendsList || []).filter(id => id !== userId)
      };
      setUser(updatedUser);
      localStorage.setItem('sheart_user', JSON.stringify(updatedUser));
    }
  };

  const isFollowing = (userId: string) => {
    return user?.followingList?.includes(userId) || false;
  };

  const isFriend = (userId: string) => {
    return user?.friendsList?.includes(userId) || false;
  };
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      followUser,
      unfollowUser,
      isFollowing,
      isFriend
    }}>
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