// 导入导出功能演示页面

import React from 'react';
import Layout from '@theme/Layout';
import { ImportExport } from '../components/ImportExport';
import type { ImportResult, ExportResult } from '../types/import-export';

const ImportExportPage: React.FC = () => {
  const handleImportSuccess = (result: ImportResult) => {
    console.log('导入成功:', result);
    // 这里可以添加成功后的处理逻辑，比如跳转到编辑页面
    if (result.content) {
      // 可以将内容保存到状态管理或跳转到编辑器
      alert(`导入成功！内容长度: ${result.content.length} 字符`);
    }
  };

  const handleExportSuccess = (result: ExportResult) => {
    console.log('导出成功:', result);
    // 导出成功的处理逻辑
    if (result.success) {
      alert(`导出成功！文件: ${result.filename}`);
    }
  };

  return (
    <Layout
      title="文档导入导出"
      description="支持多种格式的文档导入导出功能，包括Word、PDF、Markdown等格式"
    >
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>文档导入导出</h1>
            <p className="margin-bottom--lg">
              支持多种格式的文档导入导出功能，让您轻松管理和转换文档内容。
            </p>
            
            <div className="card">
              <div className="card__body">
                <ImportExport
                  onImportSuccess={handleImportSuccess}
                  onExportSuccess={handleExportSuccess}
                  defaultMode="import"
                  showHistory={true}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                />
              </div>
            </div>
            
            <div className="margin-top--lg">
              <h2>功能特性</h2>
              <div className="row">
                <div className="col col--6">
                  <div className="card">
                    <div className="card__header">
                      <h3>📥 文档导入</h3>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>支持 Markdown (.md) 文件</li>
                        <li>支持纯文本 (.txt) 文件</li>
                        <li>支持 HTML (.html) 文件</li>
                        <li>支持 Word 文档 (.docx)</li>
                        <li>支持 PDF 文档 (.pdf)</li>
                        <li>批量导入多个文件</li>
                        <li>文件预览和验证</li>
                        <li>拖拽上传支持</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="col col--6">
                  <div className="card">
                    <div className="card__header">
                      <h3>📤 文档导出</h3>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>导出为 PDF 格式</li>
                        <li>导出为 Word 文档</li>
                        <li>导出为 Markdown 格式</li>
                        <li>导出为 HTML 格式</li>
                        <li>导出为纯文本格式</li>
                        <li>自定义导出配置</li>
                        <li>包含目录和元数据</li>
                        <li>批量导出支持</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="margin-top--lg">
              <h2>使用说明</h2>
              <div className="card">
                <div className="card__body">
                  <h3>导入文档</h3>
                  <ol>
                    <li>点击"导入文档"选项卡</li>
                    <li>拖拽文件到上传区域或点击选择文件</li>
                    <li>配置导入选项（目标格式、是否保持格式等）</li>
                    <li>预览文件内容和元数据</li>
                    <li>点击"导入"按钮开始处理</li>
                  </ol>
                  
                  <h3>导出文档</h3>
                  <ol>
                    <li>点击"导出文档"选项卡</li>
                    <li>在文本区域输入或粘贴要导出的内容</li>
                    <li>选择导出格式和配置选项</li>
                    <li>点击"导出文档"按钮</li>
                    <li>文件将自动下载到您的设备</li>
                  </ol>
                  
                  <h3>支持的格式</h3>
                  <div className="row margin-top--md">
                    <div className="col col--4">
                      <strong>导入格式:</strong>
                      <ul>
                        <li>.md (Markdown)</li>
                        <li>.txt (纯文本)</li>
                        <li>.html (HTML)</li>
                        <li>.docx (Word)</li>
                        <li>.pdf (PDF)</li>
                      </ul>
                    </div>
                    <div className="col col--4">
                      <strong>导出格式:</strong>
                      <ul>
                        <li>.pdf (PDF)</li>
                        <li>.docx (Word)</li>
                        <li>.md (Markdown)</li>
                        <li>.html (HTML)</li>
                        <li>.txt (纯文本)</li>
                      </ul>
                    </div>
                    <div className="col col--4">
                      <strong>文件限制:</strong>
                      <ul>
                        <li>最大文件大小: 50MB</li>
                        <li>支持批量处理</li>
                        <li>自动格式检测</li>
                        <li>内容预览</li>
                        <li>错误处理</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="margin-top--lg">
              <h2>注意事项</h2>
              <div className="admonition admonition-tip">
                <div className="admonition-heading">
                  <h5>💡 提示</h5>
                </div>
                <div className="admonition-content">
                  <ul>
                    <li>Word 和 PDF 文档的导入功能需要额外的库支持，目前提供基础实现</li>
                    <li>大文件处理可能需要较长时间，请耐心等待</li>
                    <li>建议在导入前预览文件内容以确保格式正确</li>
                    <li>导出的文件会自动下载到浏览器的默认下载目录</li>
                    <li>支持的图片格式会在导入时自动处理</li>
                  </ul>
                </div>
              </div>
              
              <div className="admonition admonition-caution">
                <div className="admonition-heading">
                  <h5>⚠️ 注意</h5>
                </div>
                <div className="admonition-content">
                  <ul>
                    <li>请确保上传的文件不包含敏感信息</li>
                    <li>大批量文件处理可能会影响浏览器性能</li>
                    <li>某些复杂格式的文档可能无法完美转换</li>
                    <li>建议定期清理浏览器缓存以释放存储空间</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImportExportPage;