// 文档节点类型定义
export interface DocNode {
  id: string;
  title: string;
  path: string;
  type: 'folder' | 'doc';
  children?: DocNode[];
  parent?: string;
  order?: number;
  version?: 'dm7' | 'dm8' | 'general';
  status?: 'draft' | 'published' | 'archived';
  lastModified?: string;
  author?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  isExpanded?: boolean;
  level?: number;
  content?: string;
}

// 文档树配置
export interface DocTreeConfig {
  showIcons: boolean;
  showStatus: boolean;
  showVersion: boolean;
  expandAll: boolean;
  searchable: boolean;
  draggable: boolean;
  maxDepth: number;
}

// 导航配置
export interface NavigationConfig {
  showBreadcrumb: boolean;
  showSidebar: boolean;
  sidebarCollapsible: boolean;
  showToc: boolean;
  tocMaxDepth: number;
  showPrevNext: boolean;
}

// 文档搜索结果
export interface DocSearchResult {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  score: number;
  highlights: string[];
}

// 文档操作类型
export type DocAction = 
  | { type: 'ADD_NODE'; payload: { node: DocNode; parentId?: string } }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<DocNode> } }
  | { type: 'DELETE_NODE'; payload: { id: string } }
  | { type: 'MOVE_NODE'; payload: { id: string; newParentId?: string; newIndex: number } }
  | { type: 'EXPAND_NODE'; payload: { id: string; expanded: boolean } }
  | { type: 'SET_TREE'; payload: { tree: DocNode[] } }
  | { type: 'FILTER_TREE'; payload: { query: string } };

// 文档树状态
export interface DocTreeState {
  tree: DocNode[];
  filteredTree: DocNode[];
  selectedNodeId?: string;
  expandedNodes: Set<string>;
  searchQuery: string;
  config: DocTreeConfig;
}

// 导航状态
export interface NavigationState {
  currentPath: string;
  breadcrumb: DocNode[];
  prevDoc?: DocNode;
  nextDoc?: DocNode;
  tocItems: TocItem[];
  config: NavigationConfig;
}

// 目录项
export interface TocItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TocItem[];
}