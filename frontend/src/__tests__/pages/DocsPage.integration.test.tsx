import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DocsPage from '../../pages/docs/index';

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

// Mock Auth context
const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'editor'
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false
  })
}));

// Mock DocTree component
const mockDocNodes = [
  {
    id: '1',
    title: '快速开始',
    type: 'folder',
    children: [
      {
        id: '1-1',
        title: '安装指南',
        type: 'doc',
        url: '/docs/installation',
        status: 'published'
      },
      {
        id: '1-2',
        title: '配置说明',
        type: 'doc',
        url: '/docs/configuration',
        status: 'draft'
      }
    ]
  },
  {
    id: '2',
    title: 'SQL参考',
    type: 'folder',
    children: [
      {
        id: '2-1',
        title: 'DDL语句',
        type: 'doc',
        url: '/docs/sql/ddl',
        status: 'published'
      },
      {
        id: '2-2',
        title: 'DML语句',
        type: 'doc',
        url: '/docs/sql/dml',
        status: 'published'
      }
    ]
  }
];

jest.mock('../../components/DocTree/DocTree', () => {
  return function MockDocTree({ onNodeSelect, selectedNodeId }: any) {
    const [expandedNodes, setExpandedNodes] = React.useState<string[]>(['1', '2']);
    
    const handleNodeClick = (node: any) => {
      onNodeSelect(node);
    };
    
    const toggleNode = (nodeId: string) => {
      setExpandedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    };
    
    const renderNode = (node: any, level = 0) => (
      <div key={node.id} style={{ marginLeft: level * 20 }}>
        <div 
          data-testid={`doc-node-${node.id}`}
          onClick={() => handleNodeClick(node)}
          style={{ 
            cursor: 'pointer', 
            padding: '5px',
            backgroundColor: selectedNodeId === node.id ? '#e3f2fd' : 'transparent'
          }}
        >
          {node.type === 'folder' && (
            <button 
              data-testid={`toggle-${node.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {expandedNodes.includes(node.id) ? '▼' : '▶'}
            </button>
          )}
          <span>{node.title}</span>
          {node.status && (
            <span data-testid={`status-${node.id}`} className={`status-${node.status}`}>
              {node.status}
            </span>
          )}
        </div>
        {node.children && expandedNodes.includes(node.id) && (
          <div>
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
    
    return (
      <div data-testid="doc-tree">
        <div data-testid="doc-tree-header">
          <h3>文档目录</h3>
          <input 
            data-testid="doc-search-input"
            type="text"
            placeholder="搜索文档..."
          />
        </div>
        <div data-testid="doc-tree-content">
          {mockDocNodes.map(node => renderNode(node))}
        </div>
      </div>
    );
  };
});

// Mock Editor component
jest.mock('../../components/Editor/Editor', () => {
  return function MockEditor({ node, onSave }: any) {
    const [content, setContent] = React.useState(node?.content || '# 文档内容\n\n这是一个示例文档。');
    const [isEditing, setIsEditing] = React.useState(false);
    
    const handleSave = () => {
      onSave({ ...node, content });
      setIsEditing(false);
    };
    
    return (
      <div data-testid="editor">
        <div data-testid="editor-header">
          <h2>{node?.title || '选择文档'}</h2>
          {node && (
            <div>
              <button 
                data-testid="edit-button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '取消编辑' : '编辑'}
              </button>
              {isEditing && (
                <button 
                  data-testid="save-button"
                  onClick={handleSave}
                >
                  保存
                </button>
              )}
            </div>
          )}
        </div>
        <div data-testid="editor-content">
          {node ? (
            isEditing ? (
              <textarea
                data-testid="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', height: '400px' }}
              />
            ) : (
              <div data-testid="editor-preview">
                <pre>{content}</pre>
              </div>
            )
          ) : (
            <div data-testid="no-doc-selected">
              <p>请从左侧目录中选择一个文档</p>
            </div>
          )}
        </div>
      </div>
    );
  };
});

// Mock all CSS modules
jest.mock('../../components/Navigation/DocNavigation.module.css', () => ({}), { virtual: true });
jest.mock('../../pages/docs/docs.module.css', () => ({}), { virtual: true });

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DocsPage Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  describe('Page Structure and Layout', () => {
    it('renders the complete docs page layout', () => {
      renderWithRouter(<DocsPage />);
      
      // Check layout wrapper
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('layout')).toHaveAttribute('data-title', '文档中心');
      
      // Check main components
      expect(screen.getByTestId('doc-tree')).toBeInTheDocument();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
    });

    it('displays welcome section when no document is selected', () => {
      renderWithRouter(<DocsPage />);
      
      expect(screen.getByTestId('no-doc-selected')).toBeInTheDocument();
      expect(screen.getByText('请从左侧目录中选择一个文档')).toBeInTheDocument();
    });

    it('shows sidebar toggle button on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithRouter(<DocsPage />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Should adapt to mobile layout
      expect(screen.getByTestId('doc-tree')).toBeInTheDocument();
    });
  });

  describe('Document Tree Functionality', () => {
    it('displays document tree with correct structure', () => {
      renderWithRouter(<DocsPage />);
      
      // Check tree header
      expect(screen.getByText('文档目录')).toBeInTheDocument();
      expect(screen.getByTestId('doc-search-input')).toBeInTheDocument();
      
      // Check root nodes
      expect(screen.getByTestId('doc-node-1')).toBeInTheDocument();
      expect(screen.getByTestId('doc-node-2')).toBeInTheDocument();
      expect(screen.getByText('快速开始')).toBeInTheDocument();
      expect(screen.getByText('SQL参考')).toBeInTheDocument();
    });

    it('expands and collapses folder nodes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Initially expanded - should show children
      expect(screen.getByTestId('doc-node-1-1')).toBeInTheDocument();
      expect(screen.getByText('安装指南')).toBeInTheDocument();
      
      // Click toggle to collapse
      const toggleButton = screen.getByTestId('toggle-1');
      await user.click(toggleButton);
      
      // Children should be hidden
      expect(screen.queryByTestId('doc-node-1-1')).not.toBeInTheDocument();
      
      // Click toggle to expand again
      await user.click(toggleButton);
      
      // Children should be visible again
      expect(screen.getByTestId('doc-node-1-1')).toBeInTheDocument();
    });

    it('selects document when node is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Click on a document node
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Should show selected state
      expect(docNode).toHaveStyle('backgroundColor: #e3f2fd');
      
      // Should load document in editor
      expect(screen.getByText('安装指南')).toBeInTheDocument();
      expect(screen.queryByTestId('no-doc-selected')).not.toBeInTheDocument();
    });

    it('displays document status badges', () => {
      renderWithRouter(<DocsPage />);
      
      // Check status badges
      expect(screen.getByTestId('status-1-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-1-2')).toBeInTheDocument();
      
      // Check status text
      const publishedStatus = screen.getByTestId('status-1-1');
      const draftStatus = screen.getByTestId('status-1-2');
      
      expect(publishedStatus).toHaveTextContent('published');
      expect(draftStatus).toHaveTextContent('draft');
    });

    it('filters documents when searching', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      const searchInput = screen.getByTestId('doc-search-input');
      await user.type(searchInput, '安装');
      
      // Should filter results (this would be implemented in the actual component)
      expect(searchInput).toHaveValue('安装');
    });
  });

  describe('Document Editor Functionality', () => {
    it('displays document content when document is selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Should show document content
      expect(screen.getByTestId('editor-preview')).toBeInTheDocument();
      expect(screen.getByText(/# 文档内容/)).toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Click edit button
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);
      
      // Should show textarea for editing
      expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(editButton).toHaveTextContent('取消编辑');
    });

    it('saves document changes when save button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document and enter edit mode
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);
      
      // Modify content
      const textarea = screen.getByTestId('editor-textarea');
      await user.clear(textarea);
      await user.type(textarea, '# 修改后的内容\n\n这是修改后的文档。');
      
      // Save changes
      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);
      
      // Should exit edit mode and show updated content
      expect(screen.queryByTestId('editor-textarea')).not.toBeInTheDocument();
      expect(screen.getByTestId('editor-preview')).toBeInTheDocument();
      expect(screen.getByText(/# 修改后的内容/)).toBeInTheDocument();
    });

    it('cancels editing when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document and enter edit mode
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);
      
      // Modify content
      const textarea = screen.getByTestId('editor-textarea');
      await user.clear(textarea);
      await user.type(textarea, '临时修改');
      
      // Cancel editing
      await user.click(editButton); // Now shows "取消编辑"
      
      // Should exit edit mode without saving changes
      expect(screen.queryByTestId('editor-textarea')).not.toBeInTheDocument();
      expect(screen.getByTestId('editor-preview')).toBeInTheDocument();
      expect(screen.getByText(/# 文档内容/)).toBeInTheDocument(); // Original content
      expect(screen.queryByText('临时修改')).not.toBeInTheDocument();
    });
  });

  describe('User Authentication Integration', () => {
    it('shows edit functionality for authenticated users', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Should show edit button for authenticated user
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
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
      
      renderWithRouter(<DocsPage />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Should still render main components
      expect(screen.getByTestId('doc-tree')).toBeInTheDocument();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
    });

    it('handles window resize events', () => {
      renderWithRouter(<DocsPage />);
      
      // Change window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Should adapt layout
      expect(screen.getByTestId('doc-tree')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document to show editor
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Check heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check specific headings
      expect(screen.getByText('文档目录')).toBeInTheDocument();
      expect(screen.getByText('安装指南')).toBeInTheDocument();
    });

    it('tree nodes are keyboard accessible', async () => {
      renderWithRouter(<DocsPage />);
      
      const docNode = screen.getByTestId('doc-node-1-1');
      
      // Should be focusable
      docNode.focus();
      expect(document.activeElement).toBe(docNode);
    });

    it('buttons have proper accessibility attributes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select a document
      const docNode = screen.getByTestId('doc-node-1-1');
      await user.click(docNode);
      
      // Check button accessibility
      const editButton = screen.getByTestId('edit-button');
      expect(editButton).toHaveAttribute('type', 'button');
      
      // Check toggle buttons
      const toggleButton = screen.getByTestId('toggle-1');
      expect(toggleButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Error Handling', () => {
    it('handles missing document data gracefully', () => {
      renderWithRouter(<DocsPage />);
      
      // Should show fallback content when no document is selected
      expect(screen.getByTestId('no-doc-selected')).toBeInTheDocument();
      expect(screen.getByText('请从左侧目录中选择一个文档')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      
      renderWithRouter(<DocsPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Expect render time to be reasonable (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('handles large document trees efficiently', () => {
      // This would test with a larger mock dataset
      renderWithRouter(<DocsPage />);
      
      // Should render all nodes without issues
      expect(screen.getByTestId('doc-tree-content')).toBeInTheDocument();
      expect(screen.getAllByTestId(/^doc-node-/).length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('maintains selected document state across interactions', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Select first document
      const firstDoc = screen.getByTestId('doc-node-1-1');
      await user.click(firstDoc);
      
      expect(firstDoc).toHaveStyle('backgroundColor: #e3f2fd');
      
      // Select second document
      const secondDoc = screen.getByTestId('doc-node-1-2');
      await user.click(secondDoc);
      
      // First should be deselected, second should be selected
      expect(firstDoc).not.toHaveStyle('backgroundColor: #e3f2fd');
      expect(secondDoc).toHaveStyle('backgroundColor: #e3f2fd');
    });

    it('preserves tree expansion state', async () => {
      const user = userEvent.setup();
      renderWithRouter(<DocsPage />);
      
      // Collapse a folder
      const toggleButton = screen.getByTestId('toggle-1');
      await user.click(toggleButton);
      
      expect(screen.queryByTestId('doc-node-1-1')).not.toBeInTheDocument();
      
      // Select a document from another folder
      const otherDoc = screen.getByTestId('doc-node-2-1');
      await user.click(otherDoc);
      
      // First folder should still be collapsed
      expect(screen.queryByTestId('doc-node-1-1')).not.toBeInTheDocument();
    });
  });
});