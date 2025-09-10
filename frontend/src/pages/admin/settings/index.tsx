import React, { useState } from 'react';
import styles from '../index.module.css';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  language: string;
  timezone: string;
  theme: string;
  enableRegistration: boolean;
  enableGuestAccess: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableTwoFactor: boolean;
  enableSSL: boolean;
  enableCORS: boolean;
  allowedOrigins: string[];
}

interface BackupConfig {
  autoBackup: boolean;
  backupInterval: string;
  backupRetention: number;
  backupLocation: string;
  includeFiles: boolean;
  includeDatabase: boolean;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 基本设置
  const [basicConfig, setBasicConfig] = useState<SystemConfig>({
    siteName: '达梦文档中心',
    siteDescription: '企业级在线文档管理平台',
    siteUrl: 'https://docs.dameng.com',
    adminEmail: 'admin@dameng.com',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    theme: 'light',
    enableRegistration: true,
    enableGuestAccess: false,
    maxFileSize: 50,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'md', 'txt', 'html']
  });

  // 安全设置
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableSSL: true,
    enableCORS: true,
    allowedOrigins: ['https://dameng.com', 'https://www.dameng.com']
  });

  // 备份设置
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    autoBackup: true,
    backupInterval: 'daily',
    backupRetention: 30,
    backupLocation: '/data/backups',
    includeFiles: true,
    includeDatabase: true
  });

  const renderIcon = (iconName: string, color = '#666', className = '') => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'settings': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
        </svg>
      ),
      'shield': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V18H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
        </svg>
      ),
      'backup': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H11V17H13V13H17L12,8L7,13Z" />
        </svg>
      ),
      'version': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
        </svg>
      ),
      'save': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
        </svg>
      ),
      'check': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
        </svg>
      ),
      'alert': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
      ),
      'folder': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
        </svg>
      )
    };
    return iconMap[iconName] || null;
  };

  const handleSave = async (configType: string) => {
    setSaving(true);
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: '设置保存成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试！' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const renderBasicSettings = () => (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>站点信息</h4>
        <div className={styles.settingsGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>站点名称</label>
            <input
              type="text"
              className={styles.formInput}
              value={basicConfig.siteName}
              onChange={(e) => setBasicConfig({...basicConfig, siteName: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>站点描述</label>
            <input
              type="text"
              className={styles.formInput}
              value={basicConfig.siteDescription}
              onChange={(e) => setBasicConfig({...basicConfig, siteDescription: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>站点URL</label>
            <input
              type="url"
              className={styles.formInput}
              value={basicConfig.siteUrl}
              onChange={(e) => setBasicConfig({...basicConfig, siteUrl: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>管理员邮箱</label>
            <input
              type="email"
              className={styles.formInput}
              value={basicConfig.adminEmail}
              onChange={(e) => setBasicConfig({...basicConfig, adminEmail: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>系统配置</h4>
        <div className={styles.settingsGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>默认语言</label>
            <select
              className={styles.formSelect}
              value={basicConfig.language}
              onChange={(e) => setBasicConfig({...basicConfig, language: e.target.value})}
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>时区</label>
            <select
              className={styles.formSelect}
              value={basicConfig.timezone}
              onChange={(e) => setBasicConfig({...basicConfig, timezone: e.target.value})}
            >
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>主题</label>
            <select
              className={styles.formSelect}
              value={basicConfig.theme}
              onChange={(e) => setBasicConfig({...basicConfig, theme: e.target.value})}
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>最大文件大小 (MB)</label>
            <input
              type="number"
              className={styles.formInput}
              value={basicConfig.maxFileSize}
              onChange={(e) => setBasicConfig({...basicConfig, maxFileSize: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>访问控制</h4>
        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>允许用户注册</span>
              <span className={styles.switchDescription}>新用户可以自行注册账号</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={basicConfig.enableRegistration}
                onChange={(e) => setBasicConfig({...basicConfig, enableRegistration: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>允许访客访问</span>
              <span className={styles.switchDescription}>未登录用户可以浏览公开文档</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={basicConfig.enableGuestAccess}
                onChange={(e) => setBasicConfig({...basicConfig, enableGuestAccess: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.settingsActions}>
        <button
          className={styles.primaryButton}
          onClick={() => handleSave('basic')}
          disabled={saving}
        >
          {saving ? '保存中...' : (
            <>
              {renderIcon('save', '#fff')}
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>密码策略</h4>
        <div className={styles.settingsGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>最小密码长度</label>
            <input
              type="number"
              className={styles.formInput}
              value={securityConfig.passwordMinLength}
              onChange={(e) => setSecurityConfig({...securityConfig, passwordMinLength: parseInt(e.target.value)})}
              min="6"
              max="32"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>会话超时 (分钟)</label>
            <input
              type="number"
              className={styles.formInput}
              value={securityConfig.sessionTimeout}
              onChange={(e) => setSecurityConfig({...securityConfig, sessionTimeout: parseInt(e.target.value)})}
              min="5"
              max="1440"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>最大登录尝试次数</label>
            <input
              type="number"
              className={styles.formInput}
              value={securityConfig.maxLoginAttempts}
              onChange={(e) => setSecurityConfig({...securityConfig, maxLoginAttempts: parseInt(e.target.value)})}
              min="3"
              max="10"
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>安全选项</h4>
        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>密码必须包含特殊字符</span>
              <span className={styles.switchDescription}>要求密码包含至少一个特殊字符</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={securityConfig.passwordRequireSpecial}
                onChange={(e) => setSecurityConfig({...securityConfig, passwordRequireSpecial: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>启用双因素认证</span>
              <span className={styles.switchDescription}>为管理员账户启用2FA验证</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={securityConfig.enableTwoFactor}
                onChange={(e) => setSecurityConfig({...securityConfig, enableTwoFactor: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>强制HTTPS</span>
              <span className={styles.switchDescription}>所有连接必须使用SSL加密</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={securityConfig.enableSSL}
                onChange={(e) => setSecurityConfig({...securityConfig, enableSSL: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>启用CORS</span>
              <span className={styles.switchDescription}>允许跨域资源共享</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={securityConfig.enableCORS}
                onChange={(e) => setSecurityConfig({...securityConfig, enableCORS: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.settingsActions}>
        <button
          className={styles.primaryButton}
          onClick={() => handleSave('security')}
          disabled={saving}
        >
          {saving ? '保存中...' : (
            <>
              {renderIcon('save', '#fff')}
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>自动备份</h4>
        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>启用自动备份</span>
              <span className={styles.switchDescription}>系统将按设定间隔自动备份数据</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={backupConfig.autoBackup}
                onChange={(e) => setBackupConfig({...backupConfig, autoBackup: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>
        
        {backupConfig.autoBackup && (
          <div className={styles.settingsGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>备份间隔</label>
              <select
                className={styles.formSelect}
                value={backupConfig.backupInterval}
                onChange={(e) => setBackupConfig({...backupConfig, backupInterval: e.target.value})}
              >
                <option value="hourly">每小时</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>保留天数</label>
              <input
                type="number"
                className={styles.formInput}
                value={backupConfig.backupRetention}
                onChange={(e) => setBackupConfig({...backupConfig, backupRetention: parseInt(e.target.value)})}
                min="1"
                max="365"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>备份位置</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={backupConfig.backupLocation}
                  onChange={(e) => setBackupConfig({...backupConfig, backupLocation: e.target.value})}
                />
                <button className={styles.secondaryButton}>
                  {renderIcon('folder', '#666')}
                  <span>选择</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>备份内容</h4>
        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>包含文件</span>
              <span className={styles.switchDescription}>备份上传的文档和附件</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={backupConfig.includeFiles}
                onChange={(e) => setBackupConfig({...backupConfig, includeFiles: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchLabel}>包含数据库</span>
              <span className={styles.switchDescription}>备份系统配置和用户数据</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={backupConfig.includeDatabase}
                onChange={(e) => setBackupConfig({...backupConfig, includeDatabase: e.target.checked})}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>手动操作</h4>
        <div className={styles.backupActions}>
          <button className={styles.primaryButton}>
            {renderIcon('backup', '#fff')}
            <span>立即备份</span>
          </button>
          <button className={styles.secondaryButton}>
            {renderIcon('folder', '#666')}
            <span>查看备份</span>
          </button>
          <button className={styles.secondaryButton}>
            {renderIcon('version', '#666')}
            <span>恢复备份</span>
          </button>
        </div>
      </div>

      <div className={styles.settingsActions}>
        <button
          className={styles.primaryButton}
          onClick={() => handleSave('backup')}
          disabled={saving}
        >
          {saving ? '保存中...' : (
            <>
              {renderIcon('save', '#fff')}
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderVersionControl = () => (
    <div className={styles.settingsSection}>
      <div className={styles.versionInfo}>
        <div className={styles.currentVersion}>
          <h4>当前版本</h4>
          <div className={styles.versionCard}>
            <div className={styles.versionNumber}>v2.1.0</div>
            <div className={styles.versionDate}>发布日期: 2024-01-15</div>
            <div className={styles.versionDescription}>
              新增数据统计功能，优化用户界面，修复已知问题
            </div>
          </div>
        </div>
        
        <div className={styles.updateCheck}>
          <h4>检查更新</h4>
          <div className={styles.updateStatus}>
            <div className={styles.statusIcon}>
              {renderIcon('check', '#10b981')}
            </div>
            <div className={styles.statusText}>
              <div>系统已是最新版本</div>
              <div className={styles.lastCheck}>最后检查: 2024-01-15 14:30</div>
            </div>
            <button className={styles.secondaryButton}>
              {renderIcon('version', '#666')}
              <span>检查更新</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h4 className={styles.settingsGroupTitle}>更新历史</h4>
        <div className={styles.versionHistory}>
          <div className={styles.versionHistoryItem}>
            <div className={styles.versionTag}>v2.1.0</div>
            <div className={styles.versionDetails}>
              <div className={styles.versionTitle}>功能增强版本</div>
              <div className={styles.versionChanges}>
                <ul>
                  <li>新增数据统计和可视化图表</li>
                  <li>优化文档管理界面</li>
                  <li>增强安全性配置</li>
                  <li>修复文件上传问题</li>
                </ul>
              </div>
              <div className={styles.versionMeta}>2024-01-15 • 当前版本</div>
            </div>
          </div>
          
          <div className={styles.versionHistoryItem}>
            <div className={styles.versionTag}>v2.0.5</div>
            <div className={styles.versionDetails}>
              <div className={styles.versionTitle}>稳定性修复</div>
              <div className={styles.versionChanges}>
                <ul>
                  <li>修复用户权限管理问题</li>
                  <li>优化数据库查询性能</li>
                  <li>改进错误处理机制</li>
                </ul>
              </div>
              <div className={styles.versionMeta}>2024-01-01</div>
            </div>
          </div>
          
          <div className={styles.versionHistoryItem}>
            <div className={styles.versionTag}>v2.0.0</div>
            <div className={styles.versionDetails}>
              <div className={styles.versionTitle}>重大版本更新</div>
              <div className={styles.versionChanges}>
                <ul>
                  <li>全新的用户界面设计</li>
                  <li>重构文档管理系统</li>
                  <li>新增多语言支持</li>
                  <li>增强移动端适配</li>
                </ul>
              </div>
              <div className={styles.versionMeta}>2023-12-15</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.mainContent}>
      {/* 消息提示 */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {renderIcon(message.type === 'success' ? 'check' : 'alert', 
            message.type === 'success' ? '#10b981' : '#ef4444')}
          <span>{message.text}</span>
        </div>
      )}

      {/* 标签页导航 */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'basic' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            {renderIcon('settings', activeTab === 'basic' ? '#3b82f6' : '#666')}
            <span>基本设置</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'security' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            {renderIcon('shield', activeTab === 'security' ? '#3b82f6' : '#666')}
            <span>安全设置</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'backup' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            {renderIcon('backup', activeTab === 'backup' ? '#3b82f6' : '#666')}
            <span>备份恢复</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'version' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('version')}
          >
            {renderIcon('version', activeTab === 'version' ? '#3b82f6' : '#666')}
            <span>版本控制</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={styles.contentCard}>
        {activeTab === 'basic' && renderBasicSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'backup' && renderBackupSettings()}
        {activeTab === 'version' && renderVersionControl()}
      </div>
    </div>
  );
};

export default SystemSettings;