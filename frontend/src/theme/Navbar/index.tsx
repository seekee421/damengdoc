import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { useHistory } from '@docusaurus/router';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from '../../components/Auth/UserInfo';

import styles from './navbar.module.css';

// 导航栏内容组件
const NavbarContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  const handleLoginClick = () => {
    // 跳转到独立登录页面
    history.push('/login');
  };

  return (
    <div className={styles.authSection}>
      <UserInfo onLoginClick={handleLoginClick} />
    </div>
  );
};

// 主导航栏组件
const Navbar: React.FC = () => {
  return (
    <>
      {/* 使用原生Docusaurus导航栏，应用config配置 */}
      <OriginalNavbar />
    </>
  );
};

export default Navbar;