export async function http(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    // 如果是文件上传，不设置 Content-Type，让浏览器自动设置
    const headers: Record<string, string> = {};
    
    if (!options.body || !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {}),
        },
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
}
