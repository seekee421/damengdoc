import { apiRequest, ApiResponse } from './config';

// 用户接口定义
export interface User {
  id: string;
  username: string;
  email: string;
  realName?: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: ('ADMIN' | 'EDITOR' | 'VIEWER')[];
  createdAt: string;
  lastLoginAt?: string;
}

// 登录请求接口
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  user: User;
  token?: string;
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  realName?: string;
}

// 注册响应接口
export interface RegisterResponse {
  user: User;
}

// 用户统计接口
export interface UserStats {
  activeUsers: number;
}

/**
 * 用户登录
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (!response.success) {
    throw new Error(response.message || '登录失败');
  }

  // 后端返回的数据结构中，user在response.user中
  return {
    user: response.user!,
    token: response.data?.token,
  };
}

/**
 * 用户注册
 */
export async function register(userData: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (!response.success) {
    throw new Error(response.message || '注册失败');
  }

  return {
    user: response.user!,
  };
}

/**
 * 检查用户名是否可用
 */
export async function checkUsername(username: string): Promise<boolean> {
  const response = await apiRequest<{ available: boolean }>('/auth/check-username', {
    method: 'GET',
  });

  return response.data?.available || false;
}

/**
 * 检查邮箱是否可用
 */
export async function checkEmail(email: string): Promise<boolean> {
  const response = await apiRequest<{ available: boolean }>('/auth/check-email', {
    method: 'GET',
  });

  return response.data?.available || false;
}

/**
 * 获取用户统计信息
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiRequest<{ activeUsers: number }>('/auth/stats');

  if (!response.success) {
    throw new Error(response.message || '获取统计信息失败');
  }

  return {
    activeUsers: response.data?.activeUsers || 0,
  };
}

/**
 * 获取当前用户信息（如果有token验证）
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest<User>('/auth/me');
    return response.success ? response.user! : null;
  } catch (error) {
    // 如果获取用户信息失败，返回null
    return null;
  }
}