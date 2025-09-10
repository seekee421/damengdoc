import React, { useState } from 'react';
import styles from '../index.module.css';

interface StatItem {
  id: number;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ChartData {
  date: string;
  views: number;
  downloads: number;
  users: number;
}

interface TopDoc {
  id: number;
  title: string;
  views: number;
  downloads: number;
  path: string;
}

const StatsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('line');

  // 模拟统计数据
  const [overviewStats] = useState<StatItem[]>([
    { id: 1, name: '总访问量', value: 12456, change: 12.5, trend: 'up' },
    { id: 2, name: '总下载量', value: 3289, change: -2.3, trend: 'down' },
    { id: 3, name: '活跃用户', value: 856, change: 8.7, trend: 'up' },
    { id: 4, name: '文档数量', value: 234, change: 5.2, trend: 'up' }
  ]);

  // 模拟图表数据
  const [chartData] = useState<ChartData[]>([
    { date: '01-09', views: 1200, downloads: 320, users: 89 },
    { date: '01-10', views: 1350, downloads: 280, users: 95 },
    { date: '01-11', views: 1180, downloads: 350, users: 87 },
    { date: '01-12', views: 1420, downloads: 410, users: 102 },
    { date: '01-13', views: 1680, downloads: 380, users: 118 },
    { date: '01-14', views: 1520, downloads: 450, users: 108 },
    { date: '01-15', views: 1750, downloads: 520, users: 125 }
  ]);

  // 模拟热门文档数据
  const [topDocs] = useState<TopDoc[]>([
    { id: 1, title: '快速开始指南', views: 2456, downloads: 892, path: '/docs/quick-start' },
    { id: 2, title: 'API 接口文档', views: 1987, downloads: 654, path: '/docs/api' },
    { id: 3, title: '安装部署手册', views: 1654, downloads: 543, path: '/docs/installation' },
    { id: 4, title: '常见问题解答', views: 1432, downloads: 321, path: '/docs/faq' },
    { id: 5, title: '更新日志', views: 1298, downloads: 287, path: '/docs/changelog' }
  ]);

