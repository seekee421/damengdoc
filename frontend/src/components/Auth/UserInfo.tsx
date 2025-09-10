import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserOutlined, 
  SettingOutlined, 
  EditOutlined, 
  TeamOutlined, 
  ToolOutlined, 
  BarChartOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import styles from './UserInfo.module.css';

interface UserInfoProps {
  onLoginClick?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ onLoginClick }) => {
  const { user, isAuthenticated, logout, isAdmin, isEditor } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'editor':
        return '编辑员';
      case 'viewer':
        return '查看者';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.adminBadge;
      case 'editor':
        return styles.editorBadge;
      case 'viewer':
        return styles.viewerBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt}>
        <button 
          className={styles.loginButton}
          onClick={onLoginClick}
        >
          <span className={styles.loginIcon}><UserOutlined /></span>
          登录
        </button>
      </div>
    );
  }

  return (
    <div className={styles.userInfo} ref={dropdownRef}>
      <button 
        className={styles.userButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className={styles.avatar}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className={styles.userDetails}>
          <span className={styles.username}>{user?.username}</span>
          <span className={`${styles.roleBadge} ${getRoleBadgeClass(user?.role || '')}`}>
            {getRoleDisplayName(user?.role || '')}
          </span>
        </div>
        <span className={styles.dropdownIcon}>▼</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.userProfile}>
              <div className={styles.profileAvatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.username}</div>
                <div className={styles.profileEmail}>{user?.email}</div>
                <div className={`${styles.profileRole} ${getRoleBadgeClass(user?.role || '')}`}>
                  {getRoleDisplayName(user?.role || '')}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.dropdownDivider}></div>

          <div className={styles.dropdownMenu}>
            <a href="/profile" className={styles.menuItem}>
              <span className={styles.menuIcon}><UserOutlined /></span>
              个人资料
            </a>
            
            <a href="/settings" className={styles.menuItem}>
              <span className={styles.menuIcon}><SettingOutlined /></span>
              账户设置
            </a>

            {isEditor() && (
              <a href="/admin/docs" className={styles.menuItem}>
                <span className={styles.menuIcon}><EditOutlined /></span>
                文档管理
              </a>
            )}

            {isAdmin() && (
              <>
                <a href="/admin/users" className={styles.menuItem}>
                  <span className={styles.menuIcon}><TeamOutlined /></span>
                  用户管理
                </a>
                <a href="/admin/system" className={styles.menuItem}>
                  <span className={styles.menuIcon}><ToolOutlined /></span>
                  系统设置
                </a>
                <a href="/admin/analytics" className={styles.menuItem}>
                  <span className={styles.menuIcon}><BarChartOutlined /></span>
                  数据统计
                </a>
              </>
            )}
          </div>

          <div className={styles.dropdownDivider}></div>

          <div className={styles.dropdownFooter}>
            <button 
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <span className={styles.menuIcon}><LogoutOutlined /></span>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;