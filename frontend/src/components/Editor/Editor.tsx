// 在线编辑器组件

import React, { useEffect, useRef, useCallback } from 'react';
import { useEditor } from '../../hooks/editor/useEditor';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { SearchReplace } from './SearchReplace';
import { Preview } from '../Preview/Preview';
import type { EditorProps, ToolbarGroup, StatusBarInfo } from '../../types/editor';
import { getTextStats, detectEncoding, detectLineEnding } from '../../utils/editor/editorUtils';
import styles from './Editor.module.css';

export const Editor: React.FC<EditorProps> = ({
  initialContent,
  initialConfig,
  events,
  className,
  style,
  readOnly = false,
  height = '600px',
  width = '100%',
  placeholder = '开始编写您的文档...',
  showToolbar = true,
  showStatusBar = true,
  showMinimap = false,
  enableSearch = true,
  enableReplace = true,
  enableAutoSave = true,
  autoSaveInterval = 2000
}) => {
  const {
    state,
    setContent,
    setMode,
    setTheme,
    setLanguage,
    undo,
    redo,
    search,
    replace,
    findNext,
    findPrevious,
    setCursorPosition,
    setSelection,
    save,
    load,
    canUndo,
    canRedo,
    searchResults,
    currentSearchResult
  } = useEditor(initialContent, { ...initialConfig, autoSave: enableAutoSave, autoSaveDelay: autoSaveInterval });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showSearchReplace, setShowSearchReplace] = React.useState(false);

  // 处理内容变更
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    events?.onContentChange?.(newContent);
  }, [setContent, events]);

  // 处理光标位置变更
  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const content = textarea.value;
    
    // 计算行列位置
    const beforeCursor = content.substring(0, selectionStart);
    const lines = beforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    setCursorPosition(line, column);
    events?.onCursorPositionChange?.({ line, column });
    
    // 处理选择区域
    if (selectionStart !== selectionEnd) {
      const afterSelection = content.substring(0, selectionEnd);
      const endLines = afterSelection.split('\n');
      const endLine = endLines.length;
      const endColumn = endLines[endLines.length - 1].length + 1;
      
      setSelection({
        startLine: line,
        startColumn: column,
        endLine,
        endColumn
      });
      
      events?.onSelectionChange?.({
        startLine: line,
        startColumn: column,
        endLine,
        endColumn
      });
    } else {
      setSelection(null);
      events?.onSelectionChange?.(null);
    }
  }, [setCursorPosition, setSelection, events]);

  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { ctrlKey, metaKey, shiftKey, key } = e;
    const isCtrl = ctrlKey || metaKey;
    
    if (isCtrl) {
      switch (key) {
        case 's':
          e.preventDefault();
          if (events?.onSave) {
            save(events.onSave);
          }
          break;
        case 'z':
          e.preventDefault();
          if (shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'f':
          e.preventDefault();
          if (enableSearch) {
            setShowSearchReplace(true);
          }
          break;
        case 'h':
          e.preventDefault();
          if (enableReplace) {
            setShowSearchReplace(true);
          }
          break;
        case 'm':
          e.preventDefault();
          const modes: Array<typeof state.config.mode> = ['edit', 'preview', 'split'];
          const currentIndex = modes.indexOf(state.config.mode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          setMode(nextMode);
          events?.onModeChange?.(nextMode);
          break;
      }
    }
  }, [state.config.mode, save, undo, redo, setMode, enableSearch, enableReplace, events]);

  // 工具栏按钮组
  const toolbarGroups: ToolbarGroup[] = [
    {
      id: 'file',
      label: '文件',
      buttons: [
        {
          id: 'save',
          label: '保存',
          icon: '💾',
          action: () => events?.onSave && save(events.onSave),
          disabled: !state.content.isDirty || state.isSaving,
          tooltip: '保存文档 (Ctrl+S)',
          shortcut: 'Ctrl+S'
        }
      ]
    },
    {
      id: 'edit',
      label: '编辑',
      buttons: [
        {
          id: 'undo',
          label: '撤销',
          icon: '↶',
          action: undo,
          disabled: !canUndo,
          tooltip: '撤销 (Ctrl+Z)',
          shortcut: 'Ctrl+Z'
        },
        {
          id: 'redo',
          label: '重做',
          icon: '↷',
          action: redo,
          disabled: !canRedo,
          tooltip: '重做 (Ctrl+Y)',
          shortcut: 'Ctrl+Y'
        }
      ]
    },
    {
      id: 'view',
      label: '视图',
      buttons: [
        {
          id: 'mode-edit',
          label: '编辑',
          icon: '📝',
          action: () => {
            setMode('edit');
            events?.onModeChange?.('edit');
          },
          disabled: state.config.mode === 'edit'
        },
        {
          id: 'mode-preview',
          label: '预览',
          icon: '👁',
          action: () => {
            setMode('preview');
            events?.onModeChange?.('preview');
          },
          disabled: state.config.mode === 'preview'
        },
        {
          id: 'mode-split',
          label: '分屏',
          icon: '⚏',
          action: () => {
            setMode('split');
            events?.onModeChange?.('split');
          },
          disabled: state.config.mode === 'split'
        }
      ]
    },
    {
      id: 'search',
      label: '搜索',
      buttons: [
        {
          id: 'search',
          label: '搜索',
          icon: '🔍',
          action: () => setShowSearchReplace(true),
          tooltip: '搜索 (Ctrl+F)',
          shortcut: 'Ctrl+F'
        }
      ]
    }
  ];

  // 状态栏信息
  const statusBarInfo: StatusBarInfo = {
    wordCount: getTextStats(state.content.content).words,
    characterCount: getTextStats(state.content.content).characters,
    line: state.cursorPosition.line,
    column: state.cursorPosition.column,
    selection: state.selection ? {
      start: state.selection.startLine * 100 + state.selection.startColumn,
      end: state.selection.endLine * 100 + state.selection.endColumn,
      characters: Math.abs(
        (state.selection.endLine - state.selection.startLine) * 100 + 
        (state.selection.endColumn - state.selection.startColumn)
      ),
      lines: Math.abs(state.selection.endLine - state.selection.startLine) + 1
    } : undefined,
    language: state.config.language,
    encoding: detectEncoding(state.content.content),
    lineEnding: detectLineEnding(state.content.content),
    isDirty: state.content.isDirty,
    ...getTextStats(state.content.content)
  };

  // 处理搜索
  const handleSearch = useCallback((query: string) => {
    const results = search(query);
    if (events?.onSearch) {
      return events.onSearch(query);
    }
    return results;
  }, [search, events]);

  // 处理替换
  const handleReplace = useCallback((searchQuery: string, replaceQuery: string, replaceAll: boolean = false) => {
    const replacements = replace(searchQuery, replaceQuery, replaceAll);
    if (events?.onReplace) {
      return events.onReplace(searchQuery, replaceQuery, replaceAll);
    }
    return replacements;
  }, [replace, events]);

  // 同步滚动
  const handleEditorScroll = useCallback(() => {
    if (state.config.mode === 'split' && textareaRef.current && previewRef.current) {
      const textarea = textareaRef.current;
      const preview = previewRef.current;
      
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
  }, [state.config.mode]);

  // 渲染编辑器区域
  const renderEditor = () => {
    if (state.config.mode === 'preview') return null;
    
    return (
      <div className={styles.editorPane}>
        <textarea
          ref={textareaRef}
          value={state.content.content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorChange}
          onScroll={handleEditorScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          className={styles.textarea}
          style={{
            fontSize: `${state.config.fontSize}px`,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: 1.5,
            tabSize: state.config.tabSize
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        {state.config.lineNumbers && (
          <div className={styles.lineNumbers}>
            {state.content.content.split('\n').map((_, index) => (
              <div key={index} className={styles.lineNumber}>
                {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染预览区域
  const renderPreview = () => {
    if (state.config.mode === 'edit') return null;
    
    return (
      <div className={styles.previewPane} ref={previewRef}>
        <Preview
          content={state.content.content}
          language={state.config.language}
          theme={state.config.theme}
          showToc={true}
          enableScroll={state.config.mode === 'split'}
        />
      </div>
    );
  };

  return (
    <div 
      className={`${styles.editor} ${className || ''}`} 
      style={{ height, width, ...style }}
      data-theme={state.config.theme}
    >
      {showToolbar && (
        <Toolbar 
          groups={toolbarGroups}
          className={styles.toolbar}
        />
      )}
      
      {showSearchReplace && (
        <SearchReplace
          searchQuery={state.searchQuery}
          replaceQuery={state.replaceQuery}
          searchResults={searchResults}
          currentIndex={state.currentSearchIndex}
          onSearchChange={handleSearch}
          onReplaceChange={(query) => {
            // 这里只是更新替换查询，不执行替换
            // 实际替换在点击替换按钮时执行
          }}
          onFindNext={findNext}
          onFindPrevious={findPrevious}
          onReplace={() => handleReplace(state.searchQuery, state.replaceQuery, false)}
          onReplaceAll={() => handleReplace(state.searchQuery, state.replaceQuery, true)}
          onClose={() => setShowSearchReplace(false)}
          className={styles.searchReplace}
        />
      )}
      
      <div className={styles.content}>
        <div className={`${styles.panes} ${styles[`mode-${state.config.mode}`]}`}>
          {renderEditor()}
          {renderPreview()}
        </div>
      </div>
      
      {showStatusBar && (
        <StatusBar
          info={statusBarInfo}
          className={styles.statusBar}
          onLanguageChange={(language) => {
            setLanguage(language);
            events?.onLanguageChange?.(language);
          }}
        />
      )}
      
      {state.error && (
        <div className={styles.errorMessage}>
          {state.error}
        </div>
      )}
      
      {state.isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}>加载中...</div>
        </div>
      )}
      
      {state.isSaving && (
        <div className={styles.savingIndicator}>
          保存中...
        </div>
      )}
    </div>
  );
};

export default Editor;