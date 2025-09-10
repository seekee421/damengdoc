import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireEditor?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireEditor = false,
  fallback
}) => {
  const { isAuthenticated, isAdmin, isEditor, user } = useAuth();

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 检查是否已登录
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>需要登录</h2>
        <p>请登录后访问此页面</p>
        <LoginForm />
      </div>
    );
  }

  // 检查管理员权限
  if (requireAdmin && !isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <h2>🚫 访问被拒绝</h2>
        <p>您需要管理员权限才能访问此页面</p>
        <p>当前用户：<strong>{user?.username}</strong></p>
        <p>当前权限：<strong>{user?.role === 'admin' ? '管理员' : user?.role === 'editor' ? '编辑员' : '查看者'}</strong></p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回上一页
        </button>
      </div>
    );
  }

  // 检查编辑员权限（编辑员或管理员都可以）
  if (requireEditor && !isEditor() && !isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <h2>🚫 访问被拒绝</h2>
        <p>您需要编辑员或管理员权限才能访问此页面</p>
        <p>当前用户：<strong>{user?.username}</strong></p>
        <p>当前权限：<strong>{user?.role === 'admin' ? '管理员' : user?.role === 'editor' ? '编辑员' : '查看者'}</strong></p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回上一页
        </button>
      </div>
    );
  }

  // 权限检查通过，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;