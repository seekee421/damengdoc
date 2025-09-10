// Online Editor Demo Page - Based on Ant Design Specifications

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import styles from './editor.module.css';

// Vditor types
interface VditorInstance {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () => void;
}

// Mock Vditor for type safety
const Vditor = {
  new: (element: HTMLElement, options: any): VditorInstance => ({
    setValue: (value: string) => {
      element.innerHTML = `<div style="padding: 20px; font-family: monospace; white-space: pre-wrap;">${value}</div>`;
    },
    getValue: () => element.textContent || '',
    destroy: () => {
      element.innerHTML = '';
    }
  })
};

// Mock document tree data
interface DocTreeNode {
  key: string;
  title: string;
  children?: DocTreeNode[];
  isLeaf?: boolean;
}

const getMockDocTree = (): DocTreeNode[] => [
  {
    key: '1',
    title: 'DM Database Requirements Document',
    children: [
      {
        key: '1-1',
        title: 'Deployment and Access Methods',
        children: [
          { 
            key: '1-1-1', 
            title: 'Private Deployment ★★★', 
            isLeaf: true 
          },
          { 
            key: '1-1-2', 
            title: 'Multi-platform Access Support ★★', 
            isLeaf: true 
          }
        ]
      },
      {
        key: '1-2',
        title: 'Language and Style of Product Online Documentation Center',
        children: [
          { 
            key: '1-2-1', 
            title: 'Nature and Effects of Product Online Documentation Center', 
            isLeaf: true 
          }
        ]
      },
      {
        key: '1-3',
        title: 'Document Permission Control',
        children: [
          { 
            key: '1-3-1', 
            title: 'Document Directory Management ★★★★★★', 
            isLeaf: true 
          }
        ]
      }
    ]
  }
];

// Outline data structure
interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children?: OutlineItem[];
}

const getMockOutline = (): OutlineItem[] => [
  { 
    id: '1', 
    title: 'Deployment and Access Methods', 
    level: 1 
  },
  { 
    id: '1-1', 
    title: 'Private Deployment ★★★', 
    level: 2 
  },
  { 
    id: '1-2', 
    title: 'Multi-platform Access Support ★★', 
    level: 2 
  },
  { 
    id: '2', 
    title: 'Language and Style of Product Online Documentation Center', 
    level: 1 
  },
  { 
    id: '2-1', 
    title: 'Nature and Effects of Product Online Documentation Center', 
    level: 2 
  },
  { 
    id: '3', 
    title: 'Document Permission Control', 
    level: 1 
  },
  { 
    id: '3-1', 
    title: 'Document Directory Management ★★★★★★', 
    level: 2 
  }
];

const EditorPage: React.FC = () => {
  const [selectedTreeNode, setSelectedTreeNode] = useState<string>('1-1-1');
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [vditor, setVditor] = useState<VditorInstance | undefined>(undefined);
  const vditorRef = useRef<HTMLDivElement>(null);

  // Initialize editor
  useEffect(() => {
    if (vditorRef.current && !vditor) {
      const vd = Vditor.new(vditorRef.current, {
        placeholder: 'Start writing your documentation...'
      });
      
      // Initialize with content
      setVditor(vd);
      vd.setValue(getInitialContent());
    }

    return () => {
      if (vditor) {
        vditor.destroy();
        setVditor(undefined);
      }
    };
  }, [vditor]);

  const getInitialContent = useCallback(() => {
    return `# Welcome to DM Database Online Editor

This is a powerful online documentation editor supporting:

## Main Features

**Markdown Editing**: Supports standard Markdown syntax
**Real-time Preview**: See changes instantly as you type
**Rich Toolbar**: Complete set of formatting tools
**Export Function**: Export to multiple formats
**Responsive Design**: Works perfectly on all devices

## Getting Started

1. Select a document from the left tree
2. Start editing in this area
3. Use the outline on the right for navigation
4. Save your work using Ctrl+S

### Code Example

\`\`\`sql
SELECT * FROM dm_database 
WHERE version = 'DM8.1.3';
\`\`\`

### Table Example

| Feature | Status | Priority |
|---------|--------|----------|
| Private Deployment | ✅ | High |
| Multi-platform Access | ✅ | Medium |
| Permission Control | 🔄 | High |

---

> 💡 **Tip**: Use the toolbar above for quick formatting options!

Happy writing! 🚀`;
  }, []);

  const docTree = useMemo(() => getMockDocTree(), []);
  const outline = useMemo(() => getMockOutline(), []);

  const handleTreeNodeSelect = useCallback((nodeKey: string) => {
    setSelectedTreeNode(nodeKey);
    // Simulate loading different content based on selection
    if (vditor) {
      const content = getContentForNode(nodeKey);
      vditor.setValue(content);
    }
  }, [vditor]);

  const getContentForNode = (nodeKey: string): string => {
    const contentMap: Record<string, string> = {
      '1-1-1': `# Private Deployment ★★★

## Overview
Private deployment ensures complete control over your DM Database documentation environment.

## Benefits
- **Security**: Full control over data and access
- **Customization**: Tailor the environment to your needs
- **Performance**: Optimized for your infrastructure

## Implementation Steps
1. Server preparation
2. Database installation
3. Configuration setup
4. Security hardening`,
      '1-1-2': `# Multi-platform Access Support ★★

## Supported Platforms
- Web browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS, Android)
- Desktop applications

## Features
- Responsive design
- Touch-friendly interface
- Offline capabilities
- Synchronization across devices`,
      '1-2-1': `# Nature and Effects of Product Online Documentation Center

## Documentation Philosophy
Our documentation center follows modern technical writing principles:

### Clarity
- Clear, concise language
- Logical structure
- Visual aids and examples

### Accessibility
- Multi-language support
- Screen reader compatibility
- Keyboard navigation

### Maintainability
- Version control
- Collaborative editing
- Automated testing`,
      '1-3-1': `# Document Directory Management ★★★★★★

## Hierarchical Structure
The documentation follows a well-organized hierarchy:

\`\`\`
DM Database Docs/
├── Getting Started/
│   ├── Installation
│   ├── Quick Start
│   └── Configuration
├── User Guide/
│   ├── Basic Operations
│   ├── Advanced Features
│   └── Best Practices
└── API Reference/
    ├── Database APIs
    ├── Management APIs
    └── Integration APIs
\`\`\`

## Permission Levels
- **Read**: View documentation
- **Write**: Edit existing content
- **Admin**: Full management access
- **Owner**: Complete control`
    };
    
    return contentMap[nodeKey] || getInitialContent();
  };

  const renderTreeNode = (node: DocTreeNode): React.ReactNode => {
    const isSelected = selectedTreeNode === node.key;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.key} className={styles.treeNode}>
        <div 
          className={`${styles.treeNodeTitle} ${isSelected ? styles.selected : ''}`}
          onClick={() => handleTreeNodeSelect(node.key)}
        >
          {hasChildren && (
            <span className={styles.treeNodeIcon}>
              {isTreeCollapsed ? '📁' : '📂'}
            </span>
          )}
          {!hasChildren && (
            <span className={styles.treeNodeIcon}>📄</span>
          )}
          <span className={styles.treeNodeText}>{node.title}</span>
        </div>
        {hasChildren && !isTreeCollapsed && (
          <div className={styles.treeNodeChildren}>
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const renderOutlineItem = (item: OutlineItem): React.ReactNode => {
    return (
      <div 
        key={item.id} 
        className={`${styles.outlineItem} ${styles[`level${item.level}`]}`}
        onClick={() => {
          // Scroll to heading in editor
          console.log('Navigate to:', item.title);
        }}
      >
        <span className={styles.outlineText}>{item.title}</span>
      </div>
    );
  };

  return (
    <Layout
      title="Online Editor"
      description="DM Database Online Documentation Editor"
    >
      <div className={styles.editorContainer}>
        {/* Document Tree Sidebar */}
        <div className={`${styles.sidebar} ${styles.leftSidebar} ${isTreeCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>
              <span className={styles.sidebarIcon}>📚</span>
              Document Tree
            </h3>
            <button 
              className={styles.collapseButton}
              onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
              aria-label={isTreeCollapsed ? 'Expand tree' : 'Collapse tree'}
            >
              {isTreeCollapsed ? '▶️' : '◀️'}
            </button>
          </div>
          {!isTreeCollapsed && (
            <div className={styles.sidebarContent}>
              <div className={styles.treeContainer}>
                {docTree.map(node => renderTreeNode(node))}
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className={styles.mainContent}>
          <div className={styles.editorHeader}>
            <div className={styles.editorTitle}>
              <span className={styles.editorIcon}>✏️</span>
              <h2>Online Documentation Editor</h2>
            </div>
            <div className={styles.editorActions}>
              <button className={styles.actionButton} title="Save Document">
                <span className={styles.actionIcon}>💾</span>
                Save
              </button>
              <button className={styles.actionButton} title="Export Document">
                <span className={styles.actionIcon}>📤</span>
                Export
              </button>
              <button className={styles.actionButton} title="Share Document">
                <span className={styles.actionIcon}>🔗</span>
                Share
              </button>
            </div>
          </div>
          <div className={styles.editorWrapper}>
            <div ref={vditorRef} className={styles.vditorContainer} />
          </div>
        </div>

        {/* Outline Sidebar */}
        <div className={`${styles.sidebar} ${styles.rightSidebar} ${isOutlineCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>
              <span className={styles.sidebarIcon}>📋</span>
              Outline
            </h3>
            <button 
              className={styles.collapseButton}
              onClick={() => setIsOutlineCollapsed(!isOutlineCollapsed)}
              aria-label={isOutlineCollapsed ? 'Expand outline' : 'Collapse outline'}
            >
              {isOutlineCollapsed ? '◀️' : '▶️'}
            </button>
          </div>
          {!isOutlineCollapsed && (
            <div className={styles.sidebarContent}>
              <div className={styles.outlineContainer}>
                {outline.map(item => renderOutlineItem(item))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;