import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import styles from './DocFeedback.module.css';

// 反馈类型
type FeedbackType = 'helpful' | 'not-helpful' | 'suggestion' | 'error';

// 反馈数据接口
interface FeedbackData {
  id: string;
  type: FeedbackType;
  rating?: number;
  comment?: string;
  email?: string;
  timestamp: number;
  docPath: string;
  docTitle: string;
  userAgent: string;
}

// 组件属性
interface DocFeedbackProps {
  docPath?: string;
  docTitle?: string;
  className?: string;
  showDetailedForm?: boolean;
  position?: 'bottom' | 'sidebar' | 'inline';
}

// 反馈选项配置
const feedbackOptions = [
  {
    type: 'helpful' as FeedbackType,
    icon: '👍',
    label: '有帮助',
    description: '这个文档对我很有用'
  },
  {
    type: 'not-helpful' as FeedbackType,
    icon: '👎',
    label: '没帮助',
    description: '这个文档没有解决我的问题'
  },
  {
    type: 'suggestion' as FeedbackType,
    icon: '💡',
    label: '建议',
    description: '我有改进建议'
  },
  {
    type: 'error' as FeedbackType,
    icon: '🐛',
    label: '错误',
    description: '发现了错误或问题'
  }
];

// 评分标签
const ratingLabels = {
  1: '很差',
  2: '较差',
  3: '一般',
  4: '较好',
  5: '很好'
};

