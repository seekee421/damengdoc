import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/index';

// Mock Docusaurus hooks and components
jest.mock('@docusaurus/useDocusaurusContext', () => ({
  __esModule: true,
  default: () => ({
    siteConfig: {
      title: '达梦数据库文档中心',
      tagline: '专业的达梦数据库产品文档、技术指南和最佳实践'
    }
  })
}));

jest.mock('@docusaurus/Link', () => {
  return function MockLink({ children, to, className, ...props }: any) {
    return (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@theme/Layout', () => {
  return function MockLayout({ children, title, description }: any) {
    return (
      <div data-testid="layout" data-title={title} data-description={description}>
        {children}
      </div>
    );
  };
});

jest.mock('@theme/Heading', () => {
  return function MockHeading({ children, as: Component = 'h1', className }: any) {
    return <Component className={className}>{children}</Component>;
  };
});

// Mock HomepageFeatures component
jest.mock('../../components/HomepageFeatures', () => {
  return function MockHomepageFeatures() {
    return (
      <section data-testid="homepage-features">
        <div className="container">
          <div className="row">
            <div className="col col--4" data-testid="feature-0">
              <h3>易于使用</h3>
              <p>Docusaurus 的设计初衷就是让您能够快速找到所需内容并理解产品。</p>
            </div>
            <div className="col col--4" data-testid="feature-1">
              <h3>专注于重要功能</h3>
              <p>Docusaurus 让您专注于文档，我们来做繁重的工作。</p>
            </div>
            <div className="col col--4" data-testid="feature-2">
              <h3>由 React 驱动</h3>
              <p>通过重用 React 扩展或自定义您的网站布局。</p>
            </div>
          </div>
        </div>
      </section>
    );
  };
});

// Mock GlobalSearch component
jest.mock('../../components/Search/GlobalSearch', () => {
  return function MockGlobalSearch({ placeholder }: any) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    
    return (
      <div data-testid="global-search">
        <input
          data-testid="search-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && (
          <div data-testid="search-modal" className="search-modal">
            <div data-testid="search-results">
              {query && (
                <div data-testid="search-result-item">
                  搜索结果: {query}
                </div>
              )}
            </div>
            <button 
              data-testid="close-search"
              onClick={() => setIsOpen(false)}
            >
              关闭
            </button>
          </div>
        )}
      </div>
    );
  };
});

// Mock all CSS modules
jest.mock('../../pages/index.module.css', () => ({}), { virtual: true });

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomePage Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  describe('Page Structure and Layout', () => {
    it('renders the complete homepage layout', () => {
      renderWithRouter(<HomePage />);
      
      // Check layout wrapper
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      
      // Check hero section
      expect(screen.getByText('达梦数据库文档中心')).toBeInTheDocument();
      expect(screen.getByText('专业的达梦数据库产品文档、技术指南和最佳实践')).toBeInTheDocument();
      
      // Check features section
      expect(screen.getByTestId('homepage-features')).toBeInTheDocument();
    });

    it('has proper SEO metadata', () => {
      renderWithRouter(<HomePage />);
      
      const layout = screen.getByTestId('layout');
      expect(layout).toHaveAttribute('data-title', '达梦数据库文档中心');
    });
  });

  describe('Navigation Elements', () => {
    it('renders primary navigation buttons', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByText('开始使用');
      const installButton = screen.getByText('安装指南');
      
      expect(startButton).toBeInTheDocument();
      expect(startButton.closest('a')).toHaveAttribute('href', '/docs/intro');
      
      expect(installButton).toBeInTheDocument();
      expect(installButton.closest('a')).toHaveAttribute('href', '/docs/installation');
    });

    it('navigation buttons have correct styling', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByText('开始使用').closest('a');
      const installButton = screen.getByText('安装指南').closest('a');
      
      expect(startButton).toHaveClass('button', 'button--primary', 'button--lg');
      expect(installButton).toHaveClass('button', 'button--outline', 'button--lg');
    });
  });

  describe('Search Functionality', () => {
    it('renders global search component', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('global-search')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('search input has correct placeholder', () => {
      renderWithRouter(<HomePage />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', '搜索文档内容...');
    });

    it('opens search modal when input is focused', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomePage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.click(searchInput);
      
      expect(screen.getByTestId('search-modal')).toBeInTheDocument();
    });

    it('performs search and displays results', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomePage />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '安装');
      
      await waitFor(() => {
        expect(screen.getByTestId('search-result-item')).toBeInTheDocument();
        expect(screen.getByText('搜索结果: 安装')).toBeInTheDocument();
      });
    });

    it('closes search modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomePage />);
      
      // Open search modal
      const searchInput = screen.getByTestId('search-input');
      await user.click(searchInput);
      
      expect(screen.getByTestId('search-modal')).toBeInTheDocument();
      
      // Close search modal
      const closeButton = screen.getByTestId('close-search');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('displays all feature cards', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('feature-0')).toBeInTheDocument();
      expect(screen.getByTestId('feature-1')).toBeInTheDocument();
      expect(screen.getByTestId('feature-2')).toBeInTheDocument();
    });

    it('feature cards have correct content', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('易于使用')).toBeInTheDocument();
      expect(screen.getByText('专注于重要功能')).toBeInTheDocument();
      expect(screen.getByText('由 React 驱动')).toBeInTheDocument();
    });

    it('feature descriptions are displayed', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Docusaurus 的设计初衷就是让您能够快速找到所需内容/)).toBeInTheDocument();
      expect(screen.getByText(/Docusaurus 让您专注于文档/)).toBeInTheDocument();
      expect(screen.getByText(/通过重用 React 扩展或自定义您的网站布局/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to different screen sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithRouter(<HomePage />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Check that layout still renders correctly
      expect(screen.getByText('达梦数据库文档中心')).toBeInTheDocument();
      expect(screen.getByTestId('global-search')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<HomePage />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('达梦数据库文档中心');
      
      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings).toHaveLength(3);
    });

    it('navigation links are accessible', () => {
      renderWithRouter(<HomePage />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('search input is accessible', () => {
      renderWithRouter(<HomePage />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder');
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      
      renderWithRouter(<HomePage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Expect render time to be reasonable (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });
  });
});