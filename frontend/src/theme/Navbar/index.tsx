import React, { useState, useRef, useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { useHistory } from '@docusaurus/router';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from '../../components/Auth/UserInfo';
import VersionSelector from '../../components/VersionSelector/VersionSelector';
import styles from './navbar.module.css';

// 导航栏内容组件
const NavbarContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLoginClick = () => {
    // 跳转到独立登录页面
    history.push('/login');
  };



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // 导航到搜索页面
      history.push(`/search?q=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
      searchInputRef.current?.blur();
    }
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className={styles.navbarWrapper}>
        {/* 左侧导航区域 */}
        <div className={styles.navbarLeft}>
          <OriginalNavbar />
        </div>
        
        {/* 右侧功能区域 */}
        <div className={styles.navbarExtras}>
          {/* 版本选择器 */}
          <div className={styles.versionSection}>
            <VersionSelector 
              position="navbar"
              className={styles.versionSelector}
            />
          </div>

          {/* 搜索区域 */}
          <form onSubmit={handleSearchSubmit} className={`${styles.searchSection} ${isSearchFocused ? styles.searchFocused : ''}`}>
            <svg 
              className={styles.searchIcon} 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="搜索文档... (⌘K)" 
              className={styles.globalSearch}
            />
            {searchValue && (
              <button 
                type="button" 
                onClick={() => setSearchValue('')}
                className={styles.clearButton}
                aria-label="清除搜索"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </form>

          {/* 用户认证区域 */}
          <div className={styles.authSection}>
            <UserInfo onLoginClick={handleLoginClick} />
          </div>
        </div>
      </div>

    </>
  );
};

// 主导航栏组件
const Navbar: React.FC = () => {
  return <NavbarContent />;
};

export default Navbar;