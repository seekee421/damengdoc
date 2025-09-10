import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import styles from './docs.module.css';

interface Document {
  id: string;
  title: string;
  path: string;
  category: 'dm7' | 'dm8' | 'general';
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  language: 'zh' | 'en';
  size: string;
}

const DocumentManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'DM8数据库安装指南',
      path: '/docs/dm8/installation',
      category: 'dm8',
      status: 'published',
      author: 'admin',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
      language: 'zh',
      size: '2.5 KB'
    },
    {
      id: '2',
      title: 'DM8 Database Installation Guide',
      path: '/docs/dm8/installation',
      category: 'dm8',
      status: 'published',
      author: 'editor1',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-11',
      language: 'en',
      size: '2.8 KB'
    },
    {
      id: '3',
      title: 'DM7升级到DM8指南',
      path: '/docs/dm7/upgrade',
      category: 'dm7',
      status: 'draft',
      author: 'editor1',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-12',
      language: 'zh',
      size: '1.8 KB'
    },
    {
      id: '4',
      title: 'API参考文档',
      path: '/docs/general/api',
      category: 'general',
      status: 'published',
      author: 'admin',
      createdAt: '2024-01-04',
      updatedAt: '2024-01-13',
      language: 'zh',
      size: '15.2 KB'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const [newDoc, setNewDoc] = useState({
    title: '',
    path: '',
    category: 'general' as Document['category'],
    language: 'zh' as Document['language']
  });

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'dm7': return 'DM7';
      case 'dm8': return 'DM8';
      case 'general': return '通用';
      default: return category;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'published': return '已发布';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const getLanguageDisplayName = (language: string) => {
    switch (language) {
      case 'zh': return '中文';
      case 'en': return 'English';
      default: return language;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'dm7': return styles.dm7Badge;
      case 'dm8': return styles.dm8Badge;
      case 'general': return styles.generalBadge;
      default: return styles.defaultBadge;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return styles.draftBadge;
      case 'published': return styles.publishedBadge;
      case 'archived': return styles.archivedBadge;
      default: return styles.defaultBadge;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || doc.language === languageFilter;
    
    // 非管理员只能看到自己创建的文档
    const canView = isAdmin() || doc.author === user?.username;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLanguage && canView;
  });

  const handleAddDocument = () => {
    if (!newDoc.title || !newDoc.path) {
      alert('请填写标题和路径');
      return;
    }

    const doc: Document = {
      id: Date.now().toString(),
      title: newDoc.title,
      path: newDoc.path,
      category: newDoc.category,
      language: newDoc.language,
      status: 'draft',
      author: user?.username || 'unknown',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      size: '0 KB'
    };

    setDocuments([...documents, doc]);
    setNewDoc({ title: '', path: '', category: 'general', language: 'zh' });
    setShowAddModal(false);
  };

  const handleEditDocument = (doc: Document) => {
    // 检查权限：管理员可以编辑所有文档，编辑员只能编辑自己的文档
    if (!isAdmin() && doc.author !== user?.username) {
      alert('您只能编辑自己创建的文档');
      return;
    }
    setEditingDoc({ ...doc });
  };

  const handleUpdateDocument = () => {
    if (!editingDoc) return;

    setDocuments(documents.map(doc => 
      doc.id === editingDoc.id 
        ? { ...editingDoc, updatedAt: new Date().toISOString().split('T')[0] }
        : doc
    ));
    setEditingDoc(null);
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // 检查权限
    if (!isAdmin() && doc.author !== user?.username) {
      alert('您只能删除自己创建的文档');
      return;
    }

    if (confirm('确定要删除这个文档吗？')) {
      setDocuments(documents.filter(doc => doc.id !== docId));
    }
  };

  const handleChangeStatus = (docId: string, newStatus: Document['status']) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // 检查权限
    if (!isAdmin() && doc.author !== user?.username) {
      alert('您只能修改自己创建的文档状态');
      return;
    }

    setDocuments(documents.map(doc => 
      doc.id === docId 
        ? { ...doc, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : doc
    ));
  };

  return (
    <Layout title="文档管理">
      <ProtectedRoute requireEditor={true}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>文档管理</h1>
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              + 新建文档
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="搜索文档标题、路径或作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">所有分类</option>
              <option value="dm7">DM7</option>
              <option value="dm8">DM8</option>
              <option value="general">通用</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">所有状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>

            <select 
              value={languageFilter} 
              onChange={(e) => setLanguageFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">所有语言</option>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{filteredDocuments.length}</span>
              <span className={styles.statLabel}>文档总数</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {filteredDocuments.filter(d => d.status === 'published').length}
              </span>
              <span className={styles.statLabel}>已发布</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {filteredDocuments.filter(d => d.status === 'draft').length}
              </span>
              <span className={styles.statLabel}>草稿</span>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>标题</th>
                  <th>路径</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>语言</th>
                  <th>作者</th>
                  <th>更新时间</th>
                  <th>大小</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id}>
                    <td className={styles.docTitle}>{doc.title}</td>
                    <td className={styles.docPath}>{doc.path}</td>
                    <td>
                      <span className={`${styles.badge} ${getCategoryBadgeClass(doc.category)}`}>
                        {getCategoryDisplayName(doc.category)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={doc.status}
                        onChange={(e) => handleChangeStatus(doc.id, e.target.value as Document['status'])}
                        className={`${styles.statusSelect} ${getStatusBadgeClass(doc.status)}`}
                        disabled={!isAdmin() && doc.author !== user?.username}
                      >
                        <option value="draft">草稿</option>
                        <option value="published">已发布</option>
                        <option value="archived">已归档</option>
                      </select>
                    </td>
                    <td>{getLanguageDisplayName(doc.language)}</td>
                    <td>{doc.author}</td>
                    <td>{doc.updatedAt}</td>
                    <td>{doc.size}</td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditDocument(doc)}
                        >
                          编辑
                        </button>
                        <button 
                          className={styles.viewButton}
                          onClick={() => window.open(doc.path, '_blank')}
                        >
                          查看
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={!isAdmin() && doc.author !== user?.username}
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

          {/* 添加文档模态框 */}
          {showAddModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2>新建文档</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>文档标题 *</label>
                    <input
                      type="text"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      placeholder="请输入文档标题"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>文档路径 *</label>
                    <input
                      type="text"
                      value={newDoc.path}
                      onChange={(e) => setNewDoc({...newDoc, path: e.target.value})}
                      placeholder="例如：/docs/dm8/installation"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>分类</label>
                    <select
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({...newDoc, category: e.target.value as Document['category']})}
                    >
                      <option value="general">通用</option>
                      <option value="dm7">DM7</option>
                      <option value="dm8">DM8</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>语言</label>
                    <select
                      value={newDoc.language}
                      onChange={(e) => setNewDoc({...newDoc, language: e.target.value as Document['language']})}
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
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
                    onClick={handleAddDocument}
                  >
                    创建
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 编辑文档模态框 */}
          {editingDoc && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2>编辑文档</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setEditingDoc(null)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>文档标题</label>
                    <input
                      type="text"
                      value={editingDoc.title}
                      onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>文档路径</label>
                    <input
                      type="text"
                      value={editingDoc.path}
                      onChange={(e) => setEditingDoc({...editingDoc, path: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>分类</label>
                    <select
                      value={editingDoc.category}
                      onChange={(e) => setEditingDoc({...editingDoc, category: e.target.value as Document['category']})}
                    >
                      <option value="general">通用</option>
                      <option value="dm7">DM7</option>
                      <option value="dm8">DM8</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>语言</label>
                    <select
                      value={editingDoc.language}
                      onChange={(e) => setEditingDoc({...editingDoc, language: e.target.value as Document['language']})}
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setEditingDoc(null)}
                  >
                    取消
                  </button>
                  <button 
                    className={styles.confirmButton}
                    onClick={handleUpdateDocument}
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

export default DocumentManagement;