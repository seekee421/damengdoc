// 导入导出组件

import React, { useState, useRef, useCallback } from 'react';
import {
  SupportedFileType,
  ImportConfig,
  ExportConfig,
  ImportResult,
  ExportResult,
  BatchOperationStatus,
  PreviewData,
  ImportExportHistory,
  UploadProgress,
  DEFAULT_IMPORT_CONFIG,
  DEFAULT_EXPORT_CONFIG,
  FILE_SIZE_LIMITS,
  MIME_TYPES
} from '../../types/import-export';
import { importExportService } from '../../services/importExportService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ImportExport.module.css';

interface ImportExportProps {
  onImportSuccess?: (result: ImportResult) => void;
  onExportSuccess?: (result: ExportResult) => void;
  defaultMode?: 'import' | 'export';
  allowedFormats?: SupportedFileType[];
  maxFileSize?: number;
  showHistory?: boolean;
}

interface FileUploadState {
  files: File[];
  previews: Map<string, PreviewData>;
  uploadProgress: Map<string, UploadProgress>;
  results: Map<string, ImportResult>;
}

const ImportExport: React.FC<ImportExportProps> = ({
  onImportSuccess,
  onExportSuccess,
  defaultMode = 'import',
  allowedFormats,
  maxFileSize = FILE_SIZE_LIMITS.default,
  showHistory = true
}) => {
  const { user, hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'import' | 'export'>(defaultMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // 导入相关状态
  const [uploadState, setUploadState] = useState<FileUploadState>({
    files: [],
    previews: new Map(),
    uploadProgress: new Map(),
    results: new Map()
  });
  const [importConfig, setImportConfig] = useState<ImportConfig>(DEFAULT_IMPORT_CONFIG);
  const [batchStatus, setBatchStatus] = useState<BatchOperationStatus | null>(null);
  
  // 导出相关状态
  const [exportContent, setExportContent] = useState('');
  const [exportConfig, setExportConfig] = useState<ExportConfig>(DEFAULT_EXPORT_CONFIG);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  
  // 历史记录
  const [history, setHistory] = useState<ImportExportHistory[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // 检查用户权限
  const canImport = hasPermission('document.import');
  const canExport = hasPermission('document.export');

  // 处理文件拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // 处理文件
  const handleFiles = async (files: File[]) => {
    if (!canImport) {
      alert('您没有导入文档的权限');
      return;
    }

    // 过滤和验证文件
    const validFiles = files.filter(file => {
      // 检查文件大小
      if (file.size > maxFileSize) {
        alert(`文件 ${file.name} 超过大小限制 (${Math.round(maxFileSize / 1024 / 1024)}MB)`);
        return false;
      }

      // 检查文件类型
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as SupportedFileType;
      if (allowedFormats && !allowedFormats.includes(fileExtension)) {
        alert(`不支持的文件类型: ${file.name}`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploadState(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));

    // 生成预览
    for (const file of validFiles) {
      try {
        const preview = await importExportService.previewFile(file);
        setUploadState(prev => ({
          ...prev,
          previews: new Map(prev.previews.set(file.name, preview))
        }));
      } catch (error) {
        console.error(`预览文件 ${file.name} 失败:`, error);
      }
    }
  };

  // 导入文件
  const handleImport = async () => {
    if (!canImport || uploadState.files.length === 0) return;

    setIsProcessing(true);
    
    try {
      if (uploadState.files.length === 1) {
        // 单文件导入
        const result = await importExportService.importFile(uploadState.files[0], importConfig);
        setUploadState(prev => ({
          ...prev,
          results: new Map(prev.results.set(uploadState.files[0].name, result))
        }));
        
        if (result.success && onImportSuccess) {
          onImportSuccess(result);
        }
      } else {
        // 批量导入
        const status = await importExportService.importMultipleFiles(uploadState.files, importConfig);
        setBatchStatus(status);
        
        // 更新结果
        const newResults = new Map(uploadState.results);
        uploadState.files.forEach((file, index) => {
          if (status.results[index]) {
            newResults.set(file.name, status.results[index] as ImportResult);
          }
        });
        
        setUploadState(prev => ({
          ...prev,
          results: newResults
        }));
      }
      
      // 刷新历史记录
      if (user) {
        const newHistory = await importExportService.getHistory(user.id);
        setHistory(newHistory);
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 导出文档
  const handleExport = async () => {
    if (!canExport || !exportContent.trim()) return;

    setIsProcessing(true);
    
    try {
      const result = await importExportService.exportDocument(exportContent, exportConfig);
      setExportResult(result);
      
      if (result.success) {
        if (onExportSuccess) {
          onExportSuccess(result);
        }
        
        // 自动下载
        if (result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      // 刷新历史记录
      if (user) {
        const newHistory = await importExportService.getHistory(user.id);
        setHistory(newHistory);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 清除文件
  const clearFiles = () => {
    setUploadState({
      files: [],
      previews: new Map(),
      uploadProgress: new Map(),
      results: new Map()
    });
    setBatchStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 移除单个文件
  const removeFile = (fileName: string) => {
    setUploadState(prev => {
      const newFiles = prev.files.filter(f => f.name !== fileName);
      const newPreviews = new Map(prev.previews);
      const newProgress = new Map(prev.uploadProgress);
      const newResults = new Map(prev.results);
      
      newPreviews.delete(fileName);
      newProgress.delete(fileName);
      newResults.delete(fileName);
      
      return {
        files: newFiles,
        previews: newPreviews,
        uploadProgress: newProgress,
        results: newResults
      };
    });
  };

  // 加载历史记录
  const loadHistory = async () => {
    if (user) {
      try {
        const newHistory = await importExportService.getHistory(user.id);
        setHistory(newHistory);
        setShowHistoryPanel(true);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* 模式切换 */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeButton} ${mode === 'import' ? styles.active : ''}`}
          onClick={() => setMode('import')}
          disabled={!canImport}
        >
          导入文档
        </button>
        <button
          className={`${styles.modeButton} ${mode === 'export' ? styles.active : ''}`}
          onClick={() => setMode('export')}
          disabled={!canExport}
        >
          导出文档
        </button>
      </div>

      {/* 导入模式 */}
      {mode === 'import' && (
        <div className={styles.importSection}>
          {/* 文件上传区域 */}
          <div
            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.values(MIME_TYPES).join(',')}
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <div className={styles.uploadContent}>
              <div className={styles.uploadIcon}>📁</div>
              <p>点击选择文件或拖拽文件到此处</p>
              <p className={styles.uploadHint}>
                支持格式: {allowedFormats?.join(', ') || 'MD, TXT, HTML, DOCX, PDF'}
              </p>
              <p className={styles.uploadHint}>
                最大文件大小: {Math.round(maxFileSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>

          {/* 导入配置 */}
          <div className={styles.configSection}>
            <h3>导入配置</h3>
            <div className={styles.configGrid}>
              <label>
                目标格式:
                <select
                  value={importConfig.targetFormat}
                  onChange={(e) => setImportConfig(prev => ({
                    ...prev,
                    targetFormat: e.target.value as 'markdown' | 'html'
                  }))}
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={importConfig.preserveFormatting}
                  onChange={(e) => setImportConfig(prev => ({
                    ...prev,
                    preserveFormatting: e.target.checked
                  }))}
                />
                保持原始格式
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={importConfig.extractImages}
                  onChange={(e) => setImportConfig(prev => ({
                    ...prev,
                    extractImages: e.target.checked
                  }))}
                />
                提取图片
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={importConfig.generateTableOfContents}
                  onChange={(e) => setImportConfig(prev => ({
                    ...prev,
                    generateTableOfContents: e.target.checked
                  }))}
                />
                生成目录
              </label>
            </div>
          </div>

          {/* 文件列表 */}
          {uploadState.files.length > 0 && (
            <div className={styles.fileList}>
              <div className={styles.fileListHeader}>
                <h3>待导入文件 ({uploadState.files.length})</h3>
                <button onClick={clearFiles} className={styles.clearButton}>
                  清除全部
                </button>
              </div>
              
              {uploadState.files.map((file) => {
                const preview = uploadState.previews.get(file.name);
                const result = uploadState.results.get(file.name);
                const progress = uploadState.uploadProgress.get(file.name);
                
                return (
                  <div key={file.name} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                    
                    {preview && (
                      <div className={styles.filePreview}>
                        <div className={styles.previewMeta}>
                          <span>字数: {preview.metadata.wordCount}</span>
                          <span>预计阅读: {preview.metadata.estimatedReadTime}分钟</span>
                          <span>标题: {preview.structure.headings.length}</span>
                          <span>图片: {preview.structure.images}</span>
                        </div>
                        <div className={styles.previewContent}>
                          {preview.content}
                        </div>
                      </div>
                    )}
                    
                    {progress && (
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${progress.percentage}%` }}
                        />
                        <span>{progress.percentage}%</span>
                      </div>
                    )}
                    
                    {result && (
                      <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
                        {result.success ? (
                          <div>
                            <div className={styles.successIcon}>✓</div>
                            <span>导入成功</span>
                            {result.warnings && result.warnings.length > 0 && (
                              <div className={styles.warnings}>
                                {result.warnings.map((warning, i) => (
                                  <div key={i} className={styles.warning}>⚠ {warning}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className={styles.errorIcon}>✗</div>
                            <span>导入失败</span>
                            {result.errors && (
                              <div className={styles.errors}>
                                {result.errors.map((error, i) => (
                                  <div key={i} className={styles.error}>• {error}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 批量操作状态 */}
          {batchStatus && (
            <div className={styles.batchStatus}>
              <h3>批量导入状态</h3>
              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>总计:</span>
                  <span className={styles.statusValue}>{batchStatus.total}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>已完成:</span>
                  <span className={styles.statusValue}>{batchStatus.completed}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>失败:</span>
                  <span className={styles.statusValue}>{batchStatus.failed}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>进行中:</span>
                  <span className={styles.statusValue}>{batchStatus.inProgress}</span>
                </div>
              </div>
            </div>
          )}

          {/* 导入按钮 */}
          <div className={styles.actionButtons}>
            <button
              onClick={handleImport}
              disabled={!canImport || uploadState.files.length === 0 || isProcessing}
              className={styles.primaryButton}
            >
              {isProcessing ? '导入中...' : `导入 ${uploadState.files.length} 个文件`}
            </button>
          </div>
        </div>
      )}

      {/* 导出模式 */}
      {mode === 'export' && (
        <div className={styles.exportSection}>
          {/* 内容输入 */}
          <div className={styles.contentSection}>
            <h3>文档内容</h3>
            <textarea
              value={exportContent}
              onChange={(e) => setExportContent(e.target.value)}
              placeholder="请输入要导出的文档内容（支持Markdown格式）..."
              className={styles.contentTextarea}
              rows={15}
            />
          </div>

          {/* 导出配置 */}
          <div className={styles.configSection}>
            <h3>导出配置</h3>
            <div className={styles.configGrid}>
              <label>
                导出格式:
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    format: e.target.value as SupportedFileType
                  }))}
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word文档</option>
                  <option value="md">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="txt">纯文本</option>
                </select>
              </label>
              
              <label>
                文件名:
                <input
                  type="text"
                  value={exportConfig.filename || ''}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    filename: e.target.value
                  }))}
                  placeholder="留空自动生成"
                />
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={exportConfig.includeTableOfContents}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    includeTableOfContents: e.target.checked
                  }))}
                />
                包含目录
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={exportConfig.includeMetadata || false}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    includeMetadata: e.target.checked
                  }))}
                />
                包含元数据
              </label>
            </div>
          </div>

          {/* 导出结果 */}
          {exportResult && (
            <div className={`${styles.result} ${exportResult.success ? styles.success : styles.error}`}>
              {exportResult.success ? (
                <div>
                  <div className={styles.successIcon}>✓</div>
                  <span>导出成功: {exportResult.filename}</span>
                  {exportResult.downloadUrl && (
                    <a
                      href={exportResult.downloadUrl}
                      download={exportResult.filename}
                      className={styles.downloadLink}
                    >
                      重新下载
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <div className={styles.errorIcon}>✗</div>
                  <span>导出失败</span>
                  {exportResult.errors && (
                    <div className={styles.errors}>
                      {exportResult.errors.map((error, i) => (
                        <div key={i} className={styles.error}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 导出按钮 */}
          <div className={styles.actionButtons}>
            <button
              onClick={handleExport}
              disabled={!canExport || !exportContent.trim() || isProcessing}
              className={styles.primaryButton}
            >
              {isProcessing ? '导出中...' : '导出文档'}
            </button>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {showHistory && (
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h3>操作历史</h3>
            <button onClick={loadHistory} className={styles.loadHistoryButton}>
              {showHistoryPanel ? '隐藏历史' : '显示历史'}
            </button>
          </div>
          
          {showHistoryPanel && (
            <div className={styles.historyPanel}>
              {history.length === 0 ? (
                <p className={styles.emptyHistory}>暂无操作历史</p>
              ) : (
                <div className={styles.historyList}>
                  {history.map((record) => (
                    <div key={record.id} className={styles.historyItem}>
                      <div className={styles.historyInfo}>
                        <span className={`${styles.historyType} ${styles[record.type]}`}>
                          {record.type === 'import' ? '导入' : '导出'}
                        </span>
                        <span className={styles.historyFileName}>{record.fileName}</span>
                        <span className={styles.historyFormat}>{record.format.toUpperCase()}</span>
                        <span className={`${styles.historyStatus} ${styles[record.status]}`}>
                          {record.status === 'success' ? '成功' : '失败'}
                        </span>
                      </div>
                      <div className={styles.historyMeta}>
                        <span>{new Date(record.timestamp).toLocaleString()}</span>
                        <span>{(record.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      {record.errors && record.errors.length > 0 && (
                        <div className={styles.historyErrors}>
                          {record.errors.map((error, i) => (
                            <div key={i} className={styles.historyError}>• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportExport;
export type { ImportExportProps };