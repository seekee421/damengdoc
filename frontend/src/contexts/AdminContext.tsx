import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 管理后台状态接口
interface AdminState {
  currentPage: string;
  activeMenuItem: string;
  sidebarCollapsed: boolean;
  breadcrumb: BreadcrumbItem[];
}

// 面包屑项接口
interface BreadcrumbItem {
  id: string;
  title: string;
  path: string;
}

// 管理后台上下文接口
interface AdminContextType {
  state: AdminState;
  setCurrentPage: (page: string) => void;
  setActiveMenuItem: (menuId: string) => void;
  toggleSidebar: () => void;
  setBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void;
  updatePageState: (updates: Partial<AdminState>) => void;
}

// 创建上下文
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 初始状态
const initialState: AdminState = {
  currentPage: 'dashboard',
  activeMenuItem: 'dashboard',
  sidebarCollapsed: false,
  breadcrumb: [
    { id: 'admin', title: '管理后台', path: '/admin' },
    { id: 'dashboard', title: '仪表盘', path: '/admin' }
  ]
};

// Provider组件属性
interface AdminProviderProps {
  children: ReactNode;
}

// Provider组件
export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, setState] = useState<AdminState>(initialState);

  // 设置当前页面
  const setCurrentPage = useCallback((page: string) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  // 设置活跃菜单项
  const setActiveMenuItem = useCallback((menuId: string) => {
    setState(prev => ({ ...prev, activeMenuItem: menuId }));
  }, []);

  // 切换侧边栏折叠状态
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  // 设置面包屑
  const setBreadcrumb = useCallback((breadcrumb: BreadcrumbItem[]) => {
    setState(prev => ({ ...prev, breadcrumb }));
  }, []);

  // 更新页面状态
  const updatePageState = useCallback((updates: Partial<AdminState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const contextValue: AdminContextType = {
    state,
    setCurrentPage,
    setActiveMenuItem,
    toggleSidebar,
    setBreadcrumb,
    updatePageState
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook for using admin context
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// 页面配置映射
export const pageConfigs = {
  dashboard: {
    title: '仪表盘',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'dashboard', title: '仪表盘', path: '/admin' }
    ]
  },
  users: {
    title: '用户管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'users', title: '用户管理', path: '/admin/users' }
    ]
  },
  'user-list': {
    title: '用户列表',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'users', title: '用户管理', path: '/admin/users' },
      { id: 'user-list', title: '用户列表', path: '/admin/users/list' }
    ]
  },
  'user-roles': {
    title: '角色管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'users', title: '用户管理', path: '/admin/users' },
      { id: 'user-roles', title: '角色管理', path: '/admin/users/roles' }
    ]
  },
  'user-permissions': {
    title: '权限管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'users', title: '用户管理', path: '/admin/users' },
      { id: 'user-permissions', title: '权限管理', path: '/admin/users/permissions' }
    ]
  },
  docs: {
    title: '文档管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'docs', title: '文档管理', path: '/admin/docs' }
    ]
  },
  'doc-list': {
    title: '文档列表',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'docs', title: '文档管理', path: '/admin/docs' },
      { id: 'doc-list', title: '文档列表', path: '/admin/docs/list' }
    ]
  },
  'doc-categories': {
    title: '分类管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'docs', title: '文档管理', path: '/admin/docs' },
      { id: 'doc-categories', title: '分类管理', path: '/admin/docs/categories' }
    ]
  },
  'doc-tags': {
    title: '标签管理',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'docs', title: '文档管理', path: '/admin/docs' },
      { id: 'doc-tags', title: '标签管理', path: '/admin/docs/tags' }
    ]
  },
  analytics: {
    title: '数据统计',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'analytics', title: '数据统计', path: '/admin/analytics' }
    ]
  },
  'analytics-overview': {
    title: '数据概览',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'analytics', title: '数据统计', path: '/admin/analytics' },
      { id: 'analytics-overview', title: '数据概览', path: '/admin/analytics/overview' }
    ]
  },
  'analytics-users': {
    title: '用户统计',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'analytics', title: '数据统计', path: '/admin/analytics' },
      { id: 'analytics-users', title: '用户统计', path: '/admin/analytics/users' }
    ]
  },
  'analytics-content': {
    title: '内容统计',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'analytics', title: '数据统计', path: '/admin/analytics' },
      { id: 'analytics-content', title: '内容统计', path: '/admin/analytics/content' }
    ]
  },
  settings: {
    title: '系统设置',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'settings', title: '系统设置', path: '/admin/settings' }
    ]
  },
  'settings-general': {
    title: '基础设置',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'settings', title: '系统设置', path: '/admin/settings' },
      { id: 'settings-general', title: '基础设置', path: '/admin/settings/general' }
    ]
  },
  'settings-security': {
    title: '安全设置',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'settings', title: '系统设置', path: '/admin/settings' },
      { id: 'settings-security', title: '安全设置', path: '/admin/settings/security' }
    ]
  },
  'settings-backup': {
    title: '备份设置',
    breadcrumb: [
      { id: 'admin', title: '管理后台', path: '/admin' },
      { id: 'settings', title: '系统设置', path: '/admin/settings' },
      { id: 'settings-backup', title: '备份设置', path: '/admin/settings/backup' }
    ]
  }
};

// 导航辅助函数
export const navigateToPage = (
  page: string,
  setCurrentPage: (page: string) => void,
  setActiveMenuItem: (menuId: string) => void,
  setBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void
) => {
  const config = pageConfigs[page as keyof typeof pageConfigs];
  if (config) {
    setCurrentPage(page);
    setActiveMenuItem(page);
    setBreadcrumb(config.breadcrumb);
    console.log('Navigating to page:', page, 'Config:', config);
  } else {
    console.warn('No config found for page:', page);
  }
};