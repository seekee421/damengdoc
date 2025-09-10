import React from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import AnalyticsDashboard from '../../components/Analytics/AnalyticsDashboard';
import styles from './analytics.module.css';

const AnalyticsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // 检查用户权限
  if (!isAuthenticated || !user?.roles.includes('ADMIN')) {
    return (
      <Layout title="访问被拒绝">
        <div className={styles.accessDenied}>
          <div className={styles.accessDeniedContent}>
            <h1>访问被拒绝</h1>
            <p>您没有权限访问此页面。只有管理员可以查看访问统计。</p>
            <a href="/" className={styles.backButton}>
              返回首页
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="访问统计">
      <div className={styles.container}>
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default AnalyticsPage;