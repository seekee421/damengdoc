import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { DocNode, TocItem } from '../../types/doc';
import { getNodeAncestors, getSiblingDocs, findNodeByPath } from '../../utils/docTree';
import styles from './DocNavigation.module.css';

interface BreadcrumbProps {
  currentPath: string;
  tree: DocNode[];
  className?: string;
}

interface PrevNextNavProps {
  currentPath: string;
  tree: DocNode[];
  className?: string;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  activeId?: string;
  className?: string;
  maxDepth?: number;
}

interface DocNavigationProps {
  currentPath: string;
  tree: DocNode[];
  tocItems?: TocItem[];
  activeId?: string;
  showBreadcrumb?: boolean;
  showPrevNext?: boolean;
  showToc?: boolean;
  tocMaxDepth?: number;
  currentNode?: DocNode;
  breadcrumbPath?: DocNode[];
  showTableOfContents?: boolean;
  className?: string;
}

// 面包屑导航组件
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPath,
  tree,
  className
}) => {
  const breadcrumbItems = useMemo(() => {
    const currentNode = findNodeByPath(tree, currentPath);
    if (!currentNode) return [];
    
    const ancestors = getNodeAncestors(tree, currentNode.id);
    return [...ancestors, currentNode];
  }, [currentPath, tree]);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className={`${styles.breadcrumb} ${className || ''}`} aria-label="面包屑导航">
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link to="/" className={styles.breadcrumbLink}>
            <span className={styles.homeIcon}>🏠</span>
            首页
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <li key={item.id} className={styles.breadcrumbItem}>
              <span className={styles.breadcrumbSeparator}>›</span>
              {isLast ? (
                <span className={styles.breadcrumbCurrent} aria-current="page">
                  {item.title}
                </span>
              ) : (
                <Link to={item.path} className={styles.breadcrumbLink}>
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// 上一页/下一页导航组件
export const PrevNextNav: React.FC<PrevNextNavProps> = ({
  currentPath,
  tree,
  className
}) => {
  const { prev, next } = useMemo(() => {
    const currentNode = findNodeByPath(tree, currentPath);
    if (!currentNode) return {};
    
    return getSiblingDocs(tree, currentNode.id);
  }, [currentPath, tree]);

  if (!prev && !next) {
    return null;
  }

  return (
    <nav className={`${styles.prevNextNav} ${className || ''}`} aria-label="文档导航">
      <div className={styles.prevNextContainer}>
        {prev && (
          <Link to={prev.path} className={`${styles.prevNextLink} ${styles.prevLink}`}>
            <div className={styles.prevNextContent}>
              <span className={styles.prevNextLabel}>上一页</span>
              <span className={styles.prevNextTitle}>{prev.title}</span>
            </div>
            <span className={styles.prevNextArrow}>‹</span>
          </Link>
        )}
        
        {next && (
          <Link to={next.path} className={`${styles.prevNextLink} ${styles.nextLink}`}>
            <span className={styles.prevNextArrow}>›</span>
            <div className={styles.prevNextContent}>
              <span className={styles.prevNextLabel}>下一页</span>
              <span className={styles.prevNextTitle}>{next.title}</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};

// 目录组件
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  tocItems,
  activeId,
  className,
  maxDepth = 3
}) => {
  const filteredTocItems = useMemo(() => {
    return tocItems.filter(item => item.level <= maxDepth);
  }, [tocItems, maxDepth]);

  const renderTocItem = (item: TocItem, index: number) => {
    const isActive = activeId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <li key={item.id} className={styles.tocItem}>
        <a
          href={`#${item.anchor}`}
          className={`${styles.tocLink} ${
            isActive ? styles.tocLinkActive : ''
          }`}
          style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
        >
          {item.title}
        </a>
        {hasChildren && (
          <ul className={styles.tocSubList}>
            {item.children!.map((child, childIndex) => 
              renderTocItem(child, childIndex)
            )}
          </ul>
        )}
      </li>
    );
  };

  if (filteredTocItems.length === 0) {
    return null;
  }

  return (
    <nav className={`${styles.tableOfContents} ${className || ''}`} aria-label="目录">
      <div className={styles.tocHeader}>
        <h3 className={styles.tocTitle}>目录</h3>
      </div>
      <ul className={styles.tocList}>
        {filteredTocItems.map((item, index) => renderTocItem(item, index))}
      </ul>
    </nav>
  );
};

// 主导航组件
export const DocNavigation: React.FC<DocNavigationProps> = ({
  currentPath,
  tree,
  tocItems = [],
  activeId,
  showBreadcrumb = true,
  showPrevNext = true,
  showToc = true,
  tocMaxDepth = 3,
  className
}) => {
  return (
    <div className={`${styles.docNavigation} ${className || ''}`}>
      {/* 面包屑导航 */}
      {showBreadcrumb && (
        <Breadcrumb
          currentPath={currentPath}
          tree={tree}
          className={styles.navigationSection}
        />
      )}

      {/* 目录 */}
      {showToc && tocItems.length > 0 && (
        <TableOfContents
          tocItems={tocItems}
          activeId={activeId}
          maxDepth={tocMaxDepth}
          className={styles.navigationSection}
        />
      )}

      {/* 上一页/下一页导航 */}
      {showPrevNext && (
        <PrevNextNav
          currentPath={currentPath}
          tree={tree}
          className={styles.navigationSection}
        />
      )}
    </div>
  );
};

export default DocNavigation;