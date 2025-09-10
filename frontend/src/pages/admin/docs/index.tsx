import React, { useState } from 'react';
import styles from '../index.module.css';

interface DocItem {
  id: number;
  title: string;
  path: string;
  type: 'folder' | 'file';
  status: 'published' | 'draft' | 'archived';
  author: string;
  lastModified: string;
  size?: string;
  children?: DocItem[];
}

interface DocVersion {
  id: number;
  version: string;
  author: string;
  date: string;
  description: string;
}

const DocsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([1]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  // 模拟文档数据
  const [docs] = useState<DocItem[]>([
    {
      id: 1,
      title: '产品文档',
      path: '/docs/product',
      type: 'folder',
      status: 'published',
      author: 'admin',
      lastModified: '2024-01-15 10:30:00',
      children: [
        {
          id: 2,
          title: '快速开始.md',
          path: '/docs/product/quick-start.md',
          type: 'file',
          status: 'published',
          author: 'editor1',
          lastModified: '2024-01-14 16:45:00',
          size: '12.5 KB'
        },
        {
          id: 3,
          title: '安装指南.md',
          path: '/docs/product/installation.md',
          type: 'file',
          status: 'draft',
          author: 'editor2',
          lastModified: '2024-01-13 09:20:00',
          size: '8.3 KB'
        }
      ]
    },
    {
      id: 4,
      title: 'API文档',
      path: '/docs/api',
      type: 'folder',
      status: 'published',
      author: 'admin',
      lastModified: '2024-01-12 14:15:00',
      children: [
        {
          id: 5,
          title: '用户接口.md',
          path: '/docs/api/user-api.md',
          type: 'file',
          status: 'published',
          author: 'editor1',
          lastModified: '2024-01-11 11:30:00',
          size: '15.7 KB'
        }
      ]
    },
    {
      id: 6,
      title: '更新日志.md',
      path: '/docs/changelog.md',
      type: 'file',
      status: 'published',
      author: 'admin',
      lastModified: '2024-01-10 08:45:00',
      size: '6.2 KB'
    }
  ]);

  // 模拟版本历史数据
  const [versions] = useState<DocVersion[]>([
    {
      id: 1,
      version: 'v2.1.0',
      author: 'admin',
      date: '2024-01-15 10:30:00',
      description: '更新API文档，添加新的用户管理接口'
    },
    {
      id: 2,
      version: 'v2.0.5',
      author: 'editor1',
      date: '2024-01-10 14:20:00',
      description: '修复快速开始文档中的代码示例错误'
    },
    {
      id: 3,
      version: 'v2.0.0',
      author: 'admin',
      date: '2024-01-05 09:15:00',
      description: '重构文档结构，优化用户体验'
    }
  ]);

  const renderIcon = (iconName: string, color = '#666', className = '') => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'list': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
      ),
      'tree': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7z" />
        </svg>
      ),
      'folder': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
      ),
      'file': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      'upload': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      'download': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
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
      'plus': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
      'chevron-right': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      ),
      'chevron-down': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M7.41 8.84L12 13.42l4.59-4.58L18 10.25l-6 6-6-6z" />
        </svg>
      ),
      'history': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
        </svg>
      )
    };
    return iconMap[iconName] || null;
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleSelectDoc = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const getAllDocs = (items: DocItem[]): DocItem[] => {
    const result: DocItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        result.push(...getAllDocs(item.children));
      }
    });
    return result;
  };

  const renderTreeItem = (item: DocItem, level = 0) => {
    const isExpanded = expandedFolders.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id}>
        <div 
          className={styles.treeItem}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.id)}
        >
          <div className={styles.treeItemContent}>
            {item.type === 'folder' && (
              <span className={styles.treeToggle}>
                {hasChildren && renderIcon(isExpanded ? 'chevron-down' : 'chevron-right', '#666')}
              </span>
            )}
            <span className={styles.treeIcon}>
              {renderIcon(item.type, item.type === 'folder' ? '#f59e0b' : '#6b7280')}
            </span>
            <span className={styles.treeLabel}>{item.title}</span>
            <span className={`${styles.statusBadge} ${styles[item.status]}`}>
              {item.status === 'published' ? '已发布' : item.status === 'draft' ? '草稿' : '已归档'}
            </span>
          </div>
          <div className={styles.treeActions}>
            <button className={styles.iconButton} title="编辑">
              {renderIcon('edit', '#666')}
            </button>
            <button className={styles.iconButton} title="删除">
              {renderIcon('delete', '#f56565')}
            </button>
          </div>
        </div>
        {item.type === 'folder' && hasChildren && isExpanded && (
          <div>
            {item.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDocsList = () => {
    const allDocs = getAllDocs(docs).filter(doc => doc.type === 'file');
    
    return (
      <div className={styles.contentCard}>
        <div className={styles.contentCardHeader}>
          <h3 className={styles.contentCardTitle}>文档列表</h3>
          <div className={styles.headerActions}>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                {renderIcon('list', viewMode === 'list' ? '#3b82f6' : '#666')}
                <span>列表</span>
              </button>
              <button 
                className={`${styles.toggleButton} ${viewMode === 'tree' ? styles.active : ''}`}
                onClick={() => setViewMode('tree')}
              >
                {renderIcon('tree', viewMode === 'tree' ? '#3b82f6' : '#666')}
                <span>树形</span>
              </button>
            </div>
            <button className={styles.primaryButton}>
              {renderIcon('plus', '#fff')}
              <span>新建文档</span>
            </button>
            <button className={styles.secondaryButton}>
              {renderIcon('upload', '#666')}
              <span>导入</span>
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>文档名称</th>
                  <th>路径</th>
                  <th>状态</th>
                  <th>作者</th>
                  <th>大小</th>
                  <th>最后修改</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {allDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.docName}>
                        {renderIcon('file', '#6b7280')}
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className={styles.docPath}>{doc.path}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[doc.status]}`}>
                        {doc.status === 'published' ? '已发布' : doc.status === 'draft' ? '草稿' : '已归档'}
                      </span>
                    </td>
                    <td>{doc.author}</td>
                    <td>{doc.size}</td>
                    <td>{doc.lastModified}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.iconButton} title="编辑">
                          {renderIcon('edit', '#666')}
                        </button>
                        <button className={styles.iconButton} title="下载">
                          {renderIcon('download', '#666')}
                        </button>
                        <button className={styles.iconButton} title="删除">
                          {renderIcon('delete', '#f56565')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.treeContainer}>
            {docs.map(item => renderTreeItem(item))}
          </div>
        )}
      </div>
    );
  };

  const renderVersionHistory = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>版本历史</h3>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton}>
            {renderIcon('plus', '#fff')}
            <span>创建版本</span>
          </button>
        </div>
      </div>
      
      <div className={styles.versionList}>
        {versions.map(version => (
          <div key={version.id} className={styles.versionItem}>
            <div className={styles.versionHeader}>
              <div className={styles.versionInfo}>
                <span className={styles.versionNumber}>{version.version}</span>
                <span className={styles.versionAuthor}>by {version.author}</span>
                <span className={styles.versionDate}>{version.date}</span>
              </div>
              <div className={styles.versionActions}>
                <button className={styles.secondaryButton}>查看</button>
                <button className={styles.secondaryButton}>恢复</button>
                <button className={styles.dangerButton}>删除</button>
              </div>
            </div>
            <p className={styles.versionDescription}>{version.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImportExport = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>导入导出</h3>
      </div>
      
      <div className={styles.importExportContainer}>
        <div className={styles.importSection}>
          <h4>文档导入</h4>
          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>
              {renderIcon('upload', '#9ca3af')}
            </div>
            <p>拖拽文件到此处或点击选择文件</p>
            <p className={styles.uploadHint}>支持 .md, .docx, .pdf 格式</p>
            <button className={styles.primaryButton}>选择文件</button>
          </div>
        </div>
        
        <div className={styles.exportSection}>
          <h4>文档导出</h4>
          <div className={styles.exportOptions}>
            <div className={styles.exportOption}>
              <span>导出格式：</span>
              <select className={styles.selectInput}>
                <option value="markdown">Markdown (.md)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="html">HTML (.html)</option>
              </select>
            </div>
            <div className={styles.exportOption}>
              <span>导出范围：</span>
              <select className={styles.selectInput}>
                <option value="all">全部文档</option>
                <option value="selected">选中文档</option>
                <option value="folder">指定目录</option>
              </select>
            </div>
            <button className={styles.primaryButton}>
              {renderIcon('download', '#fff')}
              <span>开始导出</span>
            </button>
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
            className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('list')}
          >
            {renderIcon('list', activeTab === 'list' ? '#3b82f6' : '#666')}
            <span>文档列表</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'versions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            {renderIcon('history', activeTab === 'versions' ? '#3b82f6' : '#666')}
            <span>版本历史</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'import-export' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('import-export')}
          >
            {renderIcon('upload', activeTab === 'import-export' ? '#3b82f6' : '#666')}
            <span>导入导出</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'list' && renderDocsList()}
      {activeTab === 'versions' && renderVersionHistory()}
      {activeTab === 'import-export' && renderImportExport()}
    </div>
  );
};

export default DocsManagement;