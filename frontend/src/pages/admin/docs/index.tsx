import React, { useState, useMemo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './index.module.css';

// 拖拽项目类型
const ItemTypes = {
  DOC_ITEM: 'doc_item'
};

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
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1, 4])); // 默认展开根目录文件夹
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<DocItem[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    author: 'all',
    fileType: 'all',
    dateRange: 'all'
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // 模拟文档数据
  const [docs, setDocs] = useState<DocItem[]>([
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
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleSelectDoc = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    const allFileIds = getAllDocs(filteredDocs)
      .filter(doc => doc.type === 'file')
      .map(doc => doc.id);
    
    if (selectedDocs.length === allFileIds.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(allFileIds);
    }
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

  const filteredDocs = useMemo(() => {
    const filterItems = (items: DocItem[]): DocItem[] => {
      return items.filter(item => {
        // 文本搜索匹配
        const matchesSearch = !searchTerm || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 状态过滤
        const matchesStatus = filters.status === 'all' || item.status === filters.status;
        
        // 作者过滤
        const matchesAuthor = filters.author === 'all' || item.author === filters.author;
        
        // 文件类型过滤
        const matchesFileType = filters.fileType === 'all' || 
          (filters.fileType === 'folder' && item.type === 'folder') ||
          (filters.fileType === 'markdown' && item.type === 'file' && item.path.endsWith('.md')) ||
          (filters.fileType === 'other' && item.type === 'file' && !item.path.endsWith('.md'));
        
        // 日期范围过滤
        const matchesDateRange = filters.dateRange === 'all' || checkDateRange(item.lastModified, filters.dateRange);
        
        // 对于文件夹，检查是否有匹配的子项
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          const hasMatchingChildren = filteredChildren.length > 0;
          return (matchesSearch && matchesStatus && matchesAuthor && matchesFileType && matchesDateRange) || hasMatchingChildren;
        }
        
        return matchesSearch && matchesStatus && matchesAuthor && matchesFileType && matchesDateRange;
      }).map(item => {
        if (item.children) {
          return {
            ...item,
            children: filterItems(item.children)
          };
        }
        return item;
      });
    };
    
    return filterItems(docs);
  }, [docs, searchTerm, filters]);

  // 日期范围检查函数
  const checkDateRange = (dateStr: string, range: string): boolean => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'today':
        return diffDays === 0;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'quarter':
        return diffDays <= 90;
      default:
        return true;
    }
  };

  // 拖拽处理函数
  const moveDocItem = useCallback((draggedId: number, targetId: number, position: 'before' | 'after') => {
    setDocs(prevDocs => {
      const newDocs = [...prevDocs];
      
      // 递归查找并移动项目
      const findAndMove = (items: DocItem[], draggedId: number, targetId: number, position: 'before' | 'after') => {
        let draggedItem: DocItem | null = null;
        let draggedIndex = -1;
        let targetIndex = -1;
        
        // 查找拖拽项和目标项
        const findItems = (arr: DocItem[], parentIndex = -1) => {
          arr.forEach((item, index) => {
            if (item.id === draggedId) {
              draggedItem = item;
              draggedIndex = parentIndex === -1 ? index : parentIndex;
            }
            if (item.id === targetId) {
              targetIndex = parentIndex === -1 ? index : parentIndex;
            }
            if (item.children) {
              findItems(item.children, parentIndex === -1 ? index : parentIndex);
            }
          });
        };
        
        findItems(items);
        
        if (draggedItem && draggedIndex !== -1 && targetIndex !== -1) {
          // 移除拖拽项
          items.splice(draggedIndex, 1);
          
          // 调整目标索引
          if (draggedIndex < targetIndex) {
            targetIndex--;
          }
          
          // 插入到新位置
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          items.splice(insertIndex, 0, draggedItem);
        }
        
        return items;
      };
      
      return findAndMove(newDocs, draggedId, targetId, position);
    });
  }, []);

  const handleDragStart = useCallback((item: DocItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((targetItem: DocItem, position: 'before' | 'after') => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      moveDocItem(draggedItem.id, targetItem.id, position);
    }
    handleDragEnd();
  }, [draggedItem, moveDocItem, handleDragEnd]);

  // 高亮搜索关键词
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className={styles.highlight}>{part}</span>
      ) : part
    );
  };

  // 获取搜索结果统计
  const getSearchStats = () => {
    const allFilteredDocs = getAllDocs(filteredDocs);
    const totalFiles = allFilteredDocs.filter(doc => doc.type === 'file').length;
    const totalFolders = allFilteredDocs.filter(doc => doc.type === 'folder').length;
    return { totalFiles, totalFolders, total: totalFiles + totalFolders };
  };

  const searchStats = getSearchStats();

  // 可拖拽的树形项目组件
  const DraggableTreeItem = ({ item, level = 0 }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.DOC_ITEM,
      item: { id: item.id, type: item.type, title: item.title },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [{ isOver, dropPosition }, drop] = useDrop(() => ({
      accept: ItemTypes.DOC_ITEM,
      drop: (draggedItem: any, monitor) => {
        if (!monitor.didDrop()) {
          moveDocItem(draggedItem.id, item.id, 'after');
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        dropPosition: null,
      })
    }));

    const ref = (node) => {
      drag(drop(node));
    };

    return (
      <div
        ref={ref}
        className={`${styles.treeItem} ${
          isDragging ? styles.dragging : ''
        } ${
          isOver ? styles.dropZone : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 16}px` }}
      >
        {isOver && dropPosition === 'before' && (
          <div className={styles.dropIndicator} />
        )}
        
        <div className={styles.treeItemContent}>
          {item.type === 'folder' && (
            <div 
              className={styles.treeToggle}
              onClick={() => toggleFolder(item.id)}
            >
              {expandedFolders.has(item.id) ? (
                renderIcon('chevron-down', '#666')
              ) : (
                renderIcon('chevron-right', '#666')
              )}
            </div>
          )}
          
          <div className={styles.treeIcon}>
            {renderIcon(
              item.type === 'folder' ? 'folder' : 'file',
              item.type === 'folder' ? '#fbbf24' : '#6b7280'
            )}
          </div>
          
          <span className={styles.treeLabel}>
            {highlightText(item.title, searchTerm)}
          </span>
          
          {item.status && (
            <span className={`${styles.statusBadge} ${styles[item.status]}`}>
              {item.status === 'published' ? '已发布' : 
               item.status === 'draft' ? '草稿' : '已归档'}
            </span>
          )}
        </div>
        
        <div className={styles.treeActions}>
          <button 
            className={styles.iconButton}
            onClick={() => handleDocClick(item)}
            title="编辑"
          >
            {renderIcon('edit', '#666')}
          </button>
          <button 
            className={styles.iconButton}
            onClick={() => console.log('删除', item.id)}
            title="删除"
          >
            {renderIcon('delete', '#f56565')}
          </button>
        </div>
        
        {isOver && dropPosition === 'after' && (
          <div className={styles.dropIndicator} />
        )}
      </div>
    );
  };

  const handleDocClick = (doc: DocItem) => {
    if (doc.type === 'folder') {
      toggleFolder(doc.id);
      // Update breadcrumbs for folder navigation
      const newBreadcrumbs = [...breadcrumbs, doc];
      setBreadcrumbs(newBreadcrumbs);
    } else {
      setSelectedDoc(doc);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const renderTreeItem = (item: DocItem, level = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id}>
        <DraggableTreeItem item={item} level={level} />
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
          <div className={styles.searchContainer}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button 
                className={`${styles.searchToggle} ${showAdvancedSearch ? styles.active : ''}`}
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                title="高级搜索"
              >
                {renderIcon('filter', showAdvancedSearch ? '#3b82f6' : '#666')}
              </button>
            </div>
            
            {showAdvancedSearch && (
              <div className={styles.advancedSearch}>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label>状态</label>
                    <select 
                      value={filters.status} 
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className={styles.filterSelect}
                    >
                      <option value="all">全部状态</option>
                      <option value="published">已发布</option>
                      <option value="draft">草稿</option>
                      <option value="archived">已归档</option>
                    </select>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label>作者</label>
                    <select 
                      value={filters.author} 
                      onChange={(e) => setFilters({...filters, author: e.target.value})}
                      className={styles.filterSelect}
                    >
                      <option value="all">全部作者</option>
                      <option value="admin">admin</option>
                      <option value="editor1">editor1</option>
                      <option value="editor2">editor2</option>
                    </select>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label>文件类型</label>
                    <select 
                      value={filters.fileType} 
                      onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                      className={styles.filterSelect}
                    >
                      <option value="all">全部类型</option>
                      <option value="folder">文件夹</option>
                      <option value="markdown">Markdown</option>
                      <option value="other">其他文件</option>
                    </select>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label>修改时间</label>
                    <select 
                      value={filters.dateRange} 
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                      className={styles.filterSelect}
                    >
                      <option value="all">全部时间</option>
                      <option value="today">今天</option>
                      <option value="week">最近一周</option>
                      <option value="month">最近一月</option>
                      <option value="quarter">最近三月</option>
                    </select>
                  </div>
                  
                  <button 
                    className={styles.clearFilters}
                    onClick={() => {
                      setFilters({
                        status: 'all',
                        author: 'all',
                        fileType: 'all',
                        dateRange: 'all'
                      });
                      setSearchTerm('');
                    }}
                  >
                    清除筛选
                  </button>
                </div>
              </div>
            )}
             
             {(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
               <div className={styles.searchStats}>
                 <span className={styles.statsText}>
                   找到 {searchStats.total} 项结果
                   {searchStats.totalFiles > 0 && ` (${searchStats.totalFiles} 个文件`}
                   {searchStats.totalFolders > 0 && `, ${searchStats.totalFolders} 个文件夹)`}
                   {searchStats.totalFiles > 0 && searchStats.totalFolders === 0 && ')'}
                 </span>
               </div>
             )}
          </div>
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
        
        {breadcrumbs.length > 0 && (
          <div className={styles.breadcrumbContainer}>
            <button 
              className={styles.breadcrumbItem}
              onClick={() => setBreadcrumbs([])}
            >
              根目录
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {renderIcon('chevron-right', '#9ca3af')}
                <button 
                  className={styles.breadcrumbItem}
                  onClick={() => navigateToBreadcrumb(index)}
                >
                  {crumb.title}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
        
        {viewMode === 'list' ? (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.length > 0 && selectedDocs.length === getAllDocs(filteredDocs).filter(doc => doc.type === 'file').length}
                      onChange={handleSelectAll}
                    />
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
                {getAllDocs(filteredDocs).filter(doc => doc.type === 'file').map(doc => (
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
                        <span>{highlightText(doc.title, searchTerm)}</span>
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
            {filteredDocs.map(item => renderTreeItem(item))}
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
    <DndProvider backend={HTML5Backend}>
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
    </DndProvider>
  );
};

export default DocsManagement;