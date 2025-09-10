// 在线编辑器相关类型定义

// 编辑器模式
export type EditorMode = 'edit' | 'preview' | 'split';

// 编辑器主题
export type EditorTheme = 'light' | 'dark' | 'auto';

// 编辑器语言
export type EditorLanguage = 'markdown' | 'html' | 'plaintext';

// 编辑器配置
export interface EditorConfig {
  mode: EditorMode;
  theme: EditorTheme;
  language: EditorLanguage;
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number; // 毫秒
  tabSize: number;
  insertSpaces: boolean;
  renderWhitespace: boolean;
  folding: boolean;
  bracketMatching: boolean;
  autoClosingBrackets: boolean;
  autoClosingQuotes: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
}

// 编辑器内容
export interface EditorContent {
  id: string;
  title: string;
  content: string;
  language: EditorLanguage;
  lastModified: Date;
  version: number;
  isDirty: boolean;
  metadata?: {
    author?: string;
    tags?: string[];
    description?: string;
    [key: string]: any;
  };
}

// 编辑器状态
export interface EditorState {
  content: EditorContent;
  config: EditorConfig;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  cursorPosition: {
    line: number;
    column: number;
  };
  selection: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  } | null;
  undoStack: string[];
  redoStack: string[];
  searchQuery: string;
  replaceQuery: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;
}

// 搜索结果
export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

// 编辑器操作
export type EditorAction = 
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_CONFIG'; payload: Partial<EditorConfig> }
  | { type: 'SET_MODE'; payload: EditorMode }
  | { type: 'SET_THEME'; payload: EditorTheme }
  | { type: 'SET_LANGUAGE'; payload: EditorLanguage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURSOR_POSITION'; payload: { line: number; column: number } }
  | { type: 'SET_SELECTION'; payload: EditorState['selection'] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'PUSH_UNDO'; payload: string }
  | { type: 'CLEAR_UNDO_REDO' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_REPLACE_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_CURRENT_SEARCH_INDEX'; payload: number }
  | { type: 'MARK_DIRTY'; payload: boolean }
  | { type: 'INCREMENT_VERSION' };

// 编辑器事件
export interface EditorEvents {
  onContentChange?: (content: string) => void;
  onSave?: (content: EditorContent) => Promise<void>;
  onLoad?: (id: string) => Promise<EditorContent>;
  onModeChange?: (mode: EditorMode) => void;
  onThemeChange?: (theme: EditorTheme) => void;
  onLanguageChange?: (language: EditorLanguage) => void;
  onCursorPositionChange?: (position: { line: number; column: number }) => void;
  onSelectionChange?: (selection: EditorState['selection']) => void;
  onSearch?: (query: string) => SearchResult[];
  onReplace?: (searchQuery: string, replaceQuery: string, replaceAll?: boolean) => number;
  onError?: (error: string) => void;
}

// 编辑器组件属性
export interface EditorProps {
  initialContent?: EditorContent;
  initialConfig?: Partial<EditorConfig>;
  events?: EditorEvents;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  placeholder?: string;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  showMinimap?: boolean;
  enableSearch?: boolean;
  enableReplace?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

// 预览组件属性
export interface PreviewProps {
  content: string;
  language: EditorLanguage;
  theme: EditorTheme;
  className?: string;
  style?: React.CSSProperties;
  showToc?: boolean; // 显示目录
  enableScroll?: boolean; // 启用滚动同步
  onScroll?: (scrollTop: number) => void;
  scrollTop?: number;
  onLinkClick?: (href: string, event: React.MouseEvent) => void;
  onImageLoad?: (src: string, alt?: string) => void;
  onImageError?: (src: string, alt?: string) => void;
}

// 目录项
export interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
}

// 工具栏按钮
export interface ToolbarButton {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  tooltip?: string;
  shortcut?: string;
}

// 工具栏组
export interface ToolbarGroup {
  id: string;
  label?: string;
  buttons: ToolbarButton[];
}

// 工具栏属性
export interface ToolbarProps {
  groups: ToolbarGroup[];
  className?: string;
  style?: React.CSSProperties;
}

// 状态栏信息
export interface StatusBarInfo {
  line: number;
  column: number;
  selection?: {
    start: number;
    end: number;
    lines: number;
    characters: number;
  };
  language: EditorLanguage;
  encoding: string;
  lineEnding: string;
  isDirty: boolean;
  wordCount: number;
  characterCount: number;
}

// 状态栏属性
export interface StatusBarProps {
  info: StatusBarInfo;
  className?: string;
  style?: React.CSSProperties;
  onLanguageChange?: (language: EditorLanguage) => void;
  onEncodingChange?: (encoding: string) => void;
  onLineEndingChange?: (lineEnding: string) => void;
}

// 搜索替换面板属性
export interface SearchReplaceProps {
  searchQuery: string;
  replaceQuery: string;
  searchResults: SearchResult[];
  currentIndex: number;
  onSearchChange: (query: string) => void;
  onReplaceChange: (query: string) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// 默认编辑器配置
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  mode: 'split',
  theme: 'auto',
  language: 'markdown',
  fontSize: 14,
  lineNumbers: true,
  wordWrap: true,
  minimap: false,
  autoSave: true,
  autoSaveDelay: 2000,
  tabSize: 2,
  insertSpaces: true,
  renderWhitespace: false,
  folding: true,
  bracketMatching: true,
  autoClosingBrackets: true,
  autoClosingQuotes: true,
  formatOnPaste: true,
  formatOnType: false
};

// 编辑器快捷键
export const EDITOR_SHORTCUTS = {
  save: 'Ctrl+S',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  find: 'Ctrl+F',
  replace: 'Ctrl+H',
  toggleMode: 'Ctrl+M',
  toggleTheme: 'Ctrl+T',
  formatDocument: 'Shift+Alt+F',
  toggleWordWrap: 'Alt+Z',
  toggleMinimap: 'Ctrl+Shift+M',
  increaseFontSize: 'Ctrl+=',
  decreaseFontSize: 'Ctrl+-',
  resetFontSize: 'Ctrl+0'
} as const;

// 编辑器错误类型
export enum EditorErrorType {
  LOAD_ERROR = 'LOAD_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// 编辑器错误
export interface EditorError {
  type: EditorErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

// 编辑器服务接口
export interface EditorService {
  loadContent(id: string): Promise<EditorContent>;
  saveContent(content: EditorContent): Promise<void>;
  validateContent(content: string, language: EditorLanguage): Promise<ValidationResult>;
  formatContent(content: string, language: EditorLanguage): Promise<string>;
  searchContent(content: string, query: string): SearchResult[];
  replaceContent(content: string, searchQuery: string, replaceQuery: string, replaceAll?: boolean): { content: string; replacements: number };
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// 验证错误
export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// 验证警告
export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}