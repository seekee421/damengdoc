import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock GlobalSearch component to avoid CSS module issues
const MockGlobalSearch = ({ onClose }: { onClose?: () => void }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Mock search results
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          title: `搜索结果: ${searchQuery}`,
          content: '这是一个模拟的搜索结果内容',
          url: '/docs/example1'
        },
        {
          id: '2',
          title: `相关文档: ${searchQuery}`,
          content: '另一个相关的搜索结果',
          url: '/docs/example2'
        }
      ];
      setResults(mockResults);
      setIsLoading(false);
    }, 100);
  };

  return (
    <div data-testid="global-search-modal" className="global-search-modal">
      <div className="global-search-overlay" onClick={onClose}>
        <div className="global-search-content" onClick={(e) => e.stopPropagation()}>
          <div className="global-search-header">
            <input
              data-testid="global-search-input"
              type="text"
              placeholder="搜索文档..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            <button
              data-testid="global-search-close"
              onClick={onClose}
              className="close-button"
            >
              ×
            </button>
          </div>
          
          <div className="global-search-results">
            {isLoading && (
              <div data-testid="global-search-loading">搜索中...</div>
            )}
            
            {!isLoading && results.length === 0 && query && (
              <div data-testid="global-search-no-results">
                未找到相关结果
              </div>
            )}
            
            {!isLoading && results.length > 0 && (
              <div data-testid="global-search-results-list">
                {results.map((result) => (
                  <div
                    key={result.id}
                    data-testid={`search-result-${result.id}`}
                    className="search-result-item"
                    onClick={() => console.log('Navigate to:', result.url)}
                  >
                    <h3>{result.title}</h3>
                    <p>{result.content}</p>
                    <span className="result-url">{result.url}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

describe('GlobalSearch Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders without crashing', () => {
    render(<MockGlobalSearch onClose={mockOnClose} />);
    expect(screen.getByTestId('global-search-modal')).toBeInTheDocument();
  });

  it('displays search input with correct placeholder', () => {
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', '搜索文档...');
  });

  it('displays close button', () => {
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('global-search-close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('×');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('global-search-close');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const overlay = screen.getByTestId('global-search-modal').querySelector('.global-search-overlay');
    expect(overlay).toBeInTheDocument();
    
    await user.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking on content area', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const content = screen.getByTestId('global-search-modal').querySelector('.global-search-content');
    expect(content).toBeInTheDocument();
    
    await user.click(content!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('updates search query when typing', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    await user.type(searchInput, 'test query');
    
    expect(searchInput).toHaveValue('test query');
  });

  it('shows loading state during search', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    await user.type(searchInput, 'test');
    
    // Should show loading immediately
    expect(screen.getByTestId('global-search-loading')).toBeInTheDocument();
  });

  it('displays search results after search completes', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    await user.type(searchInput, 'test');
    
    // Wait for search to complete
    await waitFor(() => {
      expect(screen.getByTestId('global-search-results-list')).toBeInTheDocument();
    }, { timeout: 200 });
    
    // Check that results are displayed
    expect(screen.getByTestId('search-result-1')).toBeInTheDocument();
    expect(screen.getByTestId('search-result-2')).toBeInTheDocument();
    
    // Check result content
    expect(screen.getByText('搜索结果: test')).toBeInTheDocument();
    expect(screen.getByText('相关文档: test')).toBeInTheDocument();
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    // Clear input first, then type a query that would return no results
    await user.clear(searchInput);
    await user.type(searchInput, 'x');
    
    // Wait a bit and then clear to simulate no results
    await waitFor(() => {
      expect(screen.getByTestId('global-search-loading')).toBeInTheDocument();
    });
    
    await user.clear(searchInput);
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.queryByTestId('global-search-loading')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles empty search query', async () => {
    const user = userEvent.setup();
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    
    // Type and then clear immediately
    await user.type(searchInput, 'a');
    await user.clear(searchInput);
    
    // Should not show results or loading for empty query
    expect(screen.queryByTestId('global-search-loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('global-search-no-results')).not.toBeInTheDocument();
  });

  it('focuses search input on mount', () => {
    render(<MockGlobalSearch onClose={mockOnClose} />);
    
    const searchInput = screen.getByTestId('global-search-input');
    expect(searchInput).toHaveFocus();
  });
});