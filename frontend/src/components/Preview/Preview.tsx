// 文档预览组件

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { PreviewProps } from '../../types/editor';
import { formatMarkdown, generateTableOfContents } from '../../utils/editor/editorUtils';
import styles from './Preview.module.css';

// 导入代码高亮样式
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

export const Preview: React.FC<PreviewProps> = ({
  content,
  language = 'markdown',
  showToc = false,
  className,
  style,
  onLinkClick,
  onImageLoad,
  onImageError
}) => {
  // 格式化内容
  const formattedContent = useMemo(() => {
    if (language === 'markdown') {
      return formatMarkdown(content);
    }
    return content;
  }, [content, language]);

  // 生成目录
  const tableOfContents = useMemo(() => {
    if (showToc && language === 'markdown') {
      return generateTableOfContents(content);
    }
    return [];
  }, [content, language, showToc]);

  // 自定义组件
  const components = {
    // 自定义链接处理
    a: ({ href, children, ...props }: any) => (
      <a
        {...props}
        href={href}
        onClick={(e) => {
          if (onLinkClick) {
            e.preventDefault();
            onLinkClick(href || '', e);
          }
        }}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    
    // 自定义图片处理
    img: ({ src, alt, ...props }: any) => (
      <img
        {...props}
        src={src}
        alt={alt}
        onLoad={() => onImageLoad?.(src, alt)}
        onError={() => onImageError?.(src, alt)}
        loading="lazy"
      />
    ),
    
    // 自定义代码块
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return (
        <code
          {...props}
          className={`${className || ''} ${styles.code}`}
          data-language={language}
        >
          {children}
        </code>
      );
    },
    
    // 自定义表格
    table: ({ children, ...props }: any) => (
      <div className={styles.tableWrapper}>
        <table {...props} className={styles.table}>
          {children}
        </table>
      </div>
    ),
    
    // 自定义引用块
    blockquote: ({ children, ...props }: any) => (
      <blockquote {...props} className={styles.blockquote}>
        {children}
      </blockquote>
    )
  };

  const renderContent = () => {
    switch (language) {
      case 'markdown':
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
            components={components}
          >
            {formattedContent}
          </ReactMarkdown>
        );
      
      case 'html':
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: formattedContent }}
            className={styles.htmlContent}
          />
        );
      
      default:
        return (
          <pre className={styles.plaintext}>
            {formattedContent}
          </pre>
        );
    }
  };

  return (
    <div className={`${styles.preview} ${className || ''}`} style={style}>
      {showToc && tableOfContents.length > 0 && (
        <div className={styles.toc}>
          <h3 className={styles.tocTitle}>目录</h3>
          <ul className={styles.tocList}>
            {tableOfContents.map((item, index) => (
              <li 
                key={index} 
                className={styles.tocItem}
                style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
              >
                <a 
                  href={`#${item.id}`}
                  className={styles.tocLink}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Preview;