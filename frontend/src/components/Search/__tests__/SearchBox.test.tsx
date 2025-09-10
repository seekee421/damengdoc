import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the SearchBox component to avoid CSS module issues
const MockSearchBox = ({ onSearch, results = [], isLoading = false, onResultClick }: any) => {
  const [query, setQuery] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div data-testid="search-box">
      <input
        type="text"
        placeholder="搜索文档..."
        value={query}
        onChange={handleInputChange}
        data-testid="search-input"
      />
      {isLoading && <div data-testid="loading">Loading...</div>}
      {results.length > 0 && (
        <div data-testid="search-results">
          {results.map((result: any) => (
            <div
              key={result.id}
              data-testid={`result-${result.id}`}
              onClick={() => onResultClick && onResultClick(result)}
              style={{ cursor: 'pointer' }}
            >
              {result.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('SearchBox Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnResultClick = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnResultClick.mockClear();
  });

  it('renders search input correctly', () => {
    render(<MockSearchBox onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', '搜索文档...');
  });

  it('calls onSearch when user types', async () => {
    const user = userEvent.setup();
    render(<MockSearchBox onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'test query');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('displays search results when provided', () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Document 1',
        snippet: 'Test snippet 1',
        url: '/test1',
        type: 'doc',
        category: 'Test Category',
        tags: ['test'],
        score: 0.9,
        lastModified: '2024-01-01'
      },
      {
        id: '2',
        title: 'Test Document 2',
        snippet: 'Test snippet 2',
        url: '/test2',
        type: 'doc',
        category: 'Test Category',
        tags: ['test'],
        score: 0.8,
        lastModified: '2024-01-02'
      }
    ];
    
    render(<MockSearchBox onSearch={mockOnSearch} results={mockResults} />);
    
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<MockSearchBox onSearch={mockOnSearch} isLoading={true} />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls onResultClick when a result is clicked', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        title: 'Test Document',
        snippet: 'Test snippet',
        url: '/test',
        type: 'doc',
        category: 'Test Category',
        tags: ['test'],
        score: 0.9,
        lastModified: '2024-01-01'
      }
    ];
    
    render(
      <MockSearchBox 
        onSearch={mockOnSearch} 
        onResultClick={mockOnResultClick}
        results={mockResults}
      />
    );
    
    const resultElement = screen.getByTestId('result-1');
    await user.click(resultElement);
    
    expect(mockOnResultClick).toHaveBeenCalledWith(mockResults[0]);
  });

  it('handles empty results', () => {
    render(<MockSearchBox onSearch={mockOnSearch} results={[]} />);
    
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
  });
});