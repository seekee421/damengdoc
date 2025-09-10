// 在线编辑器演示页面 - 基于Ant Design设计规范

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import styles from './editor.module.css';

// 模拟文档目录数据
interface DocTreeNode {
  key: string;
  title: string;
  children?: DocTreeNode[];
  isLeaf?: boolean;
}

const getMockDocTree = (): DocTreeNode[] => [
  {
    key: '1',
    title: translate({
      id: 'editor.docTree.title',
      message: '达梦数据库需求文档',
      description: 'Document tree root title'
    }),
    children: [
      {
        key: '1-1',
        title: translate({
          id: 'editor.docTree.deployment',
          message: '部署及访问方式',
          description: 'Document tree deployment section'
        }),
        children: [
          { 
            key: '1-1-1', 
            title: translate({
              id: 'editor.docTree.privateDeployment',
              message: '私有化部署★★★',
              description: 'Private deployment option'
            }), 
            isLeaf: true 
          },
          { 
            key: '1-1-2', 
            title: translate({
              id: 'editor.docTree.multiAccess',
              message: '支持多端访问★★',
              description: 'Multi-platform access option'
            }), 
            isLeaf: true 
          }
        ]
      },
      {
        key: '1-2',
        title: translate({
          id: 'editor.docTree.languageStyle',
          message: '产品在线文档中心的语言和性质风格',
          description: 'Language and style section'
        }),
        children: [
          { 
            key: '1-2-1', 
            title: translate({
              id: 'editor.docTree.docNature',
              message: '产品在线文档中心文档性质及效果',
              description: 'Document nature subsection'
            }), 
            isLeaf: true 
          }
        ]
      },
      {
        key: '1-3',
        title: translate({
          id: 'editor.docTree.permissions',
          message: '文档权限控制',
          description: 'Permission control section'
        }),
        children: [
          { 
            key: '1-3-1', 
            title: translate({
              id: 'editor.docTree.directoryManagement',
              message: '文档目录管理★★★★★★',
              description: 'Directory management option'
            }), 
            isLeaf: true 
          }
        ]
      }
    ]
  }
];

// 模拟大纲数据
interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children?: OutlineItem[];
}

const getMockOutline = (): OutlineItem[] => [
  { 
    id: '1', 
    title: translate({
      id: 'editor.outline.deployment',
      message: '部署及访问方式',
      description: 'Outline deployment section'
    }), 
    level: 1 
  },
  { 
    id: '1-1', 
    title: translate({
      id: 'editor.outline.privateDeployment',
      message: '私有化部署★★★',
      description: 'Outline private deployment'
    }), 
    level: 2 
  },
  { 
    id: '1-2', 
    title: translate({
      id: 'editor.outline.multiAccess',
      message: '支持多端访问★★',
      description: 'Outline multi-platform access'
    }), 
    level: 2 
  },
  { 
    id: '2', 
    title: translate({
      id: 'editor.outline.languageStyle',
      message: '产品在线文档中心的语言和性质风格',
      description: 'Outline language and style'
    }), 
    level: 1 
  },
  { 
    id: '2-1', 
    title: translate({
      id: 'editor.outline.docNature',
      message: '产品在线文档中心文档性质及效果',
      description: 'Outline document nature'
    }), 
    level: 2 
  },
  { 
    id: '3', 
    title: translate({
      id: 'editor.outline.permissions',
      message: '文档权限控制',
      description: 'Outline permission control'
    }), 
    level: 1 
  },
  { 
    id: '3-1', 
    title: translate({
      id: 'editor.outline.directoryManagement',
      message: '文档目录管理★★★★★★',
      description: 'Outline directory management'
    }), 
    level: 2 
  }
];

const EditorPage: React.FC = () => {
  const [content, setContent] = useState(`# 欢迎使用在线编辑器

这是一个功能强大的在线文档编辑器，支持：

## 主要功能

- **Markdown 编辑**：支持标准 Markdown 语法
- **实时预览**：边写边看，所见即所得
- **语法高亮**：代码块语法高亮显示
- **搜索替换**：快速查找和替换文本
- **多种模式**：编辑、预览、分屏模式

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello('World');
\`\`\`

## 表格支持

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown | ✅ | 完全支持 |
| HTML | ✅ | 基础支持 |
| 纯文本 | ✅ | 完全支持 |

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

> **提示**：使用工具栏快捷按钮或键盘快捷键来提高编辑效率！
`);
  
  const [showToc, setShowToc] = useState(true);
  const [selectedDocKey, setSelectedDocKey] = useState<string>('1-1-1');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1', '1-1']);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [activeOutlineId, setActiveOutlineId] = useState<string>('');
  const vditorRef = useRef<Vditor | null>(null);

  // 初始化Vditor编辑器
  useEffect(() => {
    if (vditorRef.current) {
      return;
    }
    
    vditorRef.current = new Vditor('vditor', {
      height: 'calc(100vh - 120px)',
      width: '100%',
      mode: 'sv', // 即时渲染模式
      value: content,
      cache: {
        enable: false
      },
      preview: {
        delay: 300,
        mode: 'both',
        parse: (element) => {
          // 解析大纲
          const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const newOutline: OutlineItem[] = [];
          headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const id = `heading-${index}`;
            heading.id = id;
            newOutline.push({
              id,
              title: heading.textContent || '',
              level
            });
          });
          // 这里可以更新大纲状态
        }
      },
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'table',
        'link',
        'upload',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'edit-mode',
        'both',
        'preview',
        'outline',
        'content-theme',
        'code-theme'
      ],
      input: (value) => {
        setContent(value);
      },
      focus: (value) => {
        console.log('编辑器获得焦点');
      },
      blur: (value) => {
        console.log('编辑器失去焦点');
      },
      esc: (value) => {
        console.log('按下ESC键');
      },
      ctrlEnter: (value) => {
        console.log('按下Ctrl+Enter');
      },
      select: (value) => {
        console.log('选中文本:', value);
      }
    });
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (vditorRef.current) {
      vditorRef.current.setValue(newContent);
    }
  }, []);

  const handleSave = useCallback(() => {
    // 这里可以实现保存逻辑
    console.log('保存文档:', content);
    alert('文档已保存！');
  }, [content]);

  const handleExport = useCallback(() => {
    // 这里可以实现导出逻辑
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const handleLinkClick = useCallback((href: string, event: React.MouseEvent) => {
    console.log('链接点击:', href);
    // 这里可以实现自定义链接处理逻辑
  }, []);

  const handleImageLoad = useCallback((src: string, alt?: string) => {
    console.log('图片加载成功:', src, alt);
  }, []);

  const handleImageError = useCallback((src: string, alt?: string) => {
    console.log('图片加载失败:', src, alt);
  }, []);

  // 文档树选择处理
  const handleDocSelect = useCallback((selectedKeys: string[]) => {
    if (selectedKeys.length > 0) {
      setSelectedDocKey(selectedKeys[0]);
      // 这里可以根据选中的文档加载对应内容
      console.log('选中文档:', selectedKeys[0]);
    }
  }, []);

  // 文档树展开处理
  const handleDocExpand = useCallback((expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  }, []);

  // 大纲点击处理
  const handleOutlineClick = useCallback((id: string) => {
    console.log('跳转到章节:', id);
    // 这里可以实现滚动到对应章节的逻辑
  }, []);

  // 渲染文档树节点
  const renderDocTreeNode = useCallback((node: DocTreeNode) => {
    return {
      key: node.key,
      title: (
        <span className={styles.treeNodeTitle}>
          {node.isLeaf ? '📄' : '📁'} {node.title}
        </span>
      ),
      children: node.children?.map(renderDocTreeNode)
    };
  }, []);

  // 渲染大纲项
  const renderOutlineItem = useCallback((item: OutlineItem) => (
    <div 
      key={item.id}
      className={`${styles.outlineItem} ${styles[`outlineLevel${item.level}`]}`}
      onClick={() => handleOutlineClick(item.id)}
    >
      {item.title}
    </div>
  ), [handleOutlineClick]);

  const treeData = useMemo(() => getMockDocTree().map(renderDocTreeNode), [renderDocTreeNode]);

  return (
    <Layout
      title={translate({
        id: 'editor.title',
        message: '文档编辑器',
        description: 'The title of the editor page'
      })}
      description={translate({
        id: 'editor.description',
        message: '基于Ant Design设计规范的专业文档编辑器',
        description: 'The description of the editor page'
      })}
    >
      <div className={styles.editorLayout}>
        {/* 顶部工具栏 */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h1 className={styles.title}>达梦数据库需求文档</h1>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.toolbarActions}>
              <button 
                className={`${styles.toolbarBtn} ${styles.saveBtn}`}
                onClick={handleSave}
                title="保存文档 (Ctrl+S)"
              >
                保存
              </button>
              <button 
                className={`${styles.toolbarBtn} ${styles.exportBtn}`}
                onClick={handleExport}
                title="导出文档"
              >
                导出
              </button>
              <button 
                className={styles.toolbarBtn}
                onClick={() => {
                  if (vditorRef.current) {
                    const currentMode = vditorRef.current.getCurrentMode();
                    if (currentMode === 'sv') {
                      vditorRef.current.setPreviewMode('both');
                    } else {
                      vditorRef.current.setPreviewMode('editor');
                    }
                  }
                }}
                title="切换预览模式"
              >
                切换模式
              </button>
            </div>
          </div>
        </div>

        {/* 三栏布局主体 */}
        <div className={styles.mainLayout}>
          {/* 左侧文档目录 */}
          <div className={styles.leftPanel} style={{ width: leftPanelWidth }}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>文档目录</h3>
            </div>
            <div className={styles.docTree}>
              {getMockDocTree().map(node => (
                <div key={node.key} className={styles.treeNode}>
                  <div 
                    className={`${styles.treeNodeContent} ${expandedKeys.includes(node.key) ? styles.expanded : ''}`}
                    onClick={() => {
                      const newExpanded = expandedKeys.includes(node.key) 
                        ? expandedKeys.filter(k => k !== node.key)
                        : [...expandedKeys, node.key];
                      setExpandedKeys(newExpanded);
                    }}
                  >
                    <span className={styles.treeIcon}>📁</span>
                    <span className={styles.treeTitle}>{node.title}</span>
                  </div>
                  {expandedKeys.includes(node.key) && node.children && (
                    <div className={styles.treeChildren}>
                      {node.children.map(child => (
                        <div key={child.key} className={styles.treeNode}>
                          <div 
                            className={`${styles.treeNodeContent} ${styles.level2} ${expandedKeys.includes(child.key) ? styles.expanded : ''}`}
                            onClick={() => {
                              const newExpanded = expandedKeys.includes(child.key) 
                                ? expandedKeys.filter(k => k !== child.key)
                                : [...expandedKeys, child.key];
                              setExpandedKeys(newExpanded);
                            }}
                          >
                            <span className={styles.treeIcon}>📂</span>
                            <span className={styles.treeTitle}>{child.title}</span>
                          </div>
                          {expandedKeys.includes(child.key) && child.children && (
                            <div className={styles.treeChildren}>
                              {child.children.map(leaf => (
                                <div 
                                  key={leaf.key} 
                                  className={`${styles.treeNode} ${styles.leafNode} ${selectedDocKey === leaf.key ? styles.selected : ''}`}
                                  onClick={() => setSelectedDocKey(leaf.key)}
                                >
                                  <div className={`${styles.treeNodeContent} ${styles.level3}`}>
                                    <span className={styles.treeIcon}>📄</span>
                                    <span className={styles.treeTitle}>{leaf.title}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 左侧分割线 */}
          <div className={styles.resizer}></div>

          {/* 中间编辑区域 */}
          <div className={styles.centerPanel}>
            <div className={styles.editorContainer}>
              <div id="vditor" className={styles.vditorWrapper}></div>
            </div>
          </div>

          {/* 右侧分割线 */}
          <div className={styles.resizer}></div>

          {/* 右侧大纲 */}
          <div className={styles.rightPanel} style={{ width: rightPanelWidth }}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>大纲</h3>
            </div>
            <div className={styles.outline}>
              {getMockOutline().map(item => (
                <div 
                  key={item.id}
                  className={`${styles.outlineItem} ${styles[`level${item.level}`]}`}
                  onClick={() => handleOutlineClick(item.id)}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusItem}>
              {content.split('\n').length} 行
            </span>
            <span className={styles.statusItem}>
              {content.length} 字符
            </span>
            <span className={styles.statusItem}>
              {content.split(/\s+/).filter(word => word.length > 0).length} 词
            </span>
          </div>
          <div className={styles.statusRight}>
            <span className={styles.statusItem}>
              自动保存: 已启用
            </span>
            <span className={styles.statusItem}>
              MARKDOWN
            </span>
            <span className={styles.statusItem}>
              Vditor编辑器
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;