  const renderIcon = (iconName: string, color = '#666', className = '') => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'chart-bar': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
        </svg>
      ),
      'chart-line': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
        </svg>
      ),
      'eye': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      ),
      'download': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
        </svg>
      ),
      'users': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8.5 4C10.7 4 12.5 5.8 12.5 8S10.7 12 8.5 12 4.5 10.2 4.5 8 6.3 4 8.5 4M8.5 14C12.9 14 16.5 15.8 16.5 18V20H0V18C0 15.8 4.1 14 8.5 14Z" />
        </svg>
      ),
      'file': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      'trending-up': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M15,20.5V19H16.5V20.5H15M20.5,16.5V15H22V16.5H20.5M20.5,19V17.5H22V19H20.5M13,20.5V19H14.5V20.5H13M16.5,20.5V19H18V20.5H16.5M19,20.5V19H20.5V20.5H19M17,2L22,7H19V13H15V7H12L17,2Z" />
        </svg>
      ),
      'trending-down': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M15,3.5V5H16.5V3.5H15M20.5,7.5V9H22V7.5H20.5M20.5,5V6.5H22V5H20.5M13,3.5V5H14.5V3.5H13M16.5,3.5V5H18V3.5H16.5M19,3.5V5H20.5V3.5H19M17,22L12,17H15V11H19V17H22L17,22Z" />
        </svg>
      ),
      'calendar': (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={color}>
          <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
        </svg>
      )
    };
    return iconMap[iconName] || null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderOverview = () => (
    <div className={styles.statsOverview}>
      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        {overviewStats.map(stat => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statName}>{stat.name}</span>
              <div className={`${styles.trendIndicator} ${styles[stat.trend]}`}>
                {renderIcon(stat.trend === 'up' ? 'trending-up' : 'trending-down', 
                  stat.trend === 'up' ? '#10b981' : '#ef4444')}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <div className={styles.statValue}>{formatNumber(stat.value)}</div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className={styles.chartSection}>
        <div className={styles.contentCard}>
          <div className={styles.contentCardHeader}>
            <h3 className={styles.contentCardTitle}>访问趋势</h3>
            <div className={styles.chartControls}>
              <div className={styles.timeRangeSelector}>
                {['7d', '30d', '90d'].map(range => (
                  <button
                    key={range}
                    className={`${styles.timeButton} ${timeRange === range ? styles.active : ''}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
                  </button>
                ))}
              </div>
              <div className={styles.chartTypeSelector}>
                <button
                  className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
                  onClick={() => setChartType('line')}
                  title="折线图"
                >
                  {renderIcon('chart-line', chartType === 'line' ? '#3b82f6' : '#666')}
                </button>
                <button
                  className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
                  onClick={() => setChartType('bar')}
                  title="柱状图"
                >
                  {renderIcon('chart-bar', chartType === 'bar' ? '#3b82f6' : '#666')}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.viewsColor}`}></div>
                <span>访问量</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.downloadsColor}`}></div>
                <span>下载量</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.usersColor}`}></div>
                <span>用户数</span>
              </div>
            </div>
            <div className={styles.chartArea}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.chartBar}>
                  <div className={styles.barGroup}>
                    <div 
                      className={`${styles.bar} ${styles.viewsBar}`}
                      style={{ height: `${(data.views / 2000) * 100}%` }}
                      title={`访问量: ${data.views}`}
                    ></div>
                    <div 
                      className={`${styles.bar} ${styles.downloadsBar}`}
                      style={{ height: `${(data.downloads / 600) * 100}%` }}
                      title={`下载量: ${data.downloads}`}
                    ></div>
                    <div 
                      className={`${styles.bar} ${styles.usersBar}`}
                      style={{ height: `${(data.users / 150) * 100}%` }}
                      title={`用户数: ${data.users}`}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>{data.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 热门文档 */}
      <div className={styles.topDocsSection}>
        <div className={styles.contentCard}>
          <div className={styles.contentCardHeader}>
            <h3 className={styles.contentCardTitle}>热门文档</h3>
          </div>
          <div className={styles.topDocsList}>
            {topDocs.map((doc, index) => (
              <div key={doc.id} className={styles.topDocItem}>
                <div className={styles.docRank}>{index + 1}</div>
                <div className={styles.docInfo}>
                  <div className={styles.docTitle}>{doc.title}</div>
                  <div className={styles.docPath}>{doc.path}</div>
                </div>
                <div className={styles.docStats}>
                  <div className={styles.docStat}>
                    {renderIcon('eye', '#6b7280')}
                    <span>{formatNumber(doc.views)}</span>
                  </div>
                  <div className={styles.docStat}>
                    {renderIcon('download', '#6b7280')}
                    <span>{formatNumber(doc.downloads)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedStats = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>详细统计</h3>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton}>
            {renderIcon('download', '#666')}
            <span>导出报告</span>
          </button>
        </div>
      </div>
      
      <div className={styles.detailedStatsContainer}>
        <div className={styles.statsTable}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>文档名称</th>
                <th>访问量</th>
                <th>下载量</th>
                <th>平均停留时间</th>
                <th>跳出率</th>
                <th>最后访问</th>
              </tr>
            </thead>
            <tbody>
              {topDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className={styles.docName}>
                      {renderIcon('file', '#6b7280')}
                      <span>{doc.title}</span>
                    </div>
                  </td>
                  <td>{formatNumber(doc.views)}</td>
                  <td>{formatNumber(doc.downloads)}</td>
                  <td>2分35秒</td>
                  <td>23.5%</td>
                  <td>2024-01-15 14:30</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRealTimeStats = () => (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h3 className={styles.contentCardTitle}>实时统计</h3>
        <div className={styles.realTimeIndicator}>
          <div className={styles.pulseIndicator}></div>
          <span>实时更新</span>
        </div>
      </div>
      
      <div className={styles.realTimeContainer}>
        <div className={styles.realTimeStats}>
          <div className={styles.realTimeStat}>
            <div className={styles.realTimeValue}>156</div>
            <div className={styles.realTimeLabel}>当前在线用户</div>
          </div>
          <div className={styles.realTimeStat}>
            <div className={styles.realTimeValue}>23</div>
            <div className={styles.realTimeLabel}>今日新增访问</div>
          </div>
          <div className={styles.realTimeStat}>
            <div className={styles.realTimeValue}>8</div>
            <div className={styles.realTimeLabel}>今日新增下载</div>
          </div>
        </div>
        
        <div className={styles.recentActivity}>
          <h4>最近活动</h4>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityTime}>14:32</div>
              <div className={styles.activityContent}>用户 user123 访问了《API接口文档》</div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityTime}>14:30</div>
              <div className={styles.activityContent}>用户 admin 下载了《快速开始指南》</div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityTime}>14:28</div>
              <div className={styles.activityContent}>用户 editor1 访问了《安装部署手册》</div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityTime}>14:25</div>
              <div className={styles.activityContent}>用户 guest 搜索了关键词 \"API\"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.mainContent}>
      {/* 标签页导航 */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {renderIcon('chart-bar', activeTab === 'overview' ? '#3b82f6' : '#666')}
            <span>概览</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'detailed' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('detailed')}
          >
            {renderIcon('chart-line', activeTab === 'detailed' ? '#3b82f6' : '#666')}
            <span>详细统计</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'realtime' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('realtime')}
          >
            {renderIcon('eye', activeTab === 'realtime' ? '#3b82f6' : '#666')}
            <span>实时统计</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'detailed' && renderDetailedStats()}
      {activeTab === 'realtime' && renderRealTimeStats()}
    </div>
  );
};

export default StatsManagement;