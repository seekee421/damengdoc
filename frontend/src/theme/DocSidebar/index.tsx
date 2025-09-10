import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import DocSidebar from '@theme-original/DocSidebar';
import VersionSelector from '../../components/VersionSelector/VersionSelector';
import { downloadMultipleChaptersAsPdf } from '../../services/pdfService';
import styles from './sidebar.module.css';

export default function DocSidebarWrapper(props: any): React.ReactElement {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  // 可下载的章节列表
  const downloadableChapters = [
    { id: 'intro', name: 'DM数据库简介', size: '2.5MB' },
    { id: 'quickstart', name: '快速上手', size: '3.2MB' },
    { id: 'development', name: '应用开发', size: '5.8MB' },
    { id: 'deployment', name: '部署数据库', size: '4.1MB' },
    { id: 'migration', name: '数据迁移', size: '3.7MB' },
    { id: 'management', name: '管理数据库', size: '6.2MB' },
    { id: 'api', name: 'DM数据库 API', size: '4.9MB' },
    { id: 'search', name: '向量检索', size: '2.8MB' },
    { id: 'ecosystem', name: '生态集成', size: '3.5MB' },
    { id: 'troubleshooting', name: '实时数据', size: '2.1MB' }
  ];

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === downloadableChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(downloadableChapters.map(chapter => chapter.id));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedChapters.length === 0) {
      alert('请至少选择一个章节');
      return;
    }

    // 获取选中章节的信息
    const selectedChapterData = downloadableChapters
      .filter(chapter => selectedChapters.includes(chapter.id));
    
    const selectedIds = selectedChapterData.map(chapter => chapter.id);
    const selectedNames = selectedChapterData.map(chapter => chapter.name);
    
    console.log('开始下载章节:', selectedNames);
    
    try {
      // 显示下载中状态
      const downloadButton = document.querySelector('.downloadButton') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.textContent = '下载中...';
      }

      // 调用PDF转换服务
      const result = await downloadMultipleChaptersAsPdf(selectedIds, selectedNames);
      
      if (result.success) {
        console.log('PDF下载成功:', result.fileName);
        // 可以显示成功提示
        alert(`PDF下载成功: ${result.fileName}`);
      } else {
        console.error('PDF下载失败:', result.message);
        alert(`下载失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('下载过程中发生错误:', error);
      alert('下载失败，请稍后重试');
    } finally {
      // 恢复按钮状态
      const downloadButton = document.querySelector('.downloadButton') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.textContent = `下载 (${selectedChapters.length})`;
      }
      
      setShowDownloadModal(false);
      setSelectedChapters([]);
    }
  };

  const handleCancel = () => {
    setShowDownloadModal(false);
    setSelectedChapters([]);
  };

  return (
    <div className={styles.sidebarWrapper}>
      {/* 版本选择器 - 放在侧边栏顶部 */}
      <div className={styles.versionSelectorContainer}>
        <VersionSelector 
          position="sidebar"
          className={styles.sidebarVersionSelector}
        />
      </div>
      
      {/* 原始侧边栏内容 */}
      <div className={styles.originalSidebar}>
        <DocSidebar {...props} />
      </div>
      
      {/* 下载PDF按钮 - 固定在底部 */}
      <div className={styles.pdfDownloadContainer}>
        <button 
          className={styles.pdfDownloadButton}
          onClick={handleDownloadClick}
          title="下载PDF文档"
        >
          <svg 
            className={styles.downloadIcon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下载 PDF
        </button>
      </div>

      {/* 多选下载弹窗 - 使用Portal渲染到body */}
      {showDownloadModal && createPortal(
        <div className={styles.downloadModal}>
          <div className={styles.modalOverlay} onClick={handleCancel}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>选择章节</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCancel}
                title="关闭"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.selectAllContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedChapters.length === downloadableChapters.length}
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>全选</span>
                </label>
              </div>
              
              <div className={styles.chapterList}>
                {downloadableChapters.map((chapter) => (
                  <label key={chapter.id} className={styles.chapterItem}>
                    <input
                      type="checkbox"
                      checked={selectedChapters.includes(chapter.id)}
                      onChange={() => handleChapterToggle(chapter.id)}
                      className={styles.checkbox}
                    />
                    <div className={styles.chapterInfo}>
                      <span className={styles.chapterName}>{chapter.name}</span>
                      <span className={styles.chapterSize}>{chapter.size}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                取消
              </button>
              <button 
                className={styles.downloadButton}
                onClick={handleDownloadSelected}
                disabled={selectedChapters.length === 0}
              >
                下载 ({selectedChapters.length})
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}