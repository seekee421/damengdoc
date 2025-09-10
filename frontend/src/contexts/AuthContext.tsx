import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, User } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 移除模拟用户数据，使用真实API

// 权限配置
const permissions = {
  admin: [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'doc.create',
    'doc.read',
    'doc.update',
    'doc.delete',
    'doc.publish',
    'system.config',
    'analytics.view'
  ],
  editor: [
    'doc.create',
    'doc.read',
    'doc.update',
    'doc.publish'
  ],
  viewer: [
    'doc.read'
  ]
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('dameng_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('dameng_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiLogin({ usernameOrEmail: username, password });
      setUser(response.user);
      localStorage.setItem('dameng_user', JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dameng_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.some(role => permissions[role.toLowerCase()]?.includes(permission));
  };

  const isAdmin = (): boolean => {
    return user?.roles?.includes('ADMIN') || false;
  };

  const isEditor = (): boolean => {
    return user?.roles?.some(role => ['ADMIN', 'EDITOR'].includes(role)) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isEditor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;