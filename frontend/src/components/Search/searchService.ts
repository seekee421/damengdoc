import { SearchResult } from './SearchBox';

// 模拟搜索数据 - 在实际项目中这些数据会来自API或索引
const mockSearchData = [
  {
    id: '1',
    title: 'DM数据库安装指南',
    content: 'DM数据库是一款高性能的国产数据库管理系统，支持SQL标准，提供完整的事务处理能力。本指南将详细介绍如何在不同操作系统上安装和配置DM数据库。',
    url: '/docs/installation/guide',
    type: 'doc' as const,
    category: '安装部署',
    tags: ['安装', '配置', '部署'],
    lastModified: '2024-01-15'
  },
  {
    id: '2',
    title: 'SQL语法参考',
    content: 'DM数据库完全兼容SQL-92标准，并扩展了许多高级特性。本文档详细介绍了DM数据库支持的SQL语法，包括DDL、DML、DCL等各类语句的使用方法。',
    url: '/docs/sql/reference',
    type: 'doc' as const,
    category: 'SQL参考',
    tags: ['SQL', '语法', '参考'],
    lastModified: '2024-01-20'
  },
  {
    id: '3',
    title: '性能优化最佳实践',
    content: '本文档介绍了DM数据库性能优化的最佳实践，包括索引设计、查询优化、参数调优等方面的详细指导，帮助用户充分发挥数据库性能。',
    url: '/docs/performance/optimization',
    type: 'doc' as const,
    category: '性能优化',
    tags: ['性能', '优化', '索引'],
    lastModified: '2024-01-18'
  },
  {
    id: '4',
    title: '备份与恢复',
    content: '数据安全是数据库管理的重要环节。本文档详细介绍了DM数据库的备份策略、恢复方法，以及灾难恢复的最佳实践。',
    url: '/docs/backup/recovery',
    type: 'doc' as const,
    category: '运维管理',
    tags: ['备份', '恢复', '安全'],
    lastModified: '2024-01-22'
  },
  {
    id: '5',
    title: 'JDBC连接配置',
    content: 'DM数据库提供了标准的JDBC驱动程序，支持Java应用程序的连接。本文档介绍了JDBC连接的配置方法和常见问题解决方案。',
    url: '/docs/development/jdbc',
    type: 'doc' as const,
    category: '开发指南',
    tags: ['JDBC', 'Java', '连接'],
    lastModified: '2024-01-16'
  },
  {
    id: '6',
    title: '集群部署架构',
    content: 'DM数据库支持多种集群部署模式，包括主从复制、读写分离、分布式架构等。本文档详细介绍了各种集群架构的部署和管理方法。',
    url: '/docs/cluster/architecture',
    type: 'doc' as const,
    category: '集群管理',
    tags: ['集群', '架构', '分布式'],
    lastModified: '2024-01-25'
  },
  {
    id: '7',
    title: '常见问题解答',
    content: '本文档收集了用户在使用DM数据库过程中遇到的常见问题及其解决方案，涵盖安装、配置、使用、故障排除等各个方面。',
    url: '/docs/faq',
    type: 'faq' as const,
    category: '帮助支持',
    tags: ['FAQ', '问题', '解决方案'],
    lastModified: '2024-01-28'
  },
  {
    id: '8',
    title: '数据类型详解',
    content: 'DM数据库支持丰富的数据类型，包括数值类型、字符类型、日期时间类型、二进制类型等。本文档详细介绍了各种数据类型的特性和使用方法。',
    url: '/docs/sql/datatypes',
    type: 'doc' as const,
    category: 'SQL参考',
    tags: ['数据类型', 'SQL', '参考'],
    lastModified: '2024-01-12'
  },
  {
    id: '9',
    title: '安全管理指南',
    content: 'DM数据库提供了完善的安全管理功能，包括用户管理、权限控制、数据加密、审计日志等。本指南介绍了如何配置和管理数据库安全。',
    url: '/docs/security/management',
    type: 'doc' as const,
    category: '安全管理',
    tags: ['安全', '权限', '加密'],
    lastModified: '2024-01-30'
  },
  {
    id: '10',
    title: '监控与诊断',
    content: 'DM数据库提供了丰富的监控和诊断工具，帮助管理员实时了解数据库运行状态，快速定位和解决问题。',
    url: '/docs/monitoring/diagnosis',
    type: 'doc' as const,
    category: '运维管理',
    tags: ['监控', '诊断', '运维'],
    lastModified: '2024-01-26'
  }
];

// 搜索配置
interface SearchConfig {
  minQueryLength: number;
  maxResults: number;
  debounceMs: number;
  highlightTags: {
    start: string;
    end: string;
  };
}

const defaultConfig: SearchConfig = {
  minQueryLength: 2,
  maxResults: 10,
  debounceMs: 300,
  highlightTags: {
    start: '<mark>',
    end: '</mark>'
  }
};

// 文本相似度计算（简单的字符串匹配算法）
function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // 完全匹配得分最高
  if (textLower.includes(queryLower)) {
    const position = textLower.indexOf(queryLower);
    // 越靠前的匹配得分越高
    const positionScore = Math.max(0, 100 - position);
    return positionScore + (queryLower.length / textLower.length) * 50;
  }
  
  // 部分匹配计算
  const queryWords = queryLower.split(/\s+/);
  let matchCount = 0;
  let totalScore = 0;
  
  queryWords.forEach(word => {
    if (word.length > 1 && textLower.includes(word)) {
      matchCount++;
      const position = textLower.indexOf(word);
      totalScore += Math.max(0, 50 - position / 2);
    }
  });
  
  return queryWords.length > 0 ? (matchCount / queryWords.length) * totalScore : 0;
}

// 高亮搜索关键词
function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
  let highlightedText = text;
  
  queryWords.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi');
    highlightedText = highlightedText.replace(regex, `${defaultConfig.highlightTags.start}$1${defaultConfig.highlightTags.end}`);
  });
  
  return highlightedText;
}

// 生成搜索摘要
function generateSnippet(content: string, query: string, maxLength: number = 150): string {
  if (!query.trim()) {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }
  
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const queryIndex = contentLower.indexOf(queryLower);
  
  if (queryIndex !== -1) {
    // 找到匹配位置，生成包含匹配内容的摘要
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, start + maxLength);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }
  
  // 没有找到匹配，返回开头部分
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
}

// 搜索函数
export async function searchDocuments(
  query: string,
  config: Partial<SearchConfig> = {}
): Promise<SearchResult[]> {
  const searchConfig = { ...defaultConfig, ...config };
  
  // 检查查询长度
  if (query.trim().length < searchConfig.minQueryLength) {
    return [];
  }
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const results: SearchResult[] = [];
  
  // 搜索所有文档
  mockSearchData.forEach(doc => {
    // 计算标题匹配分数
    const titleScore = calculateRelevanceScore(query, doc.title) * 2; // 标题权重更高
    
    // 计算内容匹配分数
    const contentScore = calculateRelevanceScore(query, doc.content);
    
    // 计算标签匹配分数
    const tagScore = doc.tags.reduce((score, tag) => {
      return score + calculateRelevanceScore(query, tag) * 1.5; // 标签权重适中
    }, 0);
    
    // 计算分类匹配分数
    const categoryScore = calculateRelevanceScore(query, doc.category) * 1.2;
    
    // 总分数
    const totalScore = titleScore + contentScore + tagScore + categoryScore;
    
    // 如果有匹配，添加到结果中
    if (totalScore > 0) {
      results.push({
        id: doc.id,
        title: highlightText(doc.title, query),
        snippet: highlightText(generateSnippet(doc.content, query), query),
        url: doc.url,
        type: doc.type,
        category: doc.category,
        tags: doc.tags,
        score: Math.round(totalScore),
        lastModified: doc.lastModified
      });
    }
  });
  
  // 按分数排序并限制结果数量
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, searchConfig.maxResults);
}

// 获取搜索建议
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.trim().length < 2) {
    return [];
  }
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();
  
  // 从标题中提取建议
  mockSearchData.forEach(doc => {
    const titleWords = doc.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.length > 2 && word.startsWith(queryLower)) {
        suggestions.add(word);
      }
    });
    
    // 从标签中提取建议
    doc.tags.forEach(tag => {
      if (tag.toLowerCase().startsWith(queryLower)) {
        suggestions.add(tag);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
}

// 获取热门搜索词
export function getPopularSearches(): string[] {
  return [
    'DM数据库安装',
    'SQL语法',
    '性能优化',
    'JDBC连接',
    '备份恢复',
    '集群部署',
    '安全管理',
    '监控诊断'
  ];
}

// 搜索历史管理
const SEARCH_HISTORY_KEY = 'dm_docs_search_history';
const MAX_HISTORY_ITEMS = 10;

export function getSearchHistory(): string[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (!query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item !== query);
    const newHistory = [query, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch {
    // 忽略localStorage错误
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // 忽略localStorage错误
  }
}

// 搜索统计
export function trackSearch(query: string, resultCount: number): void {
  // 在实际项目中，这里会发送统计数据到分析服务
  console.log('Search tracked:', { query, resultCount, timestamp: new Date().toISOString() });
}