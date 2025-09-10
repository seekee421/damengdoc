// 文档导入导出相关类型定义

// 支持的文件类型
export type SupportedFileType = 'docx' | 'pdf' | 'md' | 'txt' | 'html';

// 导入配置
export interface ImportConfig {
  preserveFormatting: boolean;
  extractImages: boolean;
  convertTables: boolean;
  includeMetadata: boolean;
  targetFormat: 'markdown' | 'html';
  imageUploadPath?: string;
  optimizeImages?: boolean;
  handleCodeBlocks?: boolean;
  generateTableOfContents?: boolean;
  customStyles?: Record<string, string>;
}

// 导出配置
export interface ExportConfig {
  format: SupportedFileType;
  includeImages: boolean;
  includeTableOfContents: boolean;
  pageSize?: 'A4' | 'Letter' | 'A3';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize?: number;
  fontFamily?: string;
  headerFooter?: {
    includeHeader: boolean;
    includeFooter: boolean;
    headerText?: string;
    footerText?: string;
  };
  filename?: string;
  includeMetadata?: boolean;
  customStyles?: Record<string, string>;
}

// 文件信息
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
}

// 导入结果
export interface ImportResult {
  success: boolean;
  content: string;
  metadata?: {
    title?: string;
    author?: string;
    createdDate?: string;
    modifiedDate?: string;
    wordCount?: number;
    pageCount?: number;
  };
  images?: {
    originalPath: string;
    newPath: string;
    alt?: string;
  }[];
  warnings?: string[];
  errors?: string[];
}

// 导出结果
export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  downloadUrl?: string;
  errors?: string[];
}

// 批量操作状态
export interface BatchOperationStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  results: (ImportResult | ExportResult)[];
}

// 文档转换选项
export interface ConversionOptions {
  sourceFormat: SupportedFileType;
  targetFormat: SupportedFileType;
  preserveStructure: boolean;
  optimizeImages: boolean;
  compressOutput: boolean;
}

// 上传进度
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  loaded?: number;
  total?: number;
  percentage?: number;
  message?: string;
}

// 导入导出历史记录
export interface ImportExportHistory {
  id: string;
  type: 'import' | 'export';
  fileName: string;
  fileSize: number;
  format: SupportedFileType;
  status: 'success' | 'failed' | 'partial';
  timestamp: string;
  userId: string;
  documentId?: string;
  errors?: string[];
  warnings?: string[];
}

// 文件验证结果
export interface FileValidationResult {
  isValid: boolean;
  fileType: SupportedFileType | null;
  size: number;
  errors: string[];
  warnings: string[];
}

// 预览数据
export interface PreviewData {
  content: string;
  metadata: {
    title: string;
    wordCount: number;
    estimatedReadTime: number;
  };
  structure: {
    headings: {
      level: number;
      text: string;
      id: string;
    }[];
    images: number;
    tables: number;
    links: number;
  };
}

// 导入导出服务接口
export interface ImportExportService {
  // 文件验证
  validateFile(file: File): Promise<FileValidationResult>;
  
  // 导入功能
  importFile(file: File, config: ImportConfig): Promise<ImportResult>;
  importMultipleFiles(files: File[], config: ImportConfig): Promise<BatchOperationStatus>;
  
  // 导出功能
  exportDocument(content: string, config: ExportConfig): Promise<ExportResult>;
  exportMultipleDocuments(documents: { id: string; content: string; title: string }[], config: ExportConfig): Promise<ExportResult>;
  
  // 预览功能
  previewFile(file: File): Promise<PreviewData>;
  
  // 转换功能
  convertFile(file: File, options: ConversionOptions): Promise<ImportResult>;
  
  // 历史记录
  getHistory(userId: string): Promise<ImportExportHistory[]>;
  
  // 清理临时文件
  cleanupTempFiles(): Promise<void>;
}

// 错误类型
export class ImportExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImportExportError';
  }
}

// 常用错误代码
export const ERROR_CODES = {
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_CONFIG: 'INVALID_CONFIG'
} as const;

// 文件大小限制（字节）
export const FILE_SIZE_LIMITS = {
  docx: 50 * 1024 * 1024, // 50MB
  pdf: 100 * 1024 * 1024, // 100MB
  md: 10 * 1024 * 1024,   // 10MB
  txt: 10 * 1024 * 1024,  // 10MB
  html: 10 * 1024 * 1024, // 10MB
  default: 50 * 1024 * 1024 // 默认50MB
} as const;

// MIME类型映射
export const MIME_TYPES = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  md: 'text/markdown',
  txt: 'text/plain',
  html: 'text/html'
} as const;

// 支持的MIME类型数组
export const SUPPORTED_MIME_TYPES_ARRAY = Object.values(MIME_TYPES);

// 默认配置
export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  preserveFormatting: true,
  extractImages: true,
  convertTables: true,
  includeMetadata: true,
  targetFormat: 'markdown',
  optimizeImages: false,
  handleCodeBlocks: true,
  generateTableOfContents: false
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'pdf',
  includeImages: true,
  includeTableOfContents: true,
  pageSize: 'A4',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  headerFooter: {
    includeHeader: false,
    includeFooter: true,
    footerText: '第 {pageNumber} 页 共 {totalPages} 页'
  },
  includeMetadata: false
};