export default function DocFeedback({
  docPath = '',
  docTitle = '',
  className = '',
  showDetailedForm = false,
  position = 'bottom'
}: DocFeedbackProps): JSX.Element {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState({
    helpful: 0,
    notHelpful: 0,
    total: 0
  });

  // 获取当前页面信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 从localStorage获取反馈统计
      const savedStats = localStorage.getItem(`feedback-stats-${docPath}`);
      if (savedStats) {
        setFeedbackStats(JSON.parse(savedStats));
      }
      
      // 检查是否已经提交过反馈
      const submittedFeedback = localStorage.getItem(`feedback-submitted-${docPath}`);
      if (submittedFeedback) {
        setIsSubmitted(true);
      }
    }
  }, [docPath]);

  // 处理快速反馈
  const handleQuickFeedback = async (type: FeedbackType) => {
    if (isSubmitted) return;
    
    setSelectedType(type);
    
    if (type === 'helpful' || type === 'not-helpful') {
      // 直接提交简单反馈
      await submitFeedback({
        type,
        rating: type === 'helpful' ? 5 : 2
      });
    } else {
      // 显示详细表单
      setShowForm(true);
    }
  };

  // 提交反馈
  const submitFeedback = async (feedbackData: Partial<FeedbackData>) => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      const feedback: FeedbackData = {
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: feedbackData.type || selectedType!,
        rating: feedbackData.rating || rating,
        comment: feedbackData.comment || comment,
        email: feedbackData.email || email,
        timestamp: Date.now(),
        docPath: docPath || window.location.pathname,
        docTitle: docTitle || document.title,
        userAgent: navigator.userAgent
      };
      
      // 保存到localStorage（实际项目中应该发送到服务器）
      const existingFeedback = JSON.parse(localStorage.getItem('doc-feedback') || '[]');
      existingFeedback.push(feedback);
      localStorage.setItem('doc-feedback', JSON.stringify(existingFeedback));
      
      // 更新统计数据
      const newStats = { ...feedbackStats };
      if (feedback.type === 'helpful') {
        newStats.helpful += 1;
      } else if (feedback.type === 'not-helpful') {
        newStats.notHelpful += 1;
      }
      newStats.total += 1;
      
      setFeedbackStats(newStats);
      localStorage.setItem(`feedback-stats-${docPath}`, JSON.stringify(newStats));
      localStorage.setItem(`feedback-submitted-${docPath}`, 'true');
      
      setIsSubmitted(true);
      setShowForm(false);
      
      // 显示成功消息
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedType(null);
        setRating(0);
        setComment('');
        setEmail('');
      }, 3000);
      
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    
    await submitFeedback({
      type: selectedType,
      rating,
      comment,
      email
    });
  };

  // 重置表单
  const resetForm = () => {
    setSelectedType(null);
    setShowForm(false);
    setRating(0);
    setComment('');
    setEmail('');
  };

  // 计算有用率
  const helpfulRate = feedbackStats.total > 0 
    ? Math.round((feedbackStats.helpful / feedbackStats.total) * 100) 
    : 0;

  return (
    <div className={`${styles.feedbackContainer} ${styles[position]} ${className}`}>
      {/* 反馈统计 */}
      {feedbackStats.total > 0 && (
        <div className={styles.feedbackStats}>
          <div className={styles.statsItem}>
            <span className={styles.statsIcon}>📊</span>
            <span className={styles.statsText}>
              {feedbackStats.total} 人反馈，{helpfulRate}% 认为有用
            </span>
          </div>
        </div>
      )}
      
      {/* 成功提示 */}
      {isSubmitted && (
        <div className={styles.successMessage}>
          <span className={styles.successIcon}>✅</span>
          <span className={styles.successText}>感谢您的反馈！</span>
        </div>
      )}
      
      {/* 反馈选项 */}
      {!isSubmitted && !showForm && (
        <div className={styles.feedbackSection}>
          <div className={styles.feedbackHeader}>
            <h3 className={styles.feedbackTitle}>
              <span className={styles.feedbackTitleIcon}>💬</span>
              这个页面对您有帮助吗？
            </h3>
          </div>
          
          <div className={styles.feedbackOptions}>
            {feedbackOptions.map((option) => (
              <button
                key={option.type}
                className={`${styles.feedbackOption} ${
                  selectedType === option.type ? styles.selected : ''
                }`}
                onClick={() => handleQuickFeedback(option.type)}
                disabled={isSubmitting}
                title={option.description}
              >
                <span className={styles.optionIcon}>{option.icon}</span>
                <span className={styles.optionLabel}>{option.label}</span>
              </button>
            ))}
          </div>
          
          {showDetailedForm && (
            <button 
              className={styles.detailedFeedbackButton}
              onClick={() => setShowForm(true)}
            >
              <span className={styles.detailedIcon}>📝</span>
              提供详细反馈
            </button>
          )}
        </div>
      )}
      
      {/* 详细反馈表单 */}
      {showForm && !isSubmitted && (
        <div className={styles.feedbackForm}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              <span className={styles.formTitleIcon}>
                {feedbackOptions.find(opt => opt.type === selectedType)?.icon}
              </span>
              {feedbackOptions.find(opt => opt.type === selectedType)?.label}反馈
            </h3>
            <button 
              className={styles.closeButton}
              onClick={resetForm}
              type="button"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleFormSubmit} className={styles.form}>
            {/* 评分 */}
            {(selectedType === 'helpful' || selectedType === 'not-helpful') && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span className={styles.labelIcon}>⭐</span>
                  整体评分
                </label>
                <div className={styles.ratingGroup}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starButton} ${
                        star <= rating ? styles.starActive : ''
                      }`}
                      onClick={() => setRating(star)}
                    >
                      ⭐
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className={styles.ratingLabel}>
                      {ratingLabels[rating as keyof typeof ratingLabels]}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* 评论 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span className={styles.labelIcon}>💭</span>
                {selectedType === 'suggestion' ? '您的建议' : 
                 selectedType === 'error' ? '问题描述' : '详细说明'}
                {selectedType === 'suggestion' || selectedType === 'error' ? 
                  <span className={styles.required}>*</span> : ''}
              </label>
              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  selectedType === 'suggestion' ? '请描述您的改进建议...' :
                  selectedType === 'error' ? '请详细描述遇到的问题...' :
                  '请分享您的想法...'
                }
                rows={4}
                required={selectedType === 'suggestion' || selectedType === 'error'}
              />
            </div>
            
            {/* 邮箱（可选） */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span className={styles.labelIcon}>📧</span>
                邮箱地址（可选）
              </label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="如需回复，请留下邮箱"
              />
              <div className={styles.inputHint}>
                我们可能会就您的反馈与您联系
              </div>
            </div>
            
            {/* 提交按钮 */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || (selectedType === 'suggestion' && !comment.trim()) || (selectedType === 'error' && !comment.trim())}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.loadingIcon}>⏳</span>
                    提交中...
                  </>
                ) : (
                  <>
                    <span className={styles.submitIcon}>📤</span>
                    提交反馈
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}