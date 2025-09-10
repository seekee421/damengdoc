import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import SearchBox from '../components/Search/SearchBox';
import { SearchResult } from '../components/Search/SearchBox';
import { searchDocuments, getPopularSearches } from '../services/searchService';
import styles from './search.module.css';

interface SearchPageProps {
  location?: {
    search?: string;
  };
}

export default function SearchPage({ location }: SearchPageProps): React.ReactElement {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [popularSearches] = useState(getPopularSearches());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 从URL参数获取初始查询
  useEffect(() => {
    if (location?.search) {
      const urlParams = new URLSearchParams(location.search);
      const q = urlParams.get('q');
      if (q) {
        setQuery(q);
        handleSearch(q);
      }
    }
    
    // 加载搜索历史
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [location]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const searchResults = await searchDocuments(searchQuery);
      setResults(searchResults);
      
      // 添加到搜索历史
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      // 更新URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('q', searchQuery);
      window.history.replaceState({}, '', newUrl.toString());
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // 导航到对应页面
    if (result.url.startsWith('/')) {
      window.location.href = result.url;
    } else {
      window.open(result.url, '_blank');
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handlePopularClick = (popularQuery: string) => {
    setQuery(popularQuery);
    handleSearch(popularQuery);
  };

  return (
    <Layout
      title="搜索文档"
      description="搜索DM数据库文档，快速找到您需要的信息"
    >
      <div className={styles.searchPage}>
        {/* 搜索头部 */}
        <div className={styles.searchHeader}>
          <div className={styles.container}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                <span className={styles.titleIcon}>🔍</span>
                文档搜索
              </h1>
              <p className={styles.subtitle}>
                快速查找DM数据库相关文档、教程和解决方案
              </p>
            </div>
            
            {/* 搜索框 */}
            <div className={styles.searchBoxContainer}>
              <SearchBox
                onSearch={handleSearch}
                onResultClick={handleResultClick}
                placeholder="搜索文档内容、功能特性、常见问题..."
                initialQuery={query}
                isLoading={isLoading}
                results={results}
              />
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className={styles.searchContent}>
          <div className={styles.container}>
            <div className={styles.contentGrid}>
              {/* 左侧：搜索结果 */}
              <div className={styles.resultsSection}>
                {hasSearched ? (
                  <>
                    {/* 搜索结果统计 */}
                    <div className={styles.resultsStats}>
                      {isLoading ? (
                        <div className={styles.loadingStats}>
                          <div className={styles.loadingDot}></div>
                          <span>正在搜索...</span>
                        </div>
                      ) : (
                        <span>
                          找到 <strong>{results.length}</strong> 个相关结果
                          {query && (
                            <>
                              ，关键词：<strong>"{query}"</strong>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 搜索结果列表 */}
                    {!isLoading && results.length === 0 && (
                      <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>📄</div>
                        <h3>未找到相关结果</h3>
                        <p>尝试使用不同的关键词或查看下方的热门搜索</p>
                      </div>
                    )}

                    {results.length > 0 && (
                      <div className={styles.resultsList}>
                        {results.map((result) => (
                          <div
                            key={result.id}
                            className={styles.resultCard}
                            onClick={() => handleResultClick(result)}
                          >
                            <div className={styles.resultHeader}>
                              <div className={styles.resultType}>
                                {result.type === 'doc' && '📖'}
                                {result.type === 'faq' && '❓'}
                                {result.type === 'blog' && '📝'}
                                {result.type === 'page' && '📄'}
                              </div>
                              <h3 
                                className={styles.resultTitle}
                                dangerouslySetInnerHTML={{ __html: result.title }}
                              />
                              <div className={styles.resultScore}>
                                {result.score}%
                              </div>
                            </div>
                            
                            <p 
                              className={styles.resultSnippet}
                              dangerouslySetInnerHTML={{ __html: result.snippet }}
                            />
                            
                            <div className={styles.resultMeta}>
                              <span className={styles.resultCategory}>
                                {result.category}
                              </span>
                              {result.tags && result.tags.length > 0 && (
                                <div className={styles.resultTags}>
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className={styles.resultTag}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <span className={styles.resultDate}>
                                {result.lastModified}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* 搜索前的欢迎界面 */
                  <div className={styles.welcomeSection}>
                    <div className={styles.welcomeIcon}>🎯</div>
                    <h2>开始搜索</h2>
                    <p>在上方搜索框中输入关键词，快速找到您需要的文档内容</p>
                    
                    <div className={styles.searchTips}>
                      <h4>搜索技巧：</h4>
                      <ul>
                        <li>使用具体的关键词，如"安装"、"配置"、"SQL"</li>
                        <li>可以搜索功能名称、错误信息或操作步骤</li>
                        <li>支持中英文混合搜索</li>
                        <li>使用空格分隔多个关键词</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：搜索辅助 */}
              <div className={styles.sidebarSection}>
                {/* 搜索历史 */}
                {searchHistory.length > 0 && (
                  <div className={styles.sidebarCard}>
                    <h4 className={styles.sidebarTitle}>
                      <span className={styles.sidebarIcon}>🕒</span>
                      搜索历史
                    </h4>
                    <div className={styles.historyList}>
                      {searchHistory.slice(0, 5).map((historyItem, index) => (
                        <button
                          key={index}
                          className={styles.historyItem}
                          onClick={() => handleHistoryClick(historyItem)}
                        >
                          {historyItem}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热门搜索 */}
                <div className={styles.sidebarCard}>
                  <h4 className={styles.sidebarTitle}>
                    <span className={styles.sidebarIcon}>🔥</span>
                    热门搜索
                  </h4>
                  <div className={styles.popularList}>
                    {popularSearches.map((popularItem, index) => (
                      <button
                        key={index}
                        className={styles.popularItem}
                        onClick={() => handlePopularClick(popularItem)}
                      >
                        {popularItem}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 搜索帮助 */}
                <div className={styles.sidebarCard}>
                  <h4 className={styles.sidebarTitle}>
                    <span className={styles.sidebarIcon}>💡</span>
                    搜索帮助
                  </h4>
                  <div className={styles.helpContent}>
                    <div className={styles.helpItem}>
                      <strong>精确搜索：</strong>
                      <p>使用引号包围关键词，如 "DM数据库"</p>
                    </div>
                    <div className={styles.helpItem}>
                      <strong>排除词汇：</strong>
                      <p>使用减号排除词汇，如 安装 -Windows</p>
                    </div>
                    <div className={styles.helpItem}>
                      <strong>通配符：</strong>
                      <p>使用 * 代替未知字符，如 config*</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}