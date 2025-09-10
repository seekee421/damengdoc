import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBox.module.css';

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  type: 'doc' | 'blog' | 'page' | 'faq';
  category: string;
  tags: string[];
  score: number;
  lastModified: string;
}

interface SearchBoxProps {
  onSearch: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
  isLoading?: boolean;
  results?: SearchResult[];
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = '搜索文档...',
  onSearch,
  onResultClick,
  results = [],
  isLoading = false,
  className = '',
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理搜索输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
      onSearch?.(value);
    } else {
      setIsOpen(false);
    }
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={styles.highlight}>{part}</mark>
      ) : part
    );
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'doc': return '📄';
      case 'blog': return '📝';
      case 'page': return '🌐';
      default: return '📄';
    }
  };

  return (
    <div ref={searchRef} className={`${styles.searchBox} ${className}`}>
      <div className={styles.inputContainer}>
        <div className={styles.searchIcon}>
          🔍
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
        />
        {isLoading && (
          <div className={styles.loadingIcon}>
            <div className={styles.spinner}></div>
          </div>
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className={styles.clearButton}
            title="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.resultsContainer}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>搜索中...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                找到 {results.length} 个结果
              </div>
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`${styles.resultItem} ${
                      index === selectedIndex ? styles.selected : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={styles.resultIcon}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>
                        {highlightText(result.title, query)}
                      </div>
                      <div className={styles.resultSnippet}>
                        {highlightText(result.snippet, query)}
                      </div>
                      {result.category && (
                        <div className={styles.resultMeta}>
                          <span className={styles.category}>
                            📁 {result.category}
                          </span>
                          {result.tags && result.tags.length > 0 && (
                            <div className={styles.tags}>
                              {result.tags.slice(0, 3).map(tag => (
                                <span key={tag} className={styles.tag}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.resultScore}>
                      {Math.round(result.score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : query.trim() ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <div className={styles.noResultsText}>
                未找到与 "{query}" 相关的内容
              </div>
              <div className={styles.noResultsTips}>
                <p>搜索建议：</p>
                <ul>
                  <li>检查拼写是否正确</li>
                  <li>尝试使用不同的关键词</li>
                  <li>使用更通用的搜索词</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBox;