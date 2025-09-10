// 编辑器工具函数

import type { EditorLanguage, SearchResult, ValidationResult, ValidationError } from '../../types/editor';

// 文本统计
export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
}

// 计算文本统计信息
export const getTextStats = (content: string): TextStats => {
  const lines = content.split('\n');
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
  
  return {
    characters: content.length,
    charactersNoSpaces: content.replace(/\s/g, '').length,
    words,
    lines: lines.length,
    paragraphs
  };
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 检测文本编码
export const detectEncoding = (content: string): string => {
  // 简单的编码检测逻辑
  try {
    // 检查是否包含非ASCII字符
    if (/[^\x00-\x7F]/.test(content)) {
      return 'UTF-8';
    }
    return 'ASCII';
  } catch {
    return 'Unknown';
  }
};

// 检测行结束符
export const detectLineEnding = (content: string): string => {
  if (content.includes('\r\n')) return 'CRLF';
  if (content.includes('\n')) return 'LF';
  if (content.includes('\r')) return 'CR';
  return 'LF'; // 默认
};

// 转换行结束符
export const convertLineEnding = (content: string, target: 'LF' | 'CRLF' | 'CR'): string => {
  // 先统一为LF
  let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  switch (target) {
    case 'CRLF':
      return normalized.replace(/\n/g, '\r\n');
    case 'CR':
      return normalized.replace(/\n/g, '\r');
    case 'LF':
    default:
      return normalized;
  }
};

// Markdown格式化
export const formatMarkdown = (content: string): string => {
  let formatted = content;
  
  // 标准化标题
  formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
    return `${hashes} ${title.trim()}`;
  });
  
  // 标准化列表
  formatted = formatted.replace(/^(\s*)[*+-]\s+/gm, '$1- ');
  
  // 标准化代码块
  formatted = formatted.replace(/^```(\w*)\s*$/gm, '```$1');
  
  // 移除多余的空行
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
};

// HTML格式化
export const formatHTML = (content: string): string => {
  // 简单的HTML格式化
  let formatted = content;
  
  // 添加缩进
  const lines = formatted.split('\n');
  let indentLevel = 0;
  const indentSize = 2;
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    // 减少缩进（闭合标签）
    if (trimmed.startsWith('</') || trimmed.includes('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;
    
    // 增加缩进（开放标签）
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indentLevel++;
    }
    
    return indentedLine;
  });
  
  return formattedLines.join('\n');
};

// 验证Markdown语法
export const validateMarkdown = (content: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // 检查标题语法
    if (line.match(/^#{7,}/)) {
      errors.push({
        line: lineNumber,
        column: 1,
        message: 'Markdown标题最多支持6级',
        severity: 'error'
      });
    }
    
    // 检查链接语法
    const linkMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatches) {
      linkMatches.forEach(match => {
        const urlMatch = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (urlMatch && urlMatch[2]) {
          const url = urlMatch[2];
          if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
            warnings.push({
              line: lineNumber,
              column: line.indexOf(match) + 1,
              message: '链接URL可能无效',
              severity: 'warning'
            });
          }
        }
      });
    }
    
    // 检查代码块
    if (line.startsWith('```') && line.length > 3) {
      const language = line.substring(3).trim();
      if (language && !/^[a-zA-Z0-9_-]+$/.test(language)) {
        warnings.push({
          line: lineNumber,
          column: 4,
          message: '代码块语言标识符可能无效',
          severity: 'warning'
        });
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// 验证HTML语法
export const validateHTML = (content: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  try {
    // 简单的HTML标签匹配检查
    const tagStack: Array<{ tag: string; line: number }> = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 查找所有标签
      const tagMatches = line.match(/<\/?[^>]+>/g);
      if (tagMatches) {
        tagMatches.forEach(tag => {
          if (tag.startsWith('</')) {
            // 闭合标签
            const tagName = tag.substring(2, tag.length - 1).toLowerCase();
            const lastOpen = tagStack.pop();
            
            if (!lastOpen || lastOpen.tag !== tagName) {
              errors.push({
                line: lineNumber,
                column: line.indexOf(tag) + 1,
                message: `未匹配的闭合标签: ${tag}`,
                severity: 'error'
              });
            }
          } else if (!tag.endsWith('/>')) {
            // 开放标签
            const tagMatch = tag.match(/<([^\s>]+)/);
            if (tagMatch) {
              const tagName = tagMatch[1].toLowerCase();
              // 自闭合标签不需要匹配
              const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
              if (!selfClosingTags.includes(tagName)) {
                tagStack.push({ tag: tagName, line: lineNumber });
              }
            }
          }
        });
      }
    });
    
    // 检查未闭合的标签
    tagStack.forEach(openTag => {
      errors.push({
        line: openTag.line,
        column: 1,
        message: `未闭合的标签: <${openTag.tag}>`,
        severity: 'error'
      });
    });
    
  } catch (error) {
    errors.push({
      line: 1,
      column: 1,
      message: 'HTML解析错误',
      severity: 'error'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// 根据语言验证内容
export const validateContent = (content: string, language: EditorLanguage): ValidationResult => {
  switch (language) {
    case 'markdown':
      return validateMarkdown(content);
    case 'html':
      return validateHTML(content);
    case 'plaintext':
    default:
      return { isValid: true, errors: [], warnings: [] };
  }
};

// 根据语言格式化内容
export const formatContent = (content: string, language: EditorLanguage): string => {
  switch (language) {
    case 'markdown':
      return formatMarkdown(content);
    case 'html':
      return formatHTML(content);
    case 'plaintext':
    default:
      return content;
  }
};

// 生成目录（TOC）
export const generateTableOfContents = (content: string, language: EditorLanguage = 'markdown'): Array<{ level: number; text: string; id: string }> => {
  const toc: Array<{ level: number; text: string; id: string }> = [];
  
  if (language === 'markdown') {
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        toc.push({ level, text, id });
      }
    });
  } else if (language === 'html') {
    const headingMatches = content.match(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi);
    
    if (headingMatches) {
      headingMatches.forEach(match => {
        const levelMatch = match.match(/<h([1-6])/);
        const titleMatch = match.match(/>([^<]+)</);
        
        if (levelMatch && titleMatch) {
          const level = parseInt(levelMatch[1]);
          const text = titleMatch[1].trim();
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          toc.push({ level, text, id });
        }
      });
    }
  }
  
  return toc;
};

// 插入文本到指定位置
export const insertTextAtPosition = (
  content: string,
  text: string,
  line: number,
  column: number
): { content: string; newCursorPosition: { line: number; column: number } } => {
  const lines = content.split('\n');
  
  if (line < 1 || line > lines.length) {
    return { content, newCursorPosition: { line, column } };
  }
  
  const targetLine = lines[line - 1];
  const beforeCursor = targetLine.substring(0, column - 1);
  const afterCursor = targetLine.substring(column - 1);
  
  lines[line - 1] = beforeCursor + text + afterCursor;
  
  const newContent = lines.join('\n');
  const newCursorPosition = {
    line,
    column: column + text.length
  };
  
  return { content: newContent, newCursorPosition };
};

// 获取指定位置的单词
export const getWordAtPosition = (content: string, line: number, column: number): string => {
  const lines = content.split('\n');
  
  if (line < 1 || line > lines.length) {
    return '';
  }
  
  const targetLine = lines[line - 1];
  if (column < 1 || column > targetLine.length) {
    return '';
  }
  
  // 查找单词边界
  const wordRegex = /\b\w+\b/g;
  let match;
  
  while ((match = wordRegex.exec(targetLine)) !== null) {
    const start = match.index + 1; // 转换为1-based
    const end = match.index + match[0].length;
    
    if (column >= start && column <= end) {
      return match[0];
    }
  }
  
  return '';
};

// 高亮搜索结果
export const highlightSearchResults = (content: string, searchResults: SearchResult[], currentIndex: number): string => {
  if (searchResults.length === 0) return content;
  
  let highlightedContent = content;
  const lines = content.split('\n');
  
  // 从后往前处理，避免位置偏移
  for (let i = searchResults.length - 1; i >= 0; i--) {
    const result = searchResults[i];
    const line = lines[result.line - 1];
    
    if (line) {
      const before = line.substring(0, result.column - 1);
      const match = line.substring(result.column - 1, result.column - 1 + result.length);
      const after = line.substring(result.column - 1 + result.length);
      
      const className = i === currentIndex ? 'search-result-current' : 'search-result';
      const highlighted = `${before}<mark class="${className}">${match}</mark>${after}`;
      
      lines[result.line - 1] = highlighted;
    }
  }
  
  return lines.join('\n');
};

// 导出所有工具函数
export default {
  getTextStats,
  formatFileSize,
  detectEncoding,
  detectLineEnding,
  convertLineEnding,
  formatMarkdown,
  formatHTML,
  validateMarkdown,
  validateHTML,
  validateContent,
  formatContent,
  generateTableOfContents,
  insertTextAtPosition,
  getWordAtPosition,
  highlightSearchResults
};