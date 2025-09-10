import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      const success = await login(username.trim(), password);
      if (success) {
        onSuccess?.();
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.header}>
          <h2>欢迎来到 达梦数据库</h2>
          <p>国产数据库领军品牌，安全可信的数据库管理系统</p>
          <div className={styles.features}>
            <div className={styles.feature}>• 高安全性，符合国家安全标准</div>
            <div className={styles.feature}>• 高性能，支持海量数据处理</div>
            <div className={styles.feature}>• 高可用，7x24小时稳定运行</div>
            <div className={styles.feature}>• 易管理，图形化管理界面</div>
            <div className={styles.feature}>• 兼容性强，支持多种应用场景</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">密码</label>
            <div className={styles.passwordInput}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
            {onCancel && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
                disabled={isLoading}
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;