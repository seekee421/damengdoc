import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../../pages/search';

// Mock Docusaurus components
jest.mock('@theme/Layout', () => {
  return function MockLayout({ children, title, description }: any) {
    return (
      <div data-testid="layout" data-title={title} data-description={description}>
        {children}
      </div>
    );
  };
});

// Mock search service
jest.mock('../../components/Search/searchService', () => ({
  searchDocuments: jest.fn(),
  getPopularSearches: jest.fn(),
  getSearchHistory: jest.fn(),
  addToSearchHistory: jest.fn(),
  trackSearch: jest.fn()
}));

// Mock SearchBox component
jest.mock('../../components/Search/SearchBox', () => {
  return function MockSearchBox({ onSearch, onResultClick, placeholder, initialQuery, isLoading, results }: any) {
    const [query, setQuery] = React.useState(initialQuery || '');
    
    React.useEffect(() => {
      if (initialQuery) {
        setQuery(initialQuery);
      }
    }, [initialQuery]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    };
    
    return (
      <div data-testid="search-box">
        <input
          data-testid="search-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
        />
        {isLoading && <div data-testid="loading-indicator">搜索中...</div>}
        {results && results.length > 0 && (
          <div data-testid="search-results">
            {results.map((result: any) => (
              <div
                key={result.id}
                data-testid={`search-result-${result.id}`}
                onClick={() => onResultClick(result)}
                style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}
              >
                <h3>{result.title}</h3>
                <p>{result.snippet}</p>
                <div>
                  <span>类型: {result.type}</span>
                  <span> | 分类: {result.category}</span>
                  <span> | 评分: {result.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {results && results.length === 0 && query && (
          <div data-testid="no-results">未找到相关结果</div>
        )}
      </div>
    );
  };
});

// Mock all CSS modules
jest.mock('../../pages/search.module.css', () => ({}), { virtual: true });

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock search service functions
const mockSearchDocuments = require('../../components/Search/searchService').searchDocuments;
const mockGetPopularSearches = require('../../components/Search/searchService').getPopularSearches;
const mockGetSearchHistory = require('../../components/Search/searchService').getSearchHistory;
const mockAddToSearchHistory = require('../../components/Search/searchService').addToSearchHistory;
const mockTrackSearch = require('../../components/Search/searchService').trackSearch;

describe('SearchPage Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSearchDocuments.mockResolvedValue([]);
    mockGetPopularSearches.mockReturnValue([
      { query: 'DM数据库安装', count: 150 },
      { query: 'SQL语法', count: 120 },
      { query: '性能优化', count: 100 }
    ]);
    mockGetSearchHistory.mockReturnValue([
      { query: '备份恢复', timestamp: Date.now() - 1000 },
      { query: '用户管理', timestamp: Date.now() - 2000 }
    ]);
  });

  describe('Page Structure and Layout', () => {
    it('renders the complete search page layout', () => {
      renderWithRouter(<SearchPage />);
      
      // Check layout wrapper
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('layout')).toHaveAttribute('data-title', '搜索文档');
      expect(screen.getByTestId('layout')).toHaveAttribute('data-description', '搜索DM数据库文档，快速找到您需要的信息');
      
      // Check main sections
      expect(screen.getByText('文档搜索')).toBeInTheDocument();
      expect(screen.getByText('快速查找DM数据库相关文档、教程和解决方案')).toBeInTheDocument();
      expect(screen.getByTestId('search-box')).toBeInTheDocument();
    });

    it('displays welcome section when no search has been performed', () => {
      renderWithRouter(<SearchPage />);
      
      expect(screen.getByText('开始搜索')).toBeInTheDocument();
      expect(screen.getByText('在上方搜索框中输入关键词，快速找到您需要的文档内容')).toBeInTheDocument();
      expect(screen.getByText('搜索技巧：')).toBeInTheDocument();
    });

    it('displays search tips in welcome section', () => {
      renderWithRouter(<SearchPage />);
      
      expect(screen.getByText(/使用具体的关键词/)).toBeInTheDocument();
      expect(screen.getByText(/可以搜索功能名称、错误信息或操作步骤/)).toBeInTheDocument();
      expect(screen.getByText(/支持中英文混合搜索/)).toBeInTheDocument();
      expect(screen.getByText(/使用空格分隔多个关键词/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search box with correct placeholder', () => {
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', '搜索文档内容、功能特性、常见问题...');
    });

    it('performs search when user types in search box', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: '1',
          title: 'DM数据库安装指南',
          snippet: '详细介绍DM数据库的安装步骤...',
          url: '/docs/installation',
          type: 'doc',
          category: '安装部署',
          tags: ['安装', '部署'],
          score: 95,
          lastModified: '2024-01-15'
        }
      ];
      
      mockSearchDocuments.mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '安装');
      
      await waitFor(() => {
        expect(mockSearchDocuments).toHaveBeenCalledWith('安装', expect.any(Object));
      });
    });

    it('displays search results when search is performed', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: '1',
          title: 'DM数据库安装指南',
          snippet: '详细介绍DM数据库的安装步骤...',
          url: '/docs/installation',
          type: 'doc',
          category: '安装部署',
          tags: ['安装', '部署'],
          score: 95,
          lastModified: '2024-01-15'
        },
        {
          id: '2',
          title: 'SQL语法参考',
          snippet: 'DM数据库SQL语法详细说明...',
          url: '/docs/sql',
          type: 'doc',
          category: 'SQL参考',
          tags: ['SQL', '语法'],
          score: 88,
          lastModified: '2024-01-20'
        }
      ];
      
      mockSearchDocuments.mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '数据库');
      
      await waitFor(() => {
        expect(screen.getByTestId('search-result-1')).toBeInTheDocument();
        expect(screen.getByTestId('search-result-2')).toBeInTheDocument();
        expect(screen.getByText('DM数据库安装指南')).toBeInTheDocument();
        expect(screen.getByText('SQL语法参考')).toBeInTheDocument();
      });
    });

    it('displays no results message when search returns empty', async () => {
      const user = userEvent.setup();
      mockSearchDocuments.mockResolvedValue([]);
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '不存在的内容');
      
      await waitFor(() => {
        expect(screen.getByTestId('no-results')).toBeInTheDocument();
        expect(screen.getByText('未找到相关结果')).toBeInTheDocument();
      });
    });

    it('shows loading indicator during search', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSearchDocuments.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '测试');
      
      // Should show loading indicator
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      expect(screen.getByText('搜索中...')).toBeInTheDocument();
    });

    it('handles search result clicks', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: '1',
          title: 'DM数据库安装指南',
          snippet: '详细介绍DM数据库的安装步骤...',
          url: '/docs/installation',
          type: 'doc',
          category: '安装部署',
          tags: ['安装', '部署'],
          score: 95,
          lastModified: '2024-01-15'
        }
      ];
      
      mockSearchDocuments.mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '安装');
      
      await waitFor(() => {
        expect(screen.getByTestId('search-result-1')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('search-result-1');
      await user.click(resultItem);
      
      // Should track the search and add to history
      expect(mockTrackSearch).toHaveBeenCalled();
      expect(mockAddToSearchHistory).toHaveBeenCalled();
    });
  });

  describe('Search History and Popular Searches', () => {
    it('displays search history when available', () => {
      renderWithRouter(<SearchPage />);
      
      expect(screen.getByText('搜索历史')).toBeInTheDocument();
      expect(screen.getByText('备份恢复')).toBeInTheDocument();
      expect(screen.getByText('用户管理')).toBeInTheDocument();
    });

    it('displays popular searches', () => {
      renderWithRouter(<SearchPage />);
      
      expect(screen.getByText('热门搜索')).toBeInTheDocument();
      expect(screen.getByText('DM数据库安装')).toBeInTheDocument();
      expect(screen.getByText('SQL语法')).toBeInTheDocument();
      expect(screen.getByText('性能优化')).toBeInTheDocument();
    });

    it('allows clicking on search history items', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchPage />);
      
      const historyItem = screen.getByText('备份恢复');
      await user.click(historyItem);
      
      // Should trigger a new search
      await waitFor(() => {
        expect(mockSearchDocuments).toHaveBeenCalledWith('备份恢复', expect.any(Object));
      });
    });

    it('allows clicking on popular search items', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchPage />);
      
      const popularItem = screen.getByText('DM数据库安装');
      await user.click(popularItem);
      
      // Should trigger a new search
      await waitFor(() => {
        expect(mockSearchDocuments).toHaveBeenCalledWith('DM数据库安装', expect.any(Object));
      });
    });
  });

  describe('URL Query Parameter Handling', () => {
    it('performs search based on URL query parameter', () => {
      // Mock location with search query
      const mockLocation = {
        search: '?q=安装指南',
        pathname: '/search'
      };
      
      // Mock URLSearchParams
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });
      
      renderWithRouter(<SearchPage />);
      
      // Should perform search with query from URL
      expect(mockSearchDocuments).toHaveBeenCalledWith('安装指南', expect.any(Object));
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithRouter(<SearchPage />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Check that layout still renders correctly
      expect(screen.getByText('文档搜索')).toBeInTheDocument();
      expect(screen.getByTestId('search-box')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<SearchPage />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('文档搜索');
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    it('search input is accessible', () => {
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    it('search results are accessible', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: '1',
          title: 'DM数据库安装指南',
          snippet: '详细介绍DM数据库的安装步骤...',
          url: '/docs/installation',
          type: 'doc',
          category: '安装部署',
          tags: ['安装', '部署'],
          score: 95,
          lastModified: '2024-01-15'
        }
      ];
      
      mockSearchDocuments.mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '安装');
      
      await waitFor(() => {
        const resultItem = screen.getByTestId('search-result-1');
        expect(resultItem).toHaveAttribute('style');
        expect(resultItem).toHaveStyle('cursor: pointer');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles search service errors gracefully', async () => {
      const user = userEvent.setup();
      mockSearchDocuments.mockRejectedValue(new Error('Search service error'));
      
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '测试');
      
      // Should not crash and should handle error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('search-box')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      
      renderWithRouter(<SearchPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Expect render time to be reasonable (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('debounces search requests', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchPage />);
      
      const searchInput = screen.getByTestId('search-input');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'test');
      
      // Should not call search for every character
      await waitFor(() => {
        expect(mockSearchDocuments).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
});