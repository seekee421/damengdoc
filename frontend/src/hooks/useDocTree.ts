import { useReducer, useCallback, useEffect } from 'react';
import { DocNode, DocTreeState, DocAction, DocTreeConfig } from '../types/doc';
import {
  mockDocTree,
  filterTree,
  updateNodeExpansion,
  addNode,
  deleteNode,
  updateNode,
  findNodeById
} from '../utils/docTree';

// 默认配置
const defaultConfig: DocTreeConfig = {
  showIcons: true,
  showStatus: true,
  showVersion: true,
  expandAll: false,
  searchable: true,
  draggable: true,
  maxDepth: 10
};

// 初始状态
const initialState: DocTreeState = {
  tree: mockDocTree,
  filteredTree: mockDocTree,
  selectedNodeId: undefined,
  expandedNodes: new Set(['1']), // 默认展开第一个节点
  searchQuery: '',
  config: defaultConfig
};

// Reducer函数
function docTreeReducer(state: DocTreeState, action: DocAction): DocTreeState {
  switch (action.type) {
    case 'SET_TREE':
      return {
        ...state,
        tree: action.payload.tree,
        filteredTree: state.searchQuery 
          ? filterTree(action.payload.tree, state.searchQuery)
          : action.payload.tree
      };

    case 'ADD_NODE': {
      const newTree = addNode(state.tree, action.payload.node, action.payload.parentId);
      return {
        ...state,
        tree: newTree,
        filteredTree: state.searchQuery ? filterTree(newTree, state.searchQuery) : newTree
      };
    }

    case 'UPDATE_NODE': {
      const newTree = updateNode(state.tree, action.payload.id, action.payload.updates);
      return {
        ...state,
        tree: newTree,
        filteredTree: state.searchQuery ? filterTree(newTree, state.searchQuery) : newTree
      };
    }

    case 'DELETE_NODE': {
      const newTree = deleteNode(state.tree, action.payload.id);
      const newExpandedNodes = new Set(state.expandedNodes);
      newExpandedNodes.delete(action.payload.id);
      
      return {
        ...state,
        tree: newTree,
        filteredTree: state.searchQuery ? filterTree(newTree, state.searchQuery) : newTree,
        expandedNodes: newExpandedNodes,
        selectedNodeId: state.selectedNodeId === action.payload.id ? undefined : state.selectedNodeId
      };
    }

    case 'EXPAND_NODE': {
      const newExpandedNodes = new Set(state.expandedNodes);
      if (action.payload.expanded) {
        newExpandedNodes.add(action.payload.id);
      } else {
        newExpandedNodes.delete(action.payload.id);
      }
      
      const newTree = updateNodeExpansion(state.tree, action.payload.id, action.payload.expanded);
      
      return {
        ...state,
        tree: newTree,
        filteredTree: state.searchQuery ? filterTree(newTree, state.searchQuery) : newTree,
        expandedNodes: newExpandedNodes
      };
    }

    case 'FILTER_TREE': {
      const query = action.payload.query;
      const filteredTree = query ? filterTree(state.tree, query) : state.tree;
      
      return {
        ...state,
        searchQuery: query,
        filteredTree
      };
    }

    default:
      return state;
  }
}

