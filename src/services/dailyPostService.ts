// 日常分享相关的API服务
const API_BASE = '/api/daily-posts';

// 获取日常分享列表
export const getDailyPosts = async (params?: {
  page?: number;
  limit?: number;
  author?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.author) searchParams.append('author', params.author);

  const response = await fetch(`${API_BASE}?${searchParams}`);
  if (!response.ok) {
    throw new Error('获取日常分享列表失败');
  }
  return response.json();
};

// 创建新的日常分享
export const createDailyPost = async (data: {
  content: string;
  images?: string[];
  video?: string;
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '创建日常分享失败');
  }
  return response.json();
};

// 点赞/取消点赞
export const toggleLike = async (postId: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}/${postId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '点赞操作失败');
  }
  return response.json();
};

// 添加评论
export const addComment = async (postId: string, content: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '添加评论失败');
  }
  return response.json();
};

// 获取单个日常分享详情
export const getDailyPostById = async (postId: string) => {
  const response = await fetch(`${API_BASE}/${postId}`);
  if (!response.ok) {
    throw new Error('获取日常分享详情失败');
  }
  return response.json();
};

// 删除日常分享
export const deleteDailyPost = async (postId: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '删除日常分享失败');
  }
  return response.json();
};

// 获取用户的日常分享
export const getUserDailyPosts = async (userId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/users/${userId}/daily-posts?${searchParams}`);
  if (!response.ok) {
    throw new Error('获取用户日常分享失败');
  }
  return response.json();
}; 