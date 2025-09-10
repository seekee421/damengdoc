// API配置
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com'
  : 'http://localhost:8080';

// API请求配置
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 通用API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
}

// 错误处理
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 通用请求方法
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...API_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他错误
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败',
      0,
      null
    );
  }
}