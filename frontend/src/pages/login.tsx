import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import Layout from '@theme/Layout';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import styles from './login.module.css';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage(): React.ReactElement {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const history = useHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      const success = await login(formData.username.trim(), formData.password);
      if (success) {
        // 登录成功后跳转到管理后台
        history.push('/admin');
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    }
  };

  return (
    <Layout title="登录" description="登录到达梦数据库文档中心">
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {/* 左侧品牌介绍 */}
          <div className={styles.brandSection}>
            <div className={styles.brandContent}>
              <div className={styles.logo}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect width="60" height="60" rx="12" fill="white" fillOpacity="0.2"/>
                  <circle cx="30" cy="20" r="8" fill="white"/>
                  <rect x="15" y="32" width="30" height="4" rx="2" fill="white"/>
                  <rect x="18" y="40" width="24" height="3" rx="1.5" fill="white" fillOpacity="0.8"/>
                  <rect x="21" y="46" width="18" height="2" rx="1" fill="white" fillOpacity="0.6"/>
                  <text x="30" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">DM</text>
                </svg>
              </div>
              <h1 className={styles.brandTitle}>欢迎来到 DM数据库</h1>
              <p className={styles.brandSubtitle}>达梦数据库管理系统</p>
              
              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>●</div>
                  <div>
                    <h3>高性能</h3>
                    <p>高效的数据处理能力，支持大规模并发</p>
                  </div>
                </div>
                
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>●</div>
                  <div>
                    <h3>高安全</h3>
                    <p>多层次安全防护，保障数据安全</p>
                  </div>
                </div>
                
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>●</div>
                  <div>
                    <h3>易维护</h3>
                    <p>简化运维管理，降低维护成本</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div className={styles.formSection}>
            <div className={styles.formContent}>
              <h2 className={styles.formTitle}>登录</h2>
              <p className={styles.formSubtitle}>请输入您的账号信息</p>
              
              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>用户名</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="请输入用户名"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>密码</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="请输入密码"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </button>
                </div>

                <div className={styles.formFooter}>
                  <a href="#" className={styles.link}>忘记密码？</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}