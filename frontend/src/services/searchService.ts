import { SearchResult } from '../components/Search/SearchBox';

// 示例搜索数据 - 基于实际文档结构
const mockSearchData: SearchResult[] = [
  {
    id: '1',
    title: 'DM数据库简介',
    snippet: 'DM数据库是达梦公司推出的具有完全自主知识产权的高性能数据库管理系统，支持SQL标准，提供完整的事务处理能力...',
    url: '/docs/intro',
    type: 'doc',
    category: '入门指南',
    tags: ['数据库', '简介', '入门'],
    score: 95,
    lastModified: '2024-01-15'
  },
  {
    id: '2',
    title: 'DM8数据库简介',
    snippet: 'DM8是达梦数据库的最新版本，提供了更强的性能、更好的稳定性和更丰富的功能特性...',
    url: '/docs/dm8/intro',
    type: 'doc',
    category: 'DM8文档',
    tags: ['DM8', '简介', '新特性'],
    score: 92,
    lastModified: '2024-01-20'
  },
  {
    id: '3',
    title: 'DM7数据库简介',
    snippet: 'DM7是达梦数据库的经典版本，具有稳定可靠的特点，广泛应用于各种企业级应用场景...',
    url: '/docs/dm7/intro',
    type: 'doc',
    category: 'DM7文档',
    tags: ['DM7', '简介', '经典版本'],
    score: 88,
    lastModified: '2024-01-18'
  },
  {
    id: '4',
    title: '创建页面',
    snippet: '学习如何在Docusaurus中创建新的页面，包括React页面和Markdown页面的创建方法...',
    url: '/docs/tutorial-basics/create-a-page',
    type: 'doc',
    category: '基础教程',
    tags: ['教程', '页面', '创建'],
    score: 85,
    lastModified: '2024-01-22'
  },
  {
    id: '5',
    title: '创建文档',
    snippet: '了解如何在Docusaurus中创建和组织文档，包括文档结构、分类和导航的设置...',
    url: '/docs/tutorial-basics/create-a-document',
    type: 'doc',
    category: '基础教程',
    tags: ['文档', '创建', '组织'],
    score: 90,
    lastModified: '2024-01-25'
  },
  {
    id: '6',
    title: '创建博客文章',
    snippet: '学习如何在Docusaurus中创建博客文章，包括文章格式、标签和分类的使用...',
    url: '/docs/tutorial-basics/create-a-blog-post',
    type: 'doc',
    category: '基础教程',
    tags: ['博客', '文章', '创建'],
    score: 87,
    lastModified: '2024-01-28'
  },
  {
    id: '7',
    title: 'Markdown功能特性',
    snippet: 'Docusaurus支持丰富的Markdown功能，包括代码高亮、表格、链接、图片等各种元素...',
    url: '/docs/tutorial-basics/markdown-features',
    type: 'doc',
    category: '基础教程',
    tags: ['Markdown', '功能', '特性'],
    score: 80,
    lastModified: '2024-01-30'
  },
  {
    id: '8',
    title: '部署网站',
    snippet: '了解如何将Docusaurus网站部署到各种平台，包括GitHub Pages、Netlify、Vercel等...',
    url: '/docs/tutorial-basics/deploy-your-site',
    type: 'doc',
    category: '基础教程',
    tags: ['部署', '网站', '发布'],
    score: 93,
    lastModified: '2024-02-01'
  },
  {
    id: '9',
    title: '恭喜完成教程',
    snippet: '恭喜您完成了Docusaurus的基础教程！现在您已经掌握了创建和管理文档网站的基本技能...',
    url: '/docs/tutorial-basics/congratulations',
    type: 'doc',
    category: '基础教程',
    tags: ['完成', '恭喜', '总结'],
    score: 82,
    lastModified: '2024-02-03'
  },
  {
    id: '10',
    title: '管理文档版本',
    snippet: 'Docusaurus支持多版本文档管理，可以为不同版本的产品维护独立的文档...',
    url: '/docs/tutorial-extras/manage-docs-versions',
    type: 'doc',
    category: '高级功能',
    tags: ['版本', '管理', '多版本'],
    score: 78,
    lastModified: '2024-02-05'
  },
  {
    id: '11',
    title: '网站国际化',
    snippet: '学习如何为Docusaurus网站添加多语言支持，包括翻译配置和本地化设置...',
    url: '/docs/tutorial-extras/translate-your-site',
    type: 'doc',
    category: '高级功能',
    tags: ['国际化', '翻译', '多语言'],
    score: 75,
    lastModified: '2024-02-07'
  }
];

// 搜索选项接口
export interface SearchOptions {
  limit?: number;
  type?: SearchResult['type'];
  category?: string;
  minScore?: number;
}

// 搜索文档函数
export async function searchDocuments(
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // 模拟异步搜索
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve([]);
        return;
      }

      const {
        limit = 10,
        type,
        category,
        minScore = 0
      } = options;

      // 简单的搜索算法
      let results = mockSearchData.filter(item => {
        // 类型过滤
        if (type && item.type !== type) return false;
        
        // 分类过滤
        if (category && item.category !== category) return false;
        
        // 分数过滤
        if (item.score < minScore) return false;

        // 文本匹配
        const searchText = query.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchText);
        const snippetMatch = item.snippet.toLowerCase().includes(searchText);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(searchText));
        const categoryMatch = item.category.toLowerCase().includes(searchText);

        return titleMatch || snippetMatch || tagMatch || categoryMatch;
      });

      // 按相关性排序
      results = results.sort((a, b) => {
        const aRelevance = calculateRelevance(a, query);
        const bRelevance = calculateRelevance(b, query);
        return bRelevance - aRelevance;
      });

      // 限制结果数量
      results = results.slice(0, limit);

      resolve(results);
    }, 300); // 模拟网络延迟
  });
}

// 计算相关性分数
function calculateRelevance(item: SearchResult, query: string): number {
  const searchText = query.toLowerCase();
  let relevance = 0;

  // 标题匹配权重最高
  if (item.title.toLowerCase().includes(searchText)) {
    relevance += 100;
  }

  // 标签匹配
  item.tags.forEach(tag => {
    if (tag.toLowerCase().includes(searchText)) {
      relevance += 50;
    }
  });

  // 分类匹配
  if (item.category.toLowerCase().includes(searchText)) {
    relevance += 30;
  }

  // 内容匹配
  if (item.snippet.toLowerCase().includes(searchText)) {
    relevance += 20;
  }

  // 基础分数
  relevance += item.score * 0.1;

  return relevance;
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
    '常见问题',
    'DM8新特性'
  ];
}

// 获取搜索建议
export async function getSearchSuggestions(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve(getPopularSearches());
        return;
      }

      const suggestions = mockSearchData
        .filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .map(item => item.title)
        .slice(0, 5);

      resolve(suggestions);
    }, 100);
  });
}

// 获取分类列表
export function getCategories(): string[] {
  const categories = Array.from(new Set(mockSearchData.map(item => item.category)));
  return categories.sort();
}

// 按分类获取文档
export async function getDocumentsByCategory(category: string): Promise<SearchResult[]> {
  return mockSearchData.filter(item => item.category === category);
}

export default {
  searchDocuments,
  getPopularSearches,
  getSearchSuggestions,
  getCategories,
  getDocumentsByCategory
};