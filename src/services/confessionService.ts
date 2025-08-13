// 吐槽相关的API服务
const API_BASE = '/api/confessions';

// 获取吐槽列表
export const getConfessions = async (params?: {
  tag?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'likes';
}) => {
  const searchParams = new URLSearchParams();
  if (params?.tag) searchParams.append('tag', params.tag);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  const response = await fetch(`${API_BASE}?${searchParams}`);
  if (!response.ok) {
    throw new Error('获取吐槽列表失败');
  }
  return response.json();
};

// 创建新吐槽
export const createConfession = async (data: {
  content: string;
  tags: string[];
  isAnonymous?: boolean;
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
    throw new Error(error.error || '创建吐槽失败');
  }
  return response.json();
};

// 点赞/取消点赞
export const toggleLike = async (confessionId: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}/${confessionId}/like`, {
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
export const addComment = async (confessionId: string, content: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE}/${confessionId}/comments`, {
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

// 获取热门标签
export const getPopularTags = async () => {
  const response = await fetch(`${API_BASE}/tags`);
  if (!response.ok) {
    throw new Error('获取热门标签失败');
  }
  return response.json();
};

// 获取单个吐槽详情
export const getConfessionById = async (confessionId: string) => {
  const response = await fetch(`${API_BASE}/${confessionId}`);
  if (!response.ok) {
    throw new Error('获取吐槽详情失败');
  }
  return response.json();
}; 