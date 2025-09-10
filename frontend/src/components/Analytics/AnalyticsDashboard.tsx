import React, { useState, useEffect } from 'react';
import { EyeOutlined, UserOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { useAnalytics, AnalyticsData } from '../../api/analytics';
import styles from './AnalyticsDashboard.module.css';

interface PageStats {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
}

interface DailyStats {
  date: string;
  views: number;
  visitors: number;
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

interface SearchQuery {
  query: string;
  count: number;
  resultClicks: number;
}

interface AnalyticsDashboardProps {
  dateRange?: string;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  dateRange = '最近7天',
  className
}) => {
  const { data, loading } = useAnalytics();
  const [selectedMetric, setSelectedMetric] = useState<string>('views');

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>加载统计数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${className || ''}`}>
      {/* 头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>访问统计</h1>
        <div className={styles.dateRange}>
          <span>时间范围：{dateRange}</span>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className={styles.overviewCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}><EyeOutlined /></div>
          <div className={styles.cardContent}>
            <h3>页面浏览量</h3>
            <div className={styles.cardValue}>{data.totalViews.toLocaleString()}</div>
            <div className={styles.cardChange}>+12.5% 较上周</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}><UserOutlined /></div>
          <div className={styles.cardContent}>
            <h3>独立访客</h3>
            <div className={styles.cardValue}>{data.uniqueVisitors.toLocaleString()}</div>
            <div className={styles.cardChange}>+8.3% 较上周</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}><ClockCircleOutlined /></div>
          <div className={styles.cardContent}>
            <h3>平均会话时长</h3>
            <div className={styles.cardValue}>{formatDuration(data.avgSessionDuration)}</div>
            <div className={styles.cardChange}>+5.2% 较上周</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}><BarChartOutlined /></div>
          <div className={styles.cardContent}>
            <h3>跳出率</h3>
            <div className={styles.cardValue}>{formatPercentage(data.bounceRate)}</div>
            <div className={styles.cardChange}>-2.1% 较上周</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className={styles.chartsSection}>
        {/* 趋势图 */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>访问趋势</h3>
            <div className={styles.chartControls}>
              <button 
                className={selectedMetric === 'views' ? styles.active : ''}
                onClick={() => setSelectedMetric('views')}
              >
                浏览量
              </button>
              <button 
                className={selectedMetric === 'visitors' ? styles.active : ''}
                onClick={() => setSelectedMetric('visitors')}
              >
                访客数
              </button>
            </div>
          </div>
          <div className={styles.chartContent}>
            <div className={styles.simpleChart}>
              {data.dailyViews.map((stat, index) => {
                const value = selectedMetric === 'views' ? stat.views : stat.visitors;
                const maxValue = Math.max(...data.dailyViews.map(s => 
                  selectedMetric === 'views' ? s.views : s.visitors
                ));
                const height = (value / maxValue) * 100;
                
                return (
                  <div key={stat.date} className={styles.chartBar}>
                    <div 
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                      title={`${stat.date}: ${value}`}
                    ></div>
                    <div className={styles.barLabel}>
                      {new Date(stat.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 设备统计 */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>设备分布</h3>
          </div>
          <div className={styles.chartContent}>
            <div className={styles.deviceStats}>
              {data.deviceStats.map((device, index) => (
                <div key={device.device} className={styles.deviceItem}>
                  <div className={styles.deviceInfo}>
                    <span className={styles.deviceName}>{device.device}</span>
                    <span className={styles.deviceCount}>{device.count.toLocaleString()}</span>
                  </div>
                  <div className={styles.deviceBar}>
                    <div 
                      className={styles.deviceProgress}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.devicePercentage}>{device.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 详细数据 */}
      <div className={styles.detailsSection}>
        {/* 热门页面 */}
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <h3>热门页面</h3>
          </div>
          <div className={styles.detailContent}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div>页面</div>
                <div>浏览量</div>
                <div>独立访问</div>
                <div>平均停留</div>
              </div>
              {data.topPages.map((page, index) => (
                <div key={page.path} className={styles.tableRow}>
                  <div className={styles.pageInfo}>
                    <div className={styles.pageTitle}>{page.title}</div>
                    <div className={styles.pagePath}>{page.path}</div>
                  </div>
                  <div>{page.views.toLocaleString()}</div>
                  <div>{page.uniqueViews.toLocaleString()}</div>
                  <div>-</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 搜索查询 */}
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <h3>热门搜索</h3>
          </div>
          <div className={styles.detailContent}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div>搜索词</div>
                <div>搜索次数</div>
                <div>点击次数</div>
                <div>点击率</div>
              </div>
              {data.searchQueries.map((query, index) => {
                const clickRate = query.count > 0 ? 0 : 0; // 由于没有 resultClicks 属性,暂时返回 0
                return (
                  <div key={query.query} className={styles.tableRow}>
                    <div className={styles.queryText}>{query.query}</div>
                    <div>{query.count}</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;