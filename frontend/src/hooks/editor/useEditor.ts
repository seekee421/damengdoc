// 编辑器状态管理Hook

import { useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  EditorState,
  EditorAction,
  EditorConfig,
  EditorContent,
  EditorMode,
  EditorTheme,
  EditorLanguage,
  SearchResult
} from '../../types/editor';
import { DEFAULT_EDITOR_CONFIG } from '../../types/editor';

// 初始状态
const createInitialState = (initialContent?: EditorContent, initialConfig?: Partial<EditorConfig>): EditorState => ({
  content: initialContent || {
    id: '',
    title: '未命名文档',
    content: '',
    language: 'markdown',
    lastModified: new Date(),
    version: 1,
    isDirty: false
  },
  config: { ...DEFAULT_EDITOR_CONFIG, ...initialConfig },
  isLoading: false,
  isSaving: false,
  error: null,
  cursorPosition: { line: 1, column: 1 },
  selection: null,
  undoStack: [],
  redoStack: [],
  searchQuery: '',
  replaceQuery: '',
  searchResults: [],
  currentSearchIndex: -1
});

// 状态reducer
const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return {
        ...state,
        content: {
          ...state.content,
          content: action.payload,
          lastModified: new Date(),
          isDirty: true
        }
      };

    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };

    case 'SET_MODE':
      return {
        ...state,
        config: { ...state.config, mode: action.payload }
      };

    case 'SET_THEME':
      return {
        ...state,
        config: { ...state.config, theme: action.payload }
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        config: { ...state.config, language: action.payload },
        content: { ...state.content, language: action.payload }
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CURSOR_POSITION':
      return { ...state, cursorPosition: action.payload };

    case 'SET_SELECTION':
      return { ...state, selection: action.payload };

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const previousContent = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        content: {
          ...state.content,
          content: previousContent,
          lastModified: new Date()
        },
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.content.content]
      };

    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextContent = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        content: {
          ...state.content,
          content: nextContent,
          lastModified: new Date()
        },
        undoStack: [...state.undoStack, state.content.content],
        redoStack: state.redoStack.slice(0, -1)
      };

    case 'PUSH_UNDO':
      return {
        ...state,
        undoStack: [...state.undoStack.slice(-49), action.payload], // 保持最多50个历史记录
        redoStack: [] // 清空redo栈
      };

    case 'CLEAR_UNDO_REDO':
      return {
        ...state,
        undoStack: [],
        redoStack: []
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_REPLACE_QUERY':
      return { ...state, replaceQuery: action.payload };

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        currentSearchIndex: action.payload.length > 0 ? 0 : -1
      };

    case 'SET_CURRENT_SEARCH_INDEX':
      return { ...state, currentSearchIndex: action.payload };

    case 'MARK_DIRTY':
      return {
        ...state,
        content: { ...state.content, isDirty: action.payload }
      };

    case 'INCREMENT_VERSION':
      return {
        ...state,
        content: {
          ...state.content,
          version: state.content.version + 1,
          isDirty: false
        }
      };

    default:
      return state;
  }
};

// 搜索函数
const searchInContent = (content: string, query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  const lines = content.split('\n');
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  
  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = regex.exec(line)) !== null) {
      results.push({
        line: lineIndex + 1,
        column: match.index + 1,
        length: match[0].length,
        text: match[0]
      });
    }
  });
  
  return results;
};

// 替换函数
const replaceInContent = (
  content: string,
  searchQuery: string,
  replaceQuery: string,
  replaceAll: boolean = false
): { content: string; replacements: number } => {
  if (!searchQuery.trim()) return { content, replacements: 0 };
  
  const regex = new RegExp(
    searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    replaceAll ? 'gi' : 'i'
  );
  
  let replacements = 0;
  const newContent = content.replace(regex, (match) => {
    replacements++;
    return replaceQuery;
  });
  
  return { content: newContent, replacements };
};

