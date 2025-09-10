import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { useHistory } from '@docusaurus/router';
import SearchBox from './SearchBox';
import { SearchResult } from './SearchBox';
import { searchDocuments } from '../../services/searchService';
import styles from './GlobalSearch.module.css';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  showButton?: boolean;
}

export default function GlobalSearch({ 
  className = '', 
  placeholder = '搜索文档...',
  showButton = true 
}: GlobalSearchProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const history = useHistory();
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // ESC 关闭搜索
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 自动聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchResults = await searchDocuments(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    
    // 导航到结果页面
    if (result.url.startsWith('/')) {
      history.push(result.url);
    } else {
      window.open(result.url, '_blank');
    }
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    history.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const openSearchModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* 搜索触发按钮 */}
      {showButton && (
        <button 
          className={`${styles.searchTrigger} ${className}`}
          onClick={openSearchModal}
          aria-label="打开搜索"
        >
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchText}>{placeholder}</span>
          <span className={styles.searchShortcut}>
            <kbd>⌘</kbd><kbd>K</kbd>
          </span>
        </button>
      )}

      {/* 搜索模态框 */}
      {isOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchModal} ref={modalRef}>
            <div className={styles.searchHeader}>
              <div className={styles.searchInputContainer}>
                <SearchBox
                  onSearch={handleSearch}
                  onResultClick={handleResultClick}
                  placeholder={placeholder}
                  initialQuery={query}
                  isLoading={isLoading}
                  results={results.slice(0, 5)} // 只显示前5个结果
                  className={styles.modalSearchBox}
                />
              </div>
              <button 
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="关闭搜索"
              >
                ✕
              </button>
            </div>

            {/* 快速结果预览 */}
            {query && results.length > 0 && (
              <div className={styles.quickResults}>
                <div className={styles.resultsHeader}>
                  <span>找到 {results.length} 个结果</span>
                  {results.length > 5 && (
                    <button 
                      className={styles.viewAllButton}
                      onClick={handleViewAllResults}
                    >
                      查看全部结果 →
                    </button>
                  )}
                </div>
                
                <div className={styles.resultsList}>
                  {results.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className={styles.resultItem}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className={styles.resultIcon}>
                        {result.type === 'doc' && '📖'}
                        {result.type === 'faq' && '❓'}
                        {result.type === 'blog' && '📝'}
                        {result.type === 'page' && '📄'}
                      </div>
                      <div className={styles.resultContent}>
                        <div 
                          className={styles.resultTitle}
                          dangerouslySetInnerHTML={{ __html: result.title }}
                        />
                        <div 
                          className={styles.resultSnippet}
                          dangerouslySetInnerHTML={{ __html: result.snippet }}
                        />
                        <div className={styles.resultMeta}>
                          <span className={styles.resultCategory}>
                            {result.category}
                          </span>
                          <span className={styles.resultScore}>
                            {result.score}% 匹配
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 搜索提示 */}
            {!query && (
              <div className={styles.searchTips}>
                <div className={styles.tipsHeader}>
                  <span className={styles.tipsIcon}>💡</span>
                  <span>搜索技巧</span>
                </div>
                <div className={styles.tipsList}>
                  <div className={styles.tipItem}>
                    <kbd>↑</kbd><kbd>↓</kbd> 导航结果
                  </div>
                  <div className={styles.tipItem}>
                    <kbd>Enter</kbd> 选择结果
                  </div>
                  <div className={styles.tipItem}>
                    <kbd>Esc</kbd> 关闭搜索
                  </div>
                </div>
                
                <div className={styles.popularSearches}>
                  <div className={styles.popularHeader}>热门搜索</div>
                  <div className={styles.popularTags}>
                    {['DM数据库安装', 'SQL语法', '性能优化', 'JDBC连接'].map((tag, index) => (
                      <button
                        key={index}
                        className={styles.popularTag}
                        onClick={() => handleSearch(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 无结果状态 */}
            {query && !isLoading && results.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <div className={styles.noResultsText}>
                  未找到与 "{query}" 相关的结果
                </div>
                <div className={styles.noResultsTips}>
                  <p>建议：</p>
                  <ul>
                    <li>检查拼写是否正确</li>
                    <li>尝试使用更通用的关键词</li>
                    <li>使用空格分隔多个关键词</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}