// 自定义Hook
export function useDocTree(initialTree?: DocNode[], config?: Partial<DocTreeConfig>) {
  const [state, dispatch] = useReducer(docTreeReducer, {
    ...initialState,
    tree: initialTree || mockDocTree,
    filteredTree: initialTree || mockDocTree,
    config: { ...defaultConfig, ...config }
  });

  // 设置树数据
  const setTree = useCallback((tree: DocNode[]) => {
    dispatch({ type: 'SET_TREE', payload: { tree } });
  }, []);

  // 添加节点
  const addNodeToTree = useCallback((node: DocNode, parentId?: string) => {
    dispatch({ type: 'ADD_NODE', payload: { node, parentId } });
  }, []);

  // 更新节点
  const updateNodeInTree = useCallback((id: string, updates: Partial<DocNode>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  }, []);

  // 删除节点
  const deleteNodeFromTree = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: { id } });
  }, []);

  // 展开/折叠节点
  const toggleNodeExpansion = useCallback((id: string, expanded?: boolean) => {
    const node = findNodeById(state.tree, id);
    if (node && node.children && node.children.length > 0) {
      const newExpanded = expanded !== undefined ? expanded : !state.expandedNodes.has(id);
      dispatch({ type: 'EXPAND_NODE', payload: { id, expanded: newExpanded } });
    }
  }, [state.tree, state.expandedNodes]);

  // 展开所有节点
  const expandAll = useCallback(() => {
    const allNodeIds = new Set<string>();
    
    function collectIds(nodes: DocNode[]) {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allNodeIds.add(node.id);
          collectIds(node.children);
        }
      });
    }
    
    collectIds(state.tree);
    
    allNodeIds.forEach(id => {
      dispatch({ type: 'EXPAND_NODE', payload: { id, expanded: true } });
    });
  }, [state.tree]);

  // 折叠所有节点
  const collapseAll = useCallback(() => {
    state.expandedNodes.forEach(id => {
      dispatch({ type: 'EXPAND_NODE', payload: { id, expanded: false } });
    });
  }, [state.expandedNodes]);

  // 搜索过滤
  const filterTreeByQuery = useCallback((query: string) => {
    dispatch({ type: 'FILTER_TREE', payload: { query } });
  }, []);

  // 选择节点
  const selectNode = useCallback((nodeId?: string) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id: 'selected', updates: { id: nodeId } } });
  }, []);

  // 获取选中的节点
  const getSelectedNode = useCallback(() => {
    return state.selectedNodeId ? findNodeById(state.tree, state.selectedNodeId) : null;
  }, [state.tree, state.selectedNodeId]);

  // 检查节点是否展开
  const isNodeExpanded = useCallback((nodeId: string) => {
    return state.expandedNodes.has(nodeId);
  }, [state.expandedNodes]);

  // 获取节点深度
  const getNodeDepth = useCallback((nodeId: string) => {
    const node = findNodeById(state.tree, nodeId);
    return node?.level || 0;
  }, [state.tree]);

  // 检查是否可以添加子节点
  const canAddChild = useCallback((nodeId: string) => {
    const node = findNodeById(state.tree, nodeId);
    if (!node) return false;
    
    const depth = getNodeDepth(nodeId);
    return node.type === 'folder' && depth < state.config.maxDepth;
  }, [state.tree, state.config.maxDepth, getNodeDepth]);

  // 重新加载数据
  const reloadTree = useCallback(async () => {
    // 这里可以添加从API加载数据的逻辑
    // 目前使用模拟数据
    setTree(mockDocTree);
  }, [setTree]);

  // 导出树数据
  const exportTree = useCallback(() => {
    return JSON.stringify(state.tree, null, 2);
  }, [state.tree]);

  // 导入树数据
  const importTree = useCallback((jsonData: string) => {
    try {
      const tree = JSON.parse(jsonData) as DocNode[];
      setTree(tree);
      return true;
    } catch (error) {
      console.error('导入树数据失败:', error);
      return false;
    }
  }, [setTree]);

  return {
    // 状态
    tree: state.filteredTree,
    originalTree: state.tree,
    selectedNodeId: state.selectedNodeId,
    expandedNodes: state.expandedNodes,
    searchQuery: state.searchQuery,
    config: state.config,
    
    // 操作方法
    setTree,
    addNodeToTree,
    updateNodeInTree,
    deleteNodeFromTree,
    toggleNodeExpansion,
    expandAll,
    collapseAll,
    filterTreeByQuery,
    selectNode,
    
    // 查询方法
    getSelectedNode,
    isNodeExpanded,
    getNodeDepth,
    canAddChild,
    
    // 工具方法
    reloadTree,
    exportTree,
    importTree
  };
}

// 导出类型
export type UseDocTreeReturn = ReturnType<typeof useDocTree>;