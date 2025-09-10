import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProvider, useAdmin, navigateToPage, pageConfigs } from '../../contexts/AdminContext';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import styles from './index.module.css';
import UsersManagement from './users';
import DocsManagement from './docs/index';
import SystemSettings from './settings';
import DataStatistics from './stats';

// 侧边栏菜单数据
const sidebarMenus = [
  {
    id: 'dashboard',
    title: '仪表盘',
    icon: 'home',
    path: '/admin',
    active: true
  },
  {
    id: 'users',
    title: '用户管理',
    icon: 'user-group',
    path: '/admin/users',
    children: [
      { id: 'user-list', title: '用户列表', path: '/admin/users/list' },
      { id: 'user-roles', title: '角色管理', path: '/admin/users/roles' },
      { id: 'user-permissions', title: '权限管理', path: '/admin/users/permissions' }
    ]
  },
  {
    id: 'docs',
    title: '文档管理',
    icon: 'document-text',
    path: '/admin/docs',
    children: [
      { id: 'doc-list', title: '文档列表', path: '/admin/docs/list' },
      { id: 'doc-categories', title: '分类管理', path: '/admin/docs/categories' },
      { id: 'doc-tags', title: '标签管理', path: '/admin/docs/tags' }
    ]
  },
  {
    id: 'analytics',
    title: '数据统计',
    icon: 'chart-bar',
    path: '/admin/analytics',
    children: [
      { id: 'analytics-overview', title: '数据概览', path: '/admin/analytics/overview' },
      { id: 'analytics-users', title: '用户统计', path: '/admin/analytics/users' },
      { id: 'analytics-content', title: '内容统计', path: '/admin/analytics/content' }
    ]
  },
  {
    id: 'settings',
    title: '系统设置',
    icon: 'cog',
    path: '/admin/settings',
    children: [
      { id: 'settings-general', title: '基础设置', path: '/admin/settings/general' },
      { id: 'settings-security', title: '安全设置', path: '/admin/settings/security' },
      { id: 'settings-backup', title: '备份设置', path: '/admin/settings/backup' }
    ]
  }
];

// 仪表盘统计卡片数据
const statsCards = [
  {
    id: 'total-users',
    title: '总用户数',
    value: '1,234',
    change: '+12%',
    changeType: 'increase',
    icon: 'user-group',
    color: 'var(--dm-primary-6)'
  },
  {
    id: 'total-docs',
    title: '文档数量',
    value: '89',
    change: '+5%',
    changeType: 'increase',
    icon: 'document-text',
    color: '#52c41a'
  },
  {
    id: 'daily-visits',
    title: '今日访问',
    value: '2,456',
    change: '+18%',
    changeType: 'increase',
    icon: 'trending-up',
    color: '#722ed1'
  },
  {
    id: 'active-sessions',
    title: '活跃会话',
    value: '156',
    change: '-3%',
    changeType: 'decrease',
    icon: 'chart-bar',
    color: '#fa8c16'
  }
];

// 最近活动数据
const recentActivities = [
  {
    id: 1,
    type: 'user',
    icon: 'user-plus',
    text: '新用户 "张三" 注册成功',
    time: '2 分钟前',
    color: 'var(--dm-primary-6)'
  },
  {
    id: 2,
    type: 'doc',
    icon: 'document-text',
    text: '文档 "API 接口说明" 已更新',
    time: '15 分钟前',
    color: '#52c41a'
  },
  {
    id: 3,
    type: 'system',
    icon: 'cog',
    text: '系统配置已修改',
    time: '1 小时前',
    color: '#fa8c16'
  },
  {
    id: 4,
    type: 'analytics',
    icon: 'trending-up',
    text: '生成了本月数据报告',
    time: '2 小时前',
    color: '#722ed1'
  }
];

const AdminDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { state, setCurrentPage, setActiveMenuItem, toggleSidebar, setBreadcrumb } = useAdmin();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users']);
  const [selectedMenuItem, setSelectedMenuItem] = useState(state.activeMenuItem);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 处理菜单点击
  const handleMenuClick = (menuId: string) => {
    navigateToPage(menuId, setCurrentPage, setActiveMenuItem, setBreadcrumb);
    setSelectedMenuItem(menuId);
  };

  // 根据URL路径设置当前页面
  useEffect(() => {
    const pathname = location.pathname;
    let currentPage = 'dashboard';
    
    if (pathname.startsWith('/admin/docs')) {
      currentPage = 'docs';
    } else if (pathname.startsWith('/admin/users')) {
      currentPage = 'users';
    } else if (pathname.startsWith('/admin/analytics')) {
      currentPage = 'analytics';
    } else if (pathname.startsWith('/admin/settings')) {
      currentPage = 'settings';
    }
    
    navigateToPage(currentPage, setCurrentPage, setActiveMenuItem, setBreadcrumb);
  }, [location.pathname, setCurrentPage, setActiveMenuItem, setBreadcrumb]);

  // 同步状态
  useEffect(() => {
    setSelectedMenuItem(state.activeMenuItem);
  }, [state.activeMenuItem]);



  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderIcon = (iconName: string, color?: string, className?: string) => {
    const iconMap: { [key: string]: string } = {
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'user-group': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'chart-bar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'cog': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'user-plus': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'menu': 'M4 6h16M4 12h16M4 18h16',
      'x': 'M6 18L18 6M6 6l12 12',
      'chevron-right': 'M9 5l7 7-7 7',
      'bell': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'logout': 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    };
    
    return (
      <svg 
        className={className || styles.icon} 
        fill="none" 
        stroke={color || 'currentColor'} 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconMap[iconName]} />
      </svg>
    );
  };

  // 侧边栏组件
  const Sidebar = () => (
    <>
      {/* 移动端遮罩层 */}
      {mobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div className={`${styles.sidebar} ${state.sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
      {/* 侧边栏头部 */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            {renderIcon('document-text', 'var(--dm-primary-6)', styles.logoIconSvg)}
          </div>
          {!state.sidebarCollapsed && <span className={styles.logoText}>达梦文档中心</span>}
        </div>
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {renderIcon(state.sidebarCollapsed ? 'menu' : 'x', '#666', styles.toggleIcon)}
        </button>
      </div>

      {/* 侧边栏菜单 */}
      <nav className={styles.sidebarNav}>
        {sidebarMenus.map((menu) => (
          <div key={menu.id} className={styles.menuGroup}>
            <div 
              className={`${styles.menuItem} ${selectedMenuItem === menu.id ? styles.menuItemActive : ''}`}
              onClick={() => {
                if (menu.children) {
                  toggleMenu(menu.id);
                } else {
                  handleMenuClick(menu.id);
                }
              }}
            >
              <div className={styles.menuItemContent}>
                <div className={styles.menuIcon}>
                  {renderIcon(menu.icon, menu.active ? 'var(--dm-primary-6)' : '#666', styles.menuIconSvg)}
                </div>
                {!state.sidebarCollapsed && (
                  <>
                    <span className={styles.menuTitle}>{menu.title}</span>
                    {menu.children && (
                      <div className={`${styles.menuArrow} ${expandedMenus.includes(menu.id) ? styles.menuArrowExpanded : ''}`}>
                        {renderIcon('chevron-right', '#666', styles.menuArrowIcon)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* 子菜单 */}
            {menu.children && !state.sidebarCollapsed && expandedMenus.includes(menu.id) && (
              <div className={styles.submenuList}>
                {menu.children.map((submenu) => (
                  <div 
                    key={submenu.id} 
                    className={`${styles.submenuItem} ${selectedMenuItem === submenu.id ? styles.submenuItemActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(submenu.id);
                    }}
                  >
                    <span className={styles.submenuTitle}>{submenu.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 侧边栏底部 */}
      {!state.sidebarCollapsed && (
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.username?.charAt(0).toUpperCase()}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.username}</div>
              <div className={styles.userRole}>管理员</div>
            </div>
          </div>
          <button className={styles.logoutButton}>
            {renderIcon('logout', '#666', styles.logoutIcon)}
          </button>
        </div>
      )}
    </div>
    </>
  );

  // 顶部导航栏组件
  const TopBar = () => (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {renderIcon('menu', '#666', styles.mobileMenuIcon)}
        </button>
        <h1 className={styles.pageTitle}>仪表盘</h1>
        <div className={styles.breadcrumb}>
          <span>管理后台</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span>仪表盘</span>
        </div>
      </div>
      <div className={styles.topBarRight}>
        <button className={styles.topBarButton}>
          {renderIcon('search', '#666', styles.topBarIcon)}
        </button>
        <button className={styles.topBarButton}>
          {renderIcon('bell', '#666', styles.topBarIcon)}
          <span className={styles.notificationBadge}>3</span>
        </button>
      </div>
    </div>
  );

  // 渲染内容区域
  const renderContent = () => {
    switch (state.currentPage) {
      case 'users':
      case 'user-list':
      case 'user-roles':
      case 'user-permissions':
        return (
          <div className={styles.mainContent}>
            <UsersManagement />
          </div>
        );
      case 'docs':
      case 'doc-list':
      case 'doc-categories':
      case 'doc-tags':
        return (
          <div className={styles.mainContent}>
            <DocsManagement />
          </div>
        );
      case 'analytics':
      case 'analytics-overview':
      case 'analytics-users':
      case 'analytics-content':
        return (
          <div className={styles.mainContent}>
            <DataStatistics />
          </div>
        );
      case 'settings':
      case 'settings-general':
      case 'settings-security':
      case 'settings-backup':
        return (
          <div className={styles.mainContent}>
            <SystemSettings />
          </div>
        );
      default:
        return (
          <div className={styles.mainContent}>
            {/* 统计卡片 */}
            <div className={styles.statsGrid}>
              {statsCards.map((card) => (
                <div key={card.id} className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <div className={styles.statsCardTitle}>{card.title}</div>
                    <div className={styles.statsCardIcon} style={{ color: card.color }}>
                      {renderIcon(card.icon, card.color, styles.statsIcon)}
                    </div>
                  </div>
                  <div className={styles.statsCardValue}>{card.value}</div>
                  <div className={`${styles.statsCardChange} ${styles[`statsCard${card.changeType === 'increase' ? 'Increase' : 'Decrease'}`]}`}>
                    {card.change} 较上月
                  </div>
                </div>
              ))}
            </div>

            {/* 内容区域 */}
            <div className={styles.contentGrid}>
              {/* 最近活动 */}
              <div className={styles.contentCard}>
                <div className={styles.contentCardHeader}>
                  <h3 className={styles.contentCardTitle}>最近活动</h3>
                  <a href="/admin/logs" className={styles.viewAllLink}>查看全部</a>
                </div>
                <div className={styles.activityList}>
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon} style={{ color: activity.color }}>
                        {renderIcon(activity.icon, activity.color, styles.activityIconSvg)}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityText}>{activity.text}</div>
                        <div className={styles.activityTime}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 快捷操作 */}
              <div className={styles.contentCard}>
                <div className={styles.contentCardHeader}>
                  <h3 className={styles.contentCardTitle}>快捷操作</h3>
                </div>
                <div className={styles.quickActionsList}>
                  <button className={styles.quickActionButton}>
                    {renderIcon('user-plus', '#666', styles.quickActionIcon)}
                    <span>添加用户</span>
                  </button>
                  <button className={styles.quickActionButton}>
                    {renderIcon('document-text', '#666', styles.quickActionIcon)}
                    <span>新建文档</span>
                  </button>
                  <button className={styles.quickActionButton}>
                    {renderIcon('chart-bar', '#666', styles.quickActionIcon)}
                    <span>查看报告</span>
                  </button>
                  <button className={styles.quickActionButton}>
                    {renderIcon('cog', '#666', styles.quickActionIcon)}
                    <span>系统设置</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主要内容区域 */}
      <div className={`${styles.mainLayout} ${state.sidebarCollapsed ? styles.mainLayoutExpanded : ''}`}>
        {/* 顶部导航栏 */}
        <TopBar />
        
        {/* 主内容 */}
        {renderContent()}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminProvider>
        <AdminDashboardContent />
      </AdminProvider>
    </ProtectedRoute>
  );
};

export default AdminDashboard;