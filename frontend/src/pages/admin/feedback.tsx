import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import Layout from '@theme/Layout';
import { 
  LikeOutlined, 
  DislikeOutlined, 
  BulbOutlined, 
  BugOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
  SearchOutlined,
  InboxOutlined,
  StarOutlined,
  CalendarOutlined,
  MailOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import styles from './feedback.module.css';

// 反馈数据接口
interface FeedbackData {
  id: string;
  type: 'helpful' | 'not-helpful' | 'suggestion' | 'error';
  rating?: number;
  comment?: string;
  email?: string;
  timestamp: number;
  docPath: string;
  docTitle: string;
  userAgent: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}

// 反馈统计接口
interface FeedbackStats {
  total: number;
  helpful: number;
  notHelpful: number;
  suggestions: number;
  errors: number;
  pending: number;
  resolved: number;
}

// 过滤选项
type FilterType = 'all' | 'helpful' | 'not-helpful' | 'suggestion' | 'error';
type StatusFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';

const typeLabels = {
  'helpful': '有帮助',
  'not-helpful': '没帮助',
  'suggestion': '建议',
  'error': '错误'
};

const statusLabels = {
  'pending': '待处理',
  'reviewed': '已查看',
  'resolved': '已解决',
  'dismissed': '已忽略'
};

const typeIcons = {
  'helpful': <LikeOutlined />,
  'not-helpful': <DislikeOutlined />,
  'suggestion': <BulbOutlined />,
  'error': <BugOutlined />
};

const statusIcons = {
  'pending': <ClockCircleOutlined />,
  'reviewed': <EyeOutlined />,
  'resolved': <CheckCircleOutlined />,
  'dismissed': <CloseCircleOutlined />
};

export default function FeedbackManagementPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    helpful: 0,
    notHelpful: 0,
    suggestions: 0,
    errors: 0,
    pending: 0,
    resolved: 0
  });
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'type' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 加载反馈数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFeedback = localStorage.getItem('doc-feedback');
      if (savedFeedback) {
        const feedback: FeedbackData[] = JSON.parse(savedFeedback).map((item: FeedbackData) => ({
          ...item,
          status: item.status || 'pending'
        }));
        setFeedbackList(feedback);
        calculateStats(feedback);
      }
    }
  }, []);

  // 计算统计数据
  const calculateStats = (feedback: FeedbackData[]) => {
    const newStats: FeedbackStats = {
      total: feedback.length,
      helpful: feedback.filter(f => f.type === 'helpful').length,
      notHelpful: feedback.filter(f => f.type === 'not-helpful').length,
      suggestions: feedback.filter(f => f.type === 'suggestion').length,
      errors: feedback.filter(f => f.type === 'error').length,
      pending: feedback.filter(f => f.status === 'pending').length,
      resolved: feedback.filter(f => f.status === 'resolved').length
    };
    setStats(newStats);
  };

  // 过滤和排序反馈
  useEffect(() => {
    let filtered = [...feedbackList];

    // 类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.type === typeFilter);
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.docTitle.toLowerCase().includes(term) ||
        f.docPath.toLowerCase().includes(term) ||
        (f.comment && f.comment.toLowerCase().includes(term)) ||
        (f.email && f.email.toLowerCase().includes(term))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status || 'pending';
          bValue = b.status || 'pending';
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFeedback(filtered);
  }, [feedbackList, typeFilter, statusFilter, searchTerm, sortBy, sortOrder]);

  // 更新反馈状态
  const updateFeedbackStatus = (feedbackId: string, status: FeedbackData['status'], notes?: string) => {
    const updatedFeedback = feedbackList.map(f => {
      if (f.id === feedbackId) {
        return {
          ...f,
          status,
          adminNotes: notes || f.adminNotes,
          reviewedBy: user?.username,
          reviewedAt: Date.now()
        };
      }
      return f;
    });
    
    setFeedbackList(updatedFeedback);
    calculateStats(updatedFeedback);
    localStorage.setItem('doc-feedback', JSON.stringify(updatedFeedback));
  };

  // 处理反馈详情
  const handleFeedbackClick = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.adminNotes || '');
    setShowModal(true);
  };

  // 保存管理员备注
  const saveAdminNotes = () => {
    if (selectedFeedback) {
      updateFeedbackStatus(selectedFeedback.id, selectedFeedback.status, adminNotes);
      setShowModal(false);
    }
  };

  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 权限检查
  if (!isAdmin) {
    return (
      <Layout title="访问被拒绝">
        <div className={styles.accessDenied}>
          <h1>访问被拒绝</h1>
          <p>您没有权限访问此页面。</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="反馈管理" description="管理用户反馈和建议">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}><BarChartOutlined /></span>
            反馈管理
          </h1>
          <p className={styles.subtitle}>
            查看和管理用户对文档的反馈和建议
          </p>
        </div>

        {/* 统计卡片 */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><RiseOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>总反馈</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><LikeOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.helpful}</div>
              <div className={styles.statLabel}>有帮助</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><BulbOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.suggestions}</div>
              <div className={styles.statLabel}>建议</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><BugOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.errors}</div>
              <div className={styles.statLabel}>错误报告</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><ClockCircleOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.pending}</div>
              <div className={styles.statLabel}>待处理</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><CheckCircleOutlined /></div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.resolved}</div>
              <div className={styles.statLabel}>已解决</div>
            </div>
          </div>
        </div>

        {/* 过滤和搜索 */}
        <div className={styles.controls}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>类型:</label>
              <select 
                className={styles.filterSelect}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              >
                <option value="all">全部类型</option>
                <option value="helpful">有帮助</option>
                <option value="not-helpful">没帮助</option>
                <option value="suggestion">建议</option>
                <option value="error">错误</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>状态:</label>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="reviewed">已查看</option>
                <option value="resolved">已解决</option>
                <option value="dismissed">已忽略</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>排序:</label>
              <select 
                className={styles.filterSelect}
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
              >
                <option value="timestamp-desc">最新优先</option>
                <option value="timestamp-asc">最旧优先</option>
                <option value="type-asc">类型排序</option>
                <option value="status-asc">状态排序</option>
              </select>
            </div>
          </div>
          
          <div className={styles.searchGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索文档标题、路径或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

        {/* 反馈列表 */}
        <div className={styles.feedbackList}>
          {filteredFeedback.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>暂无反馈数据</div>
            </div>
          ) : (
            filteredFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className={styles.feedbackItem}
                onClick={() => handleFeedbackClick(feedback)}
              >
                <div className={styles.feedbackHeader}>
                  <div className={styles.feedbackType}>
                    <span className={styles.typeIcon}>
                      {typeIcons[feedback.type]}
                    </span>
                    <span className={styles.typeLabel}>
                      {typeLabels[feedback.type]}
                    </span>
                  </div>
                  
                  <div className={styles.feedbackStatus}>
                    <span className={`${styles.statusBadge} ${styles[feedback.status || 'pending']}`}>
                      {statusIcons[feedback.status || 'pending']} {statusLabels[feedback.status || 'pending']}
                    </span>
                  </div>
                </div>
                
                <div className={styles.feedbackContent}>
                  <div className={styles.docInfo}>
                    <strong>{feedback.docTitle}</strong>
                    <span className={styles.docPath}>{feedback.docPath}</span>
                  </div>
                  
                  {feedback.rating && (
                    <div className={styles.rating}>
                      {'⭐'.repeat(feedback.rating)}
                    </div>
                  )}
                  
                  {feedback.comment && (
                    <div className={styles.comment}>
                      {feedback.comment.length > 100 
                        ? `${feedback.comment.substring(0, 100)}...` 
                        : feedback.comment
                      }
                    </div>
                  )}
                </div>
                
                <div className={styles.feedbackMeta}>
                  <div className={styles.timestamp}>
                    📅 {formatDate(feedback.timestamp)}
                  </div>
                  {feedback.email && (
                    <div className={styles.email}>
                      📧 {feedback.email}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 反馈详情模态框 */}
        {showModal && selectedFeedback && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  <span className={styles.modalIcon}>
                    {typeIcons[selectedFeedback.type]}
                  </span>
                  反馈详情
                </h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>类型:</label>
                  <span className={styles.detailValue}>
                    {typeIcons[selectedFeedback.type]} {typeLabels[selectedFeedback.type]}
                  </span>
                </div>
                
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>文档:</label>
                  <div className={styles.detailValue}>
                    <div><strong>{selectedFeedback.docTitle}</strong></div>
                    <div className={styles.docPath}>{selectedFeedback.docPath}</div>
                  </div>
                </div>
                
                {selectedFeedback.rating && (
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>评分:</label>
                    <span className={styles.detailValue}>
                      {'⭐'.repeat(selectedFeedback.rating)} ({selectedFeedback.rating}/5)
                    </span>
                  </div>
                )}
                
                {selectedFeedback.comment && (
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>内容:</label>
                    <div className={styles.detailValue}>
                      {selectedFeedback.comment}
                    </div>
                  </div>
                )}
                
                {selectedFeedback.email && (
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>邮箱:</label>
                    <span className={styles.detailValue}>{selectedFeedback.email}</span>
                  </div>
                )}
                
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>时间:</label>
                  <span className={styles.detailValue}>{formatDate(selectedFeedback.timestamp)}</span>
                </div>
                
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>状态:</label>
                  <select 
                    className={styles.statusSelect}
                    value={selectedFeedback.status || 'pending'}
                    onChange={(e) => {
                      const newStatus = e.target.value as FeedbackData['status'];
                      setSelectedFeedback({
                        ...selectedFeedback,
                        status: newStatus
                      });
                    }}
                  >
                    <option value="pending">待处理</option>
                    <option value="reviewed">已查看</option>
                    <option value="resolved">已解决</option>
                    <option value="dismissed">已忽略</option>
                  </select>
                </div>
                
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>管理员备注:</label>
                  <textarea
                    className={styles.notesTextarea}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="添加处理备注..."
                    rows={4}
                  />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={saveAdminNotes}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}