export const useEditor = (initialContent?: EditorContent, initialConfig?: Partial<EditorConfig>) => {
  const [state, dispatch] = useReducer(
    editorReducer,
    createInitialState(initialContent, initialConfig)
  );
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(state.content.content);

  // 内容变更处理
  const setContent = useCallback((content: string) => {
    // 推送到撤销栈
    if (lastContentRef.current !== content) {
      dispatch({ type: 'PUSH_UNDO', payload: lastContentRef.current });
      lastContentRef.current = content;
    }
    
    dispatch({ type: 'SET_CONTENT', payload: content });
  }, []);

  // 配置更新
  const setConfig = useCallback((config: Partial<EditorConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  // 模式切换
  const setMode = useCallback((mode: EditorMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // 主题切换
  const setTheme = useCallback((theme: EditorTheme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  // 语言切换
  const setLanguage = useCallback((language: EditorLanguage) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);

  // 撤销
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  // 重做
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // 搜索
  const search = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    const results = searchInContent(state.content.content, query);
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    return results;
  }, [state.content.content]);

  // 替换
  const replace = useCallback((searchQuery: string, replaceQuery: string, replaceAll: boolean = false) => {
    const { content: newContent, replacements } = replaceInContent(
      state.content.content,
      searchQuery,
      replaceQuery,
      replaceAll
    );
    
    if (replacements > 0) {
      setContent(newContent);
      // 重新搜索以更新结果
      const newResults = searchInContent(newContent, searchQuery);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: newResults });
    }
    
    return replacements;
  }, [state.content.content, setContent]);

  // 查找下一个
  const findNext = useCallback(() => {
    if (state.searchResults.length === 0) return;
    const nextIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
    dispatch({ type: 'SET_CURRENT_SEARCH_INDEX', payload: nextIndex });
    return state.searchResults[nextIndex];
  }, [state.searchResults, state.currentSearchIndex]);

  // 查找上一个
  const findPrevious = useCallback(() => {
    if (state.searchResults.length === 0) return;
    const prevIndex = state.currentSearchIndex === 0 
      ? state.searchResults.length - 1 
      : state.currentSearchIndex - 1;
    dispatch({ type: 'SET_CURRENT_SEARCH_INDEX', payload: prevIndex });
    return state.searchResults[prevIndex];
  }, [state.searchResults, state.currentSearchIndex]);

  // 光标位置更新
  const setCursorPosition = useCallback((line: number, column: number) => {
    dispatch({ type: 'SET_CURSOR_POSITION', payload: { line, column } });
  }, []);

  // 选择区域更新
  const setSelection = useCallback((selection: EditorState['selection']) => {
    dispatch({ type: 'SET_SELECTION', payload: selection });
  }, []);

  // 保存
  const save = useCallback(async (saveHandler?: (content: EditorContent) => Promise<void>) => {
    if (!state.content.isDirty) return;
    
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      if (saveHandler) {
        await saveHandler(state.content);
      }
      dispatch({ type: 'INCREMENT_VERSION' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '保存失败' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.content]);

  // 加载
  const load = useCallback(async (loadHandler: (id: string) => Promise<EditorContent>, id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const content = await loadHandler(id);
      dispatch({ type: 'SET_CONTENT', payload: content.content });
      dispatch({ type: 'CLEAR_UNDO_REDO' });
      lastContentRef.current = content.content;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '加载失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // 自动保存
  useEffect(() => {
    if (state.config.autoSave && state.content.isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        // 这里可以触发自动保存逻辑
        console.log('Auto save triggered');
      }, state.config.autoSaveDelay);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.content.isDirty, state.config.autoSave, state.config.autoSaveDelay]);

  return {
    // 状态
    state,
    
    // 内容操作
    setContent,
    save,
    load,
    
    // 配置操作
    setConfig,
    setMode,
    setTheme,
    setLanguage,
    
    // 编辑操作
    undo,
    redo,
    
    // 搜索替换
    search,
    replace,
    findNext,
    findPrevious,
    
    // 光标和选择
    setCursorPosition,
    setSelection,
    
    // 便捷属性
    content: state.content.content,
    config: state.config,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    isDirty: state.content.isDirty,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    searchResults: state.searchResults,
    currentSearchResult: state.currentSearchIndex >= 0 ? state.searchResults[state.currentSearchIndex] : null
  };
};

export default useEditor;