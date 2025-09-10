// 文件处理器主入口

import { SupportedFileType, FileValidationResult, ImportResult, ExportResult, ImportConfig, ExportConfig, FILE_SIZE_LIMITS, MIME_TYPES, ERROR_CODES, ImportExportError } from '../../types/import-export';

// 文件验证
export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 检查文件大小
  if (file.size === 0) {
    errors.push('文件为空');
  }
  
  // 检查文件类型
  const fileType = getFileTypeFromMime(file.type) || getFileTypeFromExtension(file.name);
  
  if (!fileType) {
    errors.push('不支持的文件类型');
    return {
      isValid: false,
      fileType: null,
      size: file.size,
      errors,
      warnings
    };
  }
  
  // 检查文件大小限制
  const sizeLimit = FILE_SIZE_LIMITS[fileType];
  if (file.size > sizeLimit) {
    errors.push(`文件大小超过限制 (${formatFileSize(sizeLimit)})`);
  }
  
  // 大文件警告
  if (file.size > sizeLimit * 0.8) {
    warnings.push('文件较大，处理可能需要较长时间');
  }
  
  return {
    isValid: errors.length === 0,
    fileType,
    size: file.size,
    errors,
    warnings
  };
}

// 从MIME类型获取文件类型
function getFileTypeFromMime(mimeType: string): SupportedFileType | null {
  const mimeToType = Object.entries(MIME_TYPES).find(([_, mime]) => mime === mimeType);
  return mimeToType ? mimeToType[0] as SupportedFileType : null;
}

// 从文件扩展名获取文件类型
function getFileTypeFromExtension(filename: string): SupportedFileType | null {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'docx':
      return 'docx';
    case 'pdf':
      return 'pdf';
    case 'md':
    case 'markdown':
      return 'md';
    case 'txt':
      return 'txt';
    case 'html':
    case 'htm':
      return 'html';
    default:
      return null;
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 读取文件内容
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new ImportExportError('文件读取失败', ERROR_CODES.PROCESSING_FAILED));
    };
    
    reader.readAsText(file, 'utf-8');
  });
}

// 读取文件为ArrayBuffer
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(new ImportExportError('文件读取失败', ERROR_CODES.PROCESSING_FAILED));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// 处理Markdown文件导入
export async function processMarkdownImport(file: File, config: ImportConfig): Promise<ImportResult> {
  try {
    const content = await readFileAsText(file);
    
    // 基本的Markdown处理
    let processedContent = content;
    
    // 提取元数据（如果存在YAML front matter）
    const metadata: any = {};
    const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    
    if (yamlMatch) {
      try {
        // 简单的YAML解析（实际项目中应使用专门的YAML库）
        const yamlContent = yamlMatch[1];
        const lines = yamlContent.split('\n');
        
        lines.forEach(line => {
          const match = line.match(/^([^:]+):\s*(.+)$/);
          if (match) {
            metadata[match[1].trim()] = match[2].trim().replace(/["']/g, '');
          }
        });
        
        // 移除front matter
        processedContent = content.replace(yamlMatch[0], '');
      } catch (e) {
        // 忽略YAML解析错误
      }
    }
    
    // 统计信息
    const wordCount = processedContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      success: true,
      content: config.targetFormat === 'html' ? markdownToHtml(processedContent) : processedContent,
      metadata: {
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        author: metadata.author,
        createdDate: metadata.date,
        wordCount
      }
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      errors: [error instanceof Error ? error.message : '处理失败']
    };
  }
}

// 处理文本文件导入
export async function processTextImport(file: File, config: ImportConfig): Promise<ImportResult> {
  try {
    const content = await readFileAsText(file);
    
    // 基本的文本处理
    let processedContent = content;
    
    // 如果目标格式是HTML，进行简单的转换
    if (config.targetFormat === 'html') {
      processedContent = textToHtml(content);
    } else {
      // 转换为Markdown格式
      processedContent = textToMarkdown(content);
    }
    
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      success: true,
      content: processedContent,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        wordCount
      }
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      errors: [error instanceof Error ? error.message : '处理失败']
    };
  }
}

