import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { DocTree } from '../../components/DocTree/DocTree';
import { DocNavigation } from '../../components/Navigation/DocNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { DocNode } from '../../types/doc';
import { findNodeById, getNodePath } from '../../utils/docTree';
import styles from './docs.module.css';

interface DocsPageProps {
  location?: {
    pathname: string;
    search: string;
  };
}

export default function DocsPage({ location }: DocsPageProps): React.ReactElement {
  const { user } = useAuth();
  const [selectedNode, setSelectedNode] = useState<DocNode | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 996);
      if (window.innerWidth <= 996) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理节点选择
  const handleNodeSelect = (node: DocNode) => {
    setSelectedNode(node);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // 获取当前节点的路径
  const currentPath = selectedNode ? getNodePath(selectedNode) : [];

  return (
    <Layout
      title="文档中心"
      description="达梦数据库产品文档中心"
    >
      <div className={styles.docsContainer}>
        {/* 移动端顶部工具栏 */}
        {isMobile && (
          <div className={styles.mobileToolbar}>
            <button
              className={styles.sidebarToggle}
              onClick={toggleSidebar}
              aria-label="切换侧边栏"
            >
              <span className={styles.hamburger}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1 className={styles.mobileTitle}>文档中心</h1>
            {user && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.username}</span>
                <span className={`${styles.userRole} ${styles[user.role]}`}>
                  {user.role === 'admin' ? '管理员' : '编辑员'}
                </span>
              </div>
            )}
          </div>
        )}

        <div className={styles.docsLayout}>
          {/* 侧边栏 */}
          <aside 
            className={`${styles.sidebar} ${
              showSidebar ? styles.sidebarVisible : styles.sidebarHidden
            }`}
          >
            <div className={styles.sidebarContent}>
              {/* 桌面端标题 */}
              {!isMobile && (
                <div className={styles.sidebarHeader}>
                  <h2 className={styles.sidebarTitle}>文档导航</h2>
                  {user && (
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.username}</span>
                      <span className={`${styles.userRole} ${styles[user.role]}`}>
                        {user.role === 'admin' ? '管理员' : '编辑员'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 文档树 */}
              <div className={styles.docTreeContainer}>
                <DocTree
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNode?.id}
                  showActions={!!user}
                />
              </div>
            </div>
            
            {/* 移动端遮罩 */}
            {isMobile && showSidebar && (
              <div 
                className={styles.sidebarOverlay}
                onClick={() => setShowSidebar(false)}
              />
            )}
          </aside>

          {/* 主内容区 */}
          <main className={styles.mainContent}>
            {selectedNode ? (
              <div className={styles.documentView}>
                {/* 面包屑导航 */}
                <DocNavigation
                  currentNode={selectedNode}
                  breadcrumbPath={currentPath}
                  showTableOfContents={true}
                  currentPath={currentPath.map(node => node.title).join(' / ')}
                  tree={[selectedNode]}
  
                />
                
                {/* 文档内容 */}
                <article className={styles.documentContent}>
                  <header className={styles.documentHeader}>
                    <h1 className={styles.documentTitle}>{selectedNode.title}</h1>
                    {selectedNode.description && (
                      <p className={styles.documentDescription}>
                        {selectedNode.description}
                      </p>
                    )}
                    <div className={styles.documentMeta}>
                      <span className={styles.documentType}>
                        类型: {selectedNode.type === 'folder' ? '目录' : '文档'}
                      </span>
                      {selectedNode.version && (
                        <span className={styles.documentVersion}>
                          版本: {selectedNode.version}
                        </span>
                      )}
                      {selectedNode.lastModified && (
                        <span className={styles.documentDate}>
                          更新时间: {new Date(selectedNode.lastModified).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </header>
                  
                  <div className={styles.documentBody}>
                    {selectedNode.type === 'folder' ? (
                      <div className={styles.folderContent}>
                        <h3>子文档</h3>
                        {selectedNode.children && selectedNode.children.length > 0 ? (
                          <ul className={styles.childrenList}>
                            {selectedNode.children.map((child) => (
                              <li key={child.id} className={styles.childItem}>
                                <button
                                  className={styles.childLink}
                                  onClick={() => handleNodeSelect(child)}
                                >
                                  <span className={styles.childIcon}>
                                    {child.type === 'folder' ? '📁' : '📄'}
                                  </span>
                                  <span className={styles.childTitle}>{child.title}</span>
                                  {child.description && (
                                    <span className={styles.childDescription}>
                                      {child.description}
                                    </span>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={styles.emptyMessage}>此目录下暂无文档</p>
                        )}
                      </div>
                    ) : (
                      <div className={styles.documentText}>
                        {selectedNode.content ? (
                          <div 
                            className={styles.markdownContent}
                            dangerouslySetInnerHTML={{ __html: selectedNode.content }}
                          />
                        ) : (
                          <div className={styles.placeholderContent}>
                            <h3>文档内容</h3>
                            <p>这里将显示文档的具体内容。</p>
                            <p>当前选中文档: <strong>{selectedNode.title}</strong></p>
                            {selectedNode.path && (
                              <p>文档路径: <code>{selectedNode.path}</code></p>
                            )}
                            {user && (
                              <div className={styles.editActions}>
                                <button className={styles.editButton}>
                                  编辑文档
                                </button>
                                <button className={styles.previewButton}>
                                  预览模式
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </div>
            ) : (
              <div className={styles.welcomeView}>
                <div className={styles.welcomeContent}>
                  <h1 className={styles.welcomeTitle}>欢迎使用达梦文档中心</h1>
                  <p className={styles.welcomeDescription}>
                    请从左侧导航栏选择要查看的文档。
                  </p>
                  <div className={styles.welcomeFeatures}>
                    <div className={styles.featureCard}>
                      <h3>📚 丰富的文档库</h3>
                      <p>涵盖产品使用、开发指南、API参考等各类文档</p>
                    </div>
                    <div className={styles.featureCard}>
                      <h3>🔍 智能搜索</h3>
                      <p>快速找到您需要的文档内容</p>
                    </div>
                    <div className={styles.featureCard}>
                      <h3>📱 响应式设计</h3>
                      <p>支持桌面端和移动端访问</p>
                    </div>
                    {user && (
                      <div className={styles.featureCard}>
                        <h3>✏️ 在线编辑</h3>
                        <p>支持在线编辑和实时预览</p>
                      </div>
                    )}
                  </div>
                  {!user && (
                    <div className={styles.loginPrompt}>
                      <p>登录后可享受更多功能</p>
                      <button className={styles.loginButton}>
                        立即登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}