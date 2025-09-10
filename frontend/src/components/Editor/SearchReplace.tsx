// 编辑器搜索替换组件

import React, { useState, useEffect } from 'react';
import type { SearchReplaceProps } from '../../types/editor';
import styles from './SearchReplace.module.css';

export const SearchReplace: React.FC<SearchReplaceProps> = ({
  searchQuery,
  replaceQuery,
  searchResults,
  currentIndex,
  onSearchChange,
  onReplaceChange,
  onFindNext,
  onFindPrevious,
  onReplace,
  onReplaceAll,
  onClose,
  className,
  style
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localReplaceQuery, setLocalReplaceQuery] = useState(replaceQuery);
  const [showReplace, setShowReplace] = useState(false);

  // 同步外部状态
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalReplaceQuery(replaceQuery);
  }, [replaceQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearchChange(value);
  };

  const handleReplaceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalReplaceQuery(value);
    onReplaceChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrevious();
      } else {
        onFindNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const resultText = searchResults.length > 0 
    ? `${currentIndex + 1} / ${searchResults.length}`
    : searchQuery ? '无结果' : '';

  return (
    <div className={`${styles.searchReplace} ${className || ''}`} style={style}>
      <div className={styles.searchRow}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索..."
            value={localSearchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className={styles.resultCount}>
            {resultText}
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            onClick={onFindPrevious}
            disabled={searchResults.length === 0}
            title="查找上一个 (Shift+Enter)"
          >
            ↑
          </button>
          
          <button
            className={styles.button}
            onClick={onFindNext}
            disabled={searchResults.length === 0}
            title="查找下一个 (Enter)"
          >
            ↓
          </button>
          
          <button
            className={styles.button}
            onClick={() => setShowReplace(!showReplace)}
            title="切换替换模式"
          >
            ⇄
          </button>
          
          <button
            className={styles.closeButton}
            onClick={onClose}
            title="关闭 (Escape)"
          >
            ×
          </button>
        </div>
      </div>
      
      {showReplace && (
        <div className={styles.replaceRow}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.replaceInput}
              placeholder="替换为..."
              value={localReplaceQuery}
              onChange={handleReplaceInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              onClick={onReplace}
              disabled={searchResults.length === 0 || !localSearchQuery}
              title="替换当前"
            >
              替换
            </button>
            
            <button
              className={styles.button}
              onClick={onReplaceAll}
              disabled={searchResults.length === 0 || !localSearchQuery}
              title="全部替换"
            >
              全部替换
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchReplace;