import { DocNode, DocSearchResult } from '../types/doc';

// 模拟文档数据
export const mockDocTree: DocNode[] = [
  {
    id: '1',
    title: 'DM7 数据库文档',
    path: '/dm7',
    type: 'folder',
    version: 'dm7',
    status: 'published',
    order: 1,
    isExpanded: true,
    level: 0,
    children: [
      {
        id: '1-1',
        title: '安装指南',
        path: '/dm7/installation',
        type: 'folder',
        parent: '1',
        order: 1,
        level: 1,
        children: [
          {
            id: '1-1-1',
            title: 'Windows 安装',
            path: '/dm7/installation/windows',
            type: 'doc',
            parent: '1-1',
            version: 'dm7',
            status: 'published',
            order: 1,
            level: 2,
            lastModified: '2024-01-15',
            author: 'admin'
          },
          {
            id: '1-1-2',
            title: 'Linux 安装',
            path: '/dm7/installation/linux',
            type: 'doc',
            parent: '1-1',
            version: 'dm7',
            status: 'published',
            order: 2,
            level: 2,
            lastModified: '2024-01-14',
            author: 'admin'
          }
        ]
      },
      {
        id: '1-2',
        title: '用户手册',
        path: '/dm7/user-guide',
        type: 'folder',
        parent: '1',
        order: 2,
        level: 1,
        children: [
          {
            id: '1-2-1',
            title: '快速入门',
            path: '/dm7/user-guide/quick-start',
            type: 'doc',
            parent: '1-2',
            version: 'dm7',
            status: 'published',
            order: 1,
            level: 2,
            lastModified: '2024-01-13',
            author: 'editor'
          },
          {
            id: '1-2-2',
            title: 'SQL 语法',
            path: '/dm7/user-guide/sql-syntax',
            type: 'doc',
            parent: '1-2',
            version: 'dm7',
            status: 'draft',
            order: 2,
            level: 2,
            lastModified: '2024-01-12',
            author: 'editor'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'DM8 数据库文档',
    path: '/dm8',
    type: 'folder',
    version: 'dm8',
    status: 'published',
    order: 2,
    isExpanded: false,
    level: 0,
    children: [
      {
        id: '2-1',
        title: '新特性介绍',
        path: '/dm8/new-features',
        type: 'doc',
        parent: '2',
        version: 'dm8',
        status: 'published',
        order: 1,
        level: 1,
        lastModified: '2024-01-16',
        author: 'admin'
      },
      {
        id: '2-2',
        title: '迁移指南',
        path: '/dm8/migration',
        type: 'folder',
        parent: '2',
        order: 2,
        level: 1,
        children: [
          {
            id: '2-2-1',
            title: '从 DM7 迁移',
            path: '/dm8/migration/from-dm7',
            type: 'doc',
            parent: '2-2',
            version: 'dm8',
            status: 'published',
            order: 1,
            level: 2,
            lastModified: '2024-01-11',
            author: 'admin'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: '通用文档',
    path: '/general',
    type: 'folder',
    version: 'general',
    status: 'published',
    order: 3,
    isExpanded: false,
    level: 0,
    children: [
      {
        id: '3-1',
        title: 'FAQ',
        path: '/general/faq',
        type: 'doc',
        parent: '3',
        version: 'general',
        status: 'published',
        order: 1,
        level: 1,
        lastModified: '2024-01-10',
        author: 'editor'
      },
      {
        id: '3-2',
        title: '最佳实践',
        path: '/general/best-practices',
        type: 'doc',
        parent: '3',
        version: 'general',
        status: 'draft',
        order: 2,
        level: 1,
        lastModified: '2024-01-09',
        author: 'editor'
      }
    ]
  }
];

// 扁平化树形结构
export function flattenTree(nodes: DocNode[]): DocNode[] {
  const result: DocNode[] = [];
  
  function traverse(nodes: DocNode[], level = 0) {
    nodes.forEach(node => {
      result.push({ ...node, level });
      if (node.children) {
        traverse(node.children, level + 1);
      }
    });
  }
  
  traverse(nodes);
  return result;
}

// 根据ID查找节点
export function findNodeById(nodes: DocNode[], id: string): DocNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 根据路径查找节点
export function findNodeByPath(nodes: DocNode[], path: string): DocNode | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

// 获取节点的所有父节点（面包屑导航）
export function getNodeAncestors(nodes: DocNode[], nodeId: string): DocNode[] {
  const ancestors: DocNode[] = [];
  const flatNodes = flattenTree(nodes);
  
  let currentNode = flatNodes.find(n => n.id === nodeId);
  
  while (currentNode && currentNode.parent) {
    const parentNode = flatNodes.find(n => n.id === currentNode!.parent);
    if (parentNode) {
      ancestors.unshift(parentNode);
      currentNode = parentNode;
    } else {
      break;
    }
  }
  
  return ancestors;
}

// 获取同级的上一个和下一个文档
export function getSiblingDocs(nodes: DocNode[], currentId: string): { prev?: DocNode; next?: DocNode } {
  const flatNodes = flattenTree(nodes).filter(n => n.type === 'doc');
  const currentIndex = flatNodes.findIndex(n => n.id === currentId);
  
  if (currentIndex === -1) {
    return {};
  }
  
  return {
    prev: currentIndex > 0 ? flatNodes[currentIndex - 1] : undefined,
    next: currentIndex < flatNodes.length - 1 ? flatNodes[currentIndex + 1] : undefined
  };
}

// 搜索文档
export function searchDocs(nodes: DocNode[], query: string): DocSearchResult[] {
  if (!query.trim()) return [];
  
  const results: DocSearchResult[] = [];
  const flatNodes = flattenTree(nodes);
  const lowerQuery = query.toLowerCase();
  
  flatNodes.forEach(node => {
    if (node.type === 'doc') {
      const titleMatch = node.title.toLowerCase().includes(lowerQuery);
      const pathMatch = node.path.toLowerCase().includes(lowerQuery);
      const descMatch = node.description?.toLowerCase().includes(lowerQuery);
      
      if (titleMatch || pathMatch || descMatch) {
        let score = 0;
        const highlights: string[] = [];
        
        if (titleMatch) {
          score += 10;
          highlights.push('title');
        }
        if (pathMatch) {
          score += 5;
          highlights.push('path');
        }
        if (descMatch) {
          score += 3;
          highlights.push('description');
        }
        
        results.push({
          id: node.id,
          title: node.title,
          path: node.path,
          excerpt: node.description || '',
          score,
          highlights
        });
      }
    }
  });
  
  return results.sort((a, b) => b.score - a.score);
}

// 过滤树形结构
export function filterTree(nodes: DocNode[], query: string): DocNode[] {
  if (!query.trim()) return nodes;
  
  const lowerQuery = query.toLowerCase();
  
  function filterNode(node: DocNode): DocNode | null {
    const matches = node.title.toLowerCase().includes(lowerQuery) ||
                   node.path.toLowerCase().includes(lowerQuery) ||
                   node.description?.toLowerCase().includes(lowerQuery);
    
    let filteredChildren: DocNode[] = [];
    if (node.children) {
      filteredChildren = node.children
        .map(child => filterNode(child))
        .filter((child): child is DocNode => child !== null);
    }
    
    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
        isExpanded: filteredChildren.length > 0 ? true : node.isExpanded
      };
    }
    
    return null;
  }
  
  return nodes
    .map(node => filterNode(node))
    .filter((node): node is DocNode => node !== null);
}

// 更新节点展开状态
export function updateNodeExpansion(nodes: DocNode[], nodeId: string, expanded: boolean): DocNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: expanded };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeExpansion(node.children, nodeId, expanded)
      };
    }
    return node;
  });
}

// 添加新节点
export function addNode(nodes: DocNode[], newNode: DocNode, parentId?: string): DocNode[] {
  if (!parentId) {
    return [...nodes, newNode];
  }
  
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addNode(node.children, newNode, parentId)
      };
    }
    return node;
  });
}

// 删除节点
export function deleteNode(nodes: DocNode[], nodeId: string): DocNode[] {
  return nodes
    .filter(node => node.id !== nodeId)
    .map(node => {
      if (node.children) {
        return {
          ...node,
          children: deleteNode(node.children, nodeId)
        };
      }
      return node;
    });
}

// 更新节点
export function updateNode(nodes: DocNode[], nodeId: string, updates: Partial<DocNode>): DocNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNode(node.children, nodeId, updates)
      };
    }
    return node;
  });
}

// 获取节点路径
export function getNodePath(node: DocNode, tree: DocNode[] = mockDocTree): DocNode[] {
  const path: DocNode[] = [];
  
  function findPath(nodes: DocNode[], targetId: string, currentPath: DocNode[]): boolean {
    for (const currentNode of nodes) {
      const newPath = [...currentPath, currentNode];
      
      if (currentNode.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (currentNode.children && findPath(currentNode.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(tree, node.id, []);
  return path;
}

// 生成唯一ID
export function generateUniqueId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 验证节点数据
export function validateNode(node: Partial<DocNode>): string[] {
  const errors: string[] = [];
  
  if (!node.title?.trim()) {
    errors.push('标题不能为空');
  }
  
  if (!node.path?.trim()) {
    errors.push('路径不能为空');
  }
  
  if (!node.type || !['folder', 'doc'].includes(node.type)) {
    errors.push('类型必须是 folder 或 doc');
  }
  
  if (node.version && !['dm7', 'dm8', 'general'].includes(node.version)) {
    errors.push('版本必须是 dm7、dm8 或 general');
  }
  
  if (node.status && !['draft', 'published', 'archived'].includes(node.status)) {
    errors.push('状态必须是 draft、published 或 archived');
  }
  
  return errors;
}