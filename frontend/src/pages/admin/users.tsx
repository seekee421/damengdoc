import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import styles from './users.module.css';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@dameng.com',
      role: 'admin',
      createdAt: '2024-01-01',
      lastLogin: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      username: 'editor1',
      email: 'editor1@dameng.com',
      role: 'editor',
      createdAt: '2024-01-02',
      lastLogin: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      username: 'viewer1',
      email: 'viewer1@dameng.com',
      role: 'viewer',
      createdAt: '2024-01-03',
      lastLogin: '2024-01-13',
      status: 'active'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'viewer' as User['role'],
    password: ''
  });

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'editor': return '编辑员';
      case 'viewer': return '查看者';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return styles.adminBadge;
      case 'editor': return styles.editorBadge;
      case 'viewer': return styles.viewerBadge;
      default: return styles.defaultBadge;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? styles.activeBadge : styles.inactiveBadge;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('请填写所有必填字段');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setUsers([...users, user]);
    setNewUser({ username: '', email: '', role: 'viewer', password: '' });
    setShowAddModal(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('不能删除当前登录用户');
      return;
    }

    if (confirm('确定要删除这个用户吗？')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('不能禁用当前登录用户');
      return;
    }

    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  return (
    <Layout title="用户管理">
      <ProtectedRoute requireAdmin={true}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>用户管理</h1>
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              + 添加用户
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">所有角色</option>
              <option value="admin">管理员</option>
              <option value="editor">编辑员</option>
              <option value="viewer">查看者</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">禁用</option>
            </select>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>最后登录</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className={styles.username}>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(user.status)}`}>
                        {user.status === 'active' ? '活跃' : '禁用'}
                      </span>
                    </td>
                    <td>{user.createdAt}</td>
                    <td>{user.lastLogin || '从未登录'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditUser(user)}
                        >
                          编辑
                        </button>
                        <button 
                          className={styles.toggleButton}
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.status === 'active' ? '禁用' : '启用'}
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 添加用户模态框 */}
          {showAddModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2>添加新用户</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>用户名 *</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="请输入用户名"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>邮箱 *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>密码 *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="请输入密码"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>角色</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                    >
                      <option value="viewer">查看者</option>
                      <option value="editor">编辑员</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    取消
                  </button>
                  <button 
                    className={styles.confirmButton}
                    onClick={handleAddUser}
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 编辑用户模态框 */}
          {editingUser && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2>编辑用户</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setEditingUser(null)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>用户名</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>邮箱</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>角色</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value as User['role']})}
                    >
                      <option value="viewer">查看者</option>
                      <option value="editor">编辑员</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setEditingUser(null)}
                  >
                    取消
                  </button>
                  <button 
                    className={styles.confirmButton}
                    onClick={handleUpdateUser}
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default UserManagement;