// 处理HTML文件导入
export async function processHtmlImport(file: File, config: ImportConfig): Promise<ImportResult> {
  try {
    const content = await readFileAsText(file);
    
    let processedContent = content;
    
    // 如果目标格式是Markdown，进行转换
    if (config.targetFormat === 'markdown') {
      processedContent = htmlToMarkdown(content);
    }
    
    // 提取标题
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : file.name.replace(/\.[^/.]+$/, '');
    
    // 统计字数（去除HTML标签）
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      success: true,
      content: processedContent,
      metadata: {
        title,
        wordCount
      }
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      errors: [error instanceof Error ? error.message : '处理失败']
    };
  }
}

// 简单的Markdown到HTML转换
function markdownToHtml(markdown: string): string {
  return markdown
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    // 代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// 简单的文本到HTML转换
function textToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// 简单的文本到Markdown转换
function textToMarkdown(text: string): string {
  // 检测可能的标题（全大写或以数字开头的行）
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return '';
      
      // 检测标题模式
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        return `# ${trimmed}`;
      }
      
      if (/^\d+\.\s/.test(trimmed)) {
        return `## ${trimmed}`;
      }
      
      return trimmed;
    })
    .join('\n\n');
}

// 简单的HTML到Markdown转换
function htmlToMarkdown(html: string): string {
  return html
    // 移除注释和脚本
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // 标题
    .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1\n\n')
    // 段落
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    // 粗体和斜体
    .replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*')
    // 链接
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)')
    // 代码
    .replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`')
    // 换行
    .replace(/<br[^>]*>/gi, '\n')
    // 移除其他HTML标签
    .replace(/<[^>]*>/g, '')
    // 清理多余的空行
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// 导出为PDF（需要在实际项目中集成PDF库）
export async function exportToPdf(content: string, config: ExportConfig): Promise<ExportResult> {
  try {
    // 这里应该集成实际的PDF生成库，如jsPDF或Puppeteer
    // 目前返回模拟结果
    
    const filename = `document_${Date.now()}.pdf`;
    
    // 模拟PDF生成
    const pdfContent = `PDF Export\n\nContent: ${content.substring(0, 100)}...`;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    return {
      success: true,
      blob,
      filename,
      downloadUrl: URL.createObjectURL(blob)
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      errors: [error instanceof Error ? error.message : '导出失败']
    };
  }
}

// 导出为Word文档（需要在实际项目中集成相关库）
export async function exportToDocx(content: string, config: ExportConfig): Promise<ExportResult> {
  try {
    // 这里应该集成实际的Word文档生成库，如docx
    // 目前返回模拟结果
    
    const filename = `document_${Date.now()}.docx`;
    
    // 模拟Word文档生成
    const docxContent = content;
    const blob = new Blob([docxContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    return {
      success: true,
      blob,
      filename,
      downloadUrl: URL.createObjectURL(blob)
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      errors: [error instanceof Error ? error.message : '导出失败']
    };
  }
}

// 导出为Markdown
export async function exportToMarkdown(content: string, config: ExportConfig): Promise<ExportResult> {
  try {
    const filename = `document_${Date.now()}.md`;
    const blob = new Blob([content], { type: 'text/markdown' });
    
    return {
      success: true,
      blob,
      filename,
      downloadUrl: URL.createObjectURL(blob)
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      errors: [error instanceof Error ? error.message : '导出失败']
    };
  }
}

// 导出为HTML
export async function exportToHtml(content: string, config: ExportConfig): Promise<ExportResult> {
  try {
    const filename = `document_${Date.now()}.html`;
    
    // 创建完整的HTML文档
    const htmlDocument = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出文档</title>
    <style>
        body { font-family: ${config.fontFamily || 'Arial, sans-serif'}; font-size: ${config.fontSize || 12}px; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
    </style>
</head>
<body>
${content}
</body>
</html>`;
    
    const blob = new Blob([htmlDocument], { type: 'text/html' });
    
    return {
      success: true,
      blob,
      filename,
      downloadUrl: URL.createObjectURL(blob)
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      errors: [error instanceof Error ? error.message : '导出失败']
    };
  }
}