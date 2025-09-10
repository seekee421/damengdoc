/**
 * PDF转换服务
 * 提供Markdown文件转PDF的前端API调用
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080/api';

/**
 * 章节信息接口
 */
export interface ChapterInfo {
  id: string;
  name: string;
  filePath: string;
  size?: string;
}

/**
 * PDF下载响应接口
 */
export interface PdfDownloadResponse {
  success: boolean;
  message?: string;
  fileName?: string;
}

/**
 * 章节到文件路径的映射
 * 这里需要根据实际的文档结构来配置
 */
const CHAPTER_FILE_MAPPING: Record<string, string> = {
  'intro': 'docs/intro.md',
  'quickstart': 'docs/tutorial-basics/intro.md',
  'development': 'docs/dm8/intro.md',
  'deployment': 'docs/dm7/intro.md',
  'migration': 'docs/tutorial-extras/intro.md',
  'management': 'docs/dm8/intro.md',
  'api': 'docs/dm8/intro.md',
  'search': 'docs/dm8/intro.md',
  'ecosystem': 'docs/dm8/intro.md',
  'troubleshooting': 'docs/dm8/intro.md'
};

/**
 * 转换单个Markdown文件为PDF并下载
 * @param chapterId 章节ID
 * @param chapterName 章节名称
 * @returns Promise<PdfDownloadResponse>
 */
export async function downloadSingleChapterAsPdf(
  chapterId: string, 
  chapterName: string
): Promise<PdfDownloadResponse> {
  try {
    const filePath = CHAPTER_FILE_MAPPING[chapterId];
    if (!filePath) {
      throw new Error(`未找到章节 ${chapterId} 对应的文件路径`);
    }

    const response = await fetch(`${API_BASE_URL}/pdf/convert-single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        filePath: filePath
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `${chapterName}.pdf`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    }

    // 创建下载
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      fileName: fileName
    };
  } catch (error) {
    console.error('下载PDF时发生错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '下载失败'
    };
  }
}

/**
 * 转换多个Markdown文件为单个PDF并下载
 * @param chapterIds 章节ID列表
 * @param chapterNames 章节名称列表
 * @returns Promise<PdfDownloadResponse>
 */
export async function downloadMultipleChaptersAsPdf(
  chapterIds: string[],
  chapterNames: string[]
): Promise<PdfDownloadResponse> {
  try {
    if (chapterIds.length === 0) {
      throw new Error('请至少选择一个章节');
    }

    // 获取所有章节对应的文件路径
    const filePaths = chapterIds.map(id => {
      const filePath = CHAPTER_FILE_MAPPING[id];
      if (!filePath) {
        throw new Error(`未找到章节 ${id} 对应的文件路径`);
      }
      return filePath;
    });

    const response = await fetch(`${API_BASE_URL}/pdf/convert-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePaths: filePaths
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `达梦数据库文档-${chapterIds.length}章节.pdf`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    }

    // 创建下载
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      fileName: fileName
    };
  } catch (error) {
    console.error('下载PDF时发生错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '下载失败'
    };
  }
}

/**
 * 获取可用的Markdown文件列表
 * @returns Promise<ChapterInfo[]>
 */
export async function getAvailableMarkdownFiles(): Promise<ChapterInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf/available-files`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const files = await response.json();
    return files;
  } catch (error) {
    console.error('获取文件列表时发生错误:', error);
    // 返回默认的章节列表
    return [
      { id: 'intro', name: 'DM数据库简介', filePath: 'docs/intro.md', size: '2.5MB' },
      { id: 'quickstart', name: '快速上手', filePath: 'docs/tutorial-basics/intro.md', size: '3.2MB' },
      { id: 'development', name: '应用开发', filePath: 'docs/dm8/intro.md', size: '5.8MB' },
      { id: 'deployment', name: '部署数据库', filePath: 'docs/dm7/intro.md', size: '4.1MB' },
      { id: 'migration', name: '数据迁移', filePath: 'docs/tutorial-extras/intro.md', size: '3.7MB' },
      { id: 'management', name: '管理数据库', filePath: 'docs/dm8/intro.md', size: '6.2MB' },
      { id: 'api', name: 'DM数据库 API', filePath: 'docs/dm8/intro.md', size: '4.9MB' },
      { id: 'search', name: '向量检索', filePath: 'docs/dm8/intro.md', size: '2.8MB' },
      { id: 'ecosystem', name: '生态集成', filePath: 'docs/dm8/intro.md', size: '3.5MB' },
      { id: 'troubleshooting', name: '实时数据', filePath: 'docs/dm8/intro.md', size: '2.1MB' }
    ];
  }
}

/**
 * 检查PDF服务是否可用
 * @returns Promise<boolean>
 */
export async function checkPdfServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf/available-files`, {
      method: 'GET',
      timeout: 5000
    } as RequestInit);
    
    return response.ok;
  } catch (error) {
    console.warn('PDF服务不可用:', error);
    return false;
  }
}