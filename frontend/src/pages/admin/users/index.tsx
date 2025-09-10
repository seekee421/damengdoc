import React, { useState } from 'react';
import styles from '../index.module.css';

type IconName = 'users' | 'shield' | 'key' | 'plus' | 'edit' | 'delete' | 'check' | 'x';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const UsersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);

  // 模拟用户数据
  const [users] = useState<User[]>([
    {
      id: 1,
      username: 'admin',
      email: 'admin@dameng.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30:00',
      createdAt: '2024-01-01 09:00:00'
    },
    {
      id: 2,
      username: 'editor1',
      email: 'editor1@dameng.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2024-01-14 16:45:00',
      createdAt: '2024-01-05 14:20:00'
    },
    {
      id: 3,
      username: 'editor2',
      email: 'editor2@dameng.com',
      role: 'editor',
      status: 'inactive',
      lastLogin: '2024-01-10 11:15:00',
      createdAt: '2024-01-08 10:30:00'
    }
  ]);

  // 模拟角色数据
  const [roles] = useState<Role[]>([
    {
      id: 'admin',
      name: '管理员',
      description: '拥有系统所有权限，包括用户管理、文档管理、系统设置等',
      permissions: ['user.manage', 'doc.manage', 'doc.publish', 'doc.delete', 'system.config', 'data.view']
    },
    {
      id: 'editor',
      name: '编辑发布员',
      description: '拥有对应模块下的文档发布权限',
      permissions: ['doc.edit', 'doc.publish', 'doc.view']
    }
  ]);

  const renderIcon = (iconName: string, color = '#666', className = '') => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'users': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      'shield': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M12 1l3 3 3-3v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V1l3 3 3-3z" />
        </svg>
      ),
      'key': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm12.78-1.38C19.93 8.12 20 7.06 20 6c0-3.31-2.69-6-6-6S8 2.69 8 6c0 1.06.07 2.12.22 3.62l9.56-1z" />
        </svg>
      ),
      'plus': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
      'edit': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      ),
      'delete': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      ),
      'check': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
      'x': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      )
    };
    return iconMap[iconName] || null;
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  };

  const renderUsersList = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>用户列表</h3>
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowAddUser(true)}
          >
            {renderIcon('plus', '#fff')}
            <span>添加用户</span>
          </button>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {user.role === 'admin' ? '管理员' : '编辑发布员'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                    {user.status === 'active' ? '激活' : '禁用'}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>{user.createdAt}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.iconButton}
                      onClick={() => setShowEditUser(user)}
                      title="编辑"
                    >
                      {renderIcon('edit', '#666')}
                    </button>
                    <button 
                      className={styles.iconButton}
                      title="删除"
                    >
                      {renderIcon('delete', '#f56565')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRolesList = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>角色管理</h3>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton}>
            {renderIcon('plus', '#fff')}
            <span>添加角色</span>
          </button>
        </div>
      </div>
      
      <div className={styles.rolesGrid}>
        {roles.map(role => (
          <div key={role.id} className={styles.roleCard}>
            <div className={styles.roleCardHeader}>
              <div className={styles.roleIcon}>
                {renderIcon('shield', '#3b82f6')}
              </div>
              <h4 className={styles.roleTitle}>{role.name}</h4>
            </div>
            <p className={styles.roleDescription}>{role.description}</p>
            <div className={styles.permissionsList}>
              <h5>权限列表：</h5>
              <div className={styles.permissionTags}>
                {role.permissions.map(permission => (
                  <span key={permission} className={styles.permissionTag}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.roleActions}>
              <button className={styles.secondaryButton}>编辑</button>
              <button className={styles.dangerButton}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>权限管理</h3>
      </div>
      
      <div className={styles.permissionsContainer}>
        <div className={styles.permissionCategory}>
          <h4>用户管理权限</h4>
          <div className={styles.permissionItems}>
            <div className={styles.permissionItem}>
              <span>用户查看</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>用户创建</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>用户编辑</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>用户删除</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
        
        <div className={styles.permissionCategory}>
          <h4>文档管理权限</h4>
          <div className={styles.permissionItems}>
            <div className={styles.permissionItem}>
              <span>文档查看</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>文档编辑</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>文档发布</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>文档删除</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>
        
        <div className={styles.permissionCategory}>
          <h4>系统管理权限</h4>
          <div className={styles.permissionItems}>
            <div className={styles.permissionItem}>
              <span>系统配置</span>
              <input type="checkbox" />
            </div>
            <div className={styles.permissionItem}>
              <span>数据统计</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.permissionItem}>
              <span>备份恢复</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.mainContent}>
      {/* 标签页导航 */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            {renderIcon('users', activeTab === 'users' ? '#3b82f6' : '#666')}
            <span>用户列表</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'roles' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            {renderIcon('shield', activeTab === 'roles' ? '#3b82f6' : '#666')}
            <span>角色管理</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'permissions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            {renderIcon('key', activeTab === 'permissions' ? '#3b82f6' : '#666')}
            <span>权限管理</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'users' && renderUsersList()}
      {activeTab === 'roles' && renderRolesList()}
      {activeTab === 'permissions' && renderPermissions()}
    </div>
  );
};

export default UsersManagement;