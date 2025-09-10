// 编辑器组件索引文件

export { default as Editor } from './Editor';
export { default as Toolbar } from './Toolbar';
export { default as StatusBar } from './StatusBar';
export { default as SearchReplace } from './SearchReplace';

// 重新导出类型
export type {
  EditorProps,
  ToolbarProps,
  StatusBarProps,
  SearchReplaceProps,
  EditorConfig,
  EditorState,
  EditorAction,
  EditorEvents,
  StatusBarInfo
} from '../../types/editor';

// 重新导出Hook
export { useEditor } from '../../hooks/editor/useEditor';

// 重新导出工具函数
export {
  getTextStats,
  formatFileSize,
  detectEncoding,
  formatMarkdown,
  validateMarkdown,
  formatHTML,
  validateHTML,
  generateTableOfContents,
  highlightSearchResults
} from '../../utils/editor/editorUtils';

export { default as normalizeLineEndings } from '../../utils/editor/editorUtils';
export { default as insertTextAtCursor } from '../../utils/editor/editorUtils';
export { default as getWordAtCursor } from '../../utils/editor/editorUtils';