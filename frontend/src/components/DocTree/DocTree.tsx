import React, { useState, useCallback } from 'react';
import { DocNode } from '../../types/doc';
import { useDocTree } from '../../hooks/useDocTree';
import { useAuth } from '../../contexts/AuthContext';
import styles from './DocTree.module.css';

interface DocTreeProps {
  initialTree?: DocNode[];
  onNodeSelect?: (node: DocNode) => void;
  onNodeEdit?: (node: DocNode) => void;
  onNodeDelete?: (node: DocNode) => void;
  onNodeAdd?: (parentNode?: DocNode) => void;
  selectedNodeId?: string;
  className?: string;
  showSearch?: boolean;
  showActions?: boolean;
  maxHeight?: string;
}

interface DocTreeNodeProps {
  node: DocNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (node: DocNode) => void;
  onEdit?: (node: DocNode) => void;
  onDelete?: (node: DocNode) => void;
  onAddChild?: (parentNode: DocNode) => void;
  showActions: boolean;
  canEdit: boolean;
}

// 文档树节点组件
const DocTreeNode: React.FC<DocTreeNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  showActions,
  canEdit
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  }, [hasChildren, node.id, onToggle]);

  const handleSelect = useCallback(() => {
    onSelect(node);
  }, [node, onSelect]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(node);
  }, [node, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(node);
  }, [node, onDelete]);

  const handleAddChild = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild?.(node);
  }, [node, onAddChild]);

  const getNodeIcon = () => {
    if (isFolder) {
      return isExpanded ? '📂' : '📁';
    }
    return '📄';
  };

  const getStatusBadge = () => {
    if (!node.status) return null;
    
    const statusClass = {
      draft: styles.draftBadge,
      published: styles.publishedBadge,
      archived: styles.archivedBadge
    }[node.status] || styles.defaultBadge;

    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>
        {node.status}
      </span>
    );
  };

  const getVersionBadge = () => {
    if (!node.version) return null;
    
    const versionClass = {
      dm7: styles.dm7Badge,
      dm8: styles.dm8Badge,
      general: styles.generalBadge
    }[node.version] || styles.defaultBadge;

    return (
      <span className={`${styles.versionBadge} ${versionClass}`}>
        {node.version.toUpperCase()}
      </span>
    );
  };

  return (
    <div className={styles.nodeContainer}>
      <div
        className={`${styles.nodeItem} ${
          isSelected ? styles.selected : ''
        } ${isHovered ? styles.hovered : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 展开/折叠按钮 */}
        <button
          className={`${styles.toggleButton} ${
            hasChildren ? styles.hasChildren : styles.noChildren
          }`}
          onClick={handleToggle}
          disabled={!hasChildren}
        >
          {hasChildren && (
            <span className={isExpanded ? styles.expanded : styles.collapsed}>
              ▶
            </span>
          )}
        </button>

        {/* 节点图标 */}
        <span className={styles.nodeIcon}>{getNodeIcon()}</span>

        {/* 节点标题 */}
        <span className={styles.nodeTitle} title={node.title}>
          {node.title}
        </span>

        {/* 版本标签 */}
        {getVersionBadge()}

        {/* 状态标签 */}
        {getStatusBadge()}

        {/* 操作按钮 */}
        {showActions && canEdit && isHovered && (
          <div className={styles.nodeActions}>
            {isFolder && (
              <button
                className={styles.actionButton}
                onClick={handleAddChild}
                title="添加子项"
              >
                ➕
              </button>
            )}
            <button
              className={styles.actionButton}
              onClick={handleEdit}
              title="编辑"
            >
              ✏️
            </button>
            <button
              className={styles.actionButton}
              onClick={handleDelete}
              title="删除"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div className={styles.childrenContainer}>
          {node.children!.map((child) => (
            <DocTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              showActions={showActions}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 主文档树组件
export const DocTree: React.FC<DocTreeProps> = ({
  initialTree,
  onNodeSelect,
  onNodeEdit,
  onNodeDelete,
  onNodeAdd,
  className,
  showSearch = true,
  showActions = true,
  maxHeight = '600px'
}) => {
  const { user } = useAuth();
  const {
    tree,
    selectedNodeId,
    searchQuery,
    isNodeExpanded,
    toggleNodeExpansion,
    selectNode,
    filterTreeByQuery,
    expandAll,
    collapseAll
  } = useDocTree(initialTree);

  const [searchValue, setSearchValue] = useState('');
  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    filterTreeByQuery(value);
  }, [filterTreeByQuery]);

  const handleNodeSelect = useCallback((node: DocNode) => {
    selectNode(node.id);
    onNodeSelect?.(node);
  }, [selectNode, onNodeSelect]);

  const handleExpandAll = useCallback(() => {
    expandAll();
  }, [expandAll]);

  const handleCollapseAll = useCallback(() => {
    collapseAll();
  }, [collapseAll]);

  const renderTree = (nodes: DocNode[], level = 0) => {
    return nodes.map((node) => (
      <DocTreeNode
        key={node.id}
        node={node}
        level={level}
        isExpanded={isNodeExpanded(node.id)}
        isSelected={selectedNodeId === node.id}
        onToggle={toggleNodeExpansion}
        onSelect={handleNodeSelect}
        onEdit={onNodeEdit}
        onDelete={onNodeDelete}
        onAddChild={onNodeAdd}
        showActions={showActions}
        canEdit={canEdit}
      />
    ));
  };

  return (
    <div className={`${styles.docTree} ${className || ''}`}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        {showSearch && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索文档..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchValue && (
              <button
                className={styles.clearButton}
                onClick={() => handleSearch('')}
                title="清除搜索"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className={styles.toolbarActions}>
          <button
            className={styles.toolbarButton}
            onClick={handleExpandAll}
            title="展开所有"
          >
            📂
          </button>
          <button
            className={styles.toolbarButton}
            onClick={handleCollapseAll}
            title="折叠所有"
          >
            📁
          </button>
          {canEdit && (
            <button
              className={styles.toolbarButton}
              onClick={() => onNodeAdd?.()}
              title="添加根节点"
            >
              ➕
            </button>
          )}
        </div>
      </div>

      {/* 树形结构 */}
      <div 
        className={styles.treeContainer}
        style={{ maxHeight }}
      >
        {tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div className={styles.emptyState}>
            {searchQuery ? (
              <>
                <span className={styles.emptyIcon}>🔍</span>
                <p>未找到匹配的文档</p>
                <button
                  className={styles.clearSearchButton}
                  onClick={() => handleSearch('')}
                >
                  清除搜索
                </button>
              </>
            ) : (
              <>
                <span className={styles.emptyIcon}>📁</span>
                <p>暂无文档</p>
                {canEdit && (
                  <button
                    className={styles.addFirstButton}
                    onClick={() => onNodeAdd?.()}
                  >
                    添加第一个文档
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocTree;