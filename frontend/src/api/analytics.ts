// 访问统计API
import React from 'react';

// 访问数据接口
export interface PageView {
  id: string;
  path: string;
  title: string;
  timestamp: Date;
  userAgent: string;
  ip: string;
  referrer?: string;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  dailyViews: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueViews: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  searchQueries: Array<{
    query: string;
    count: number;
    lastSearched: Date;
  }>;
}

// 模拟数据存储
let pageViews: PageView[] = [];
let sessions: Map<string, { startTime: Date; lastActivity: Date; pageViews: number }> = new Map();

// 生成会话ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 获取设备类型
function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'Mobile';
  } else if (/Tablet|iPad/.test(userAgent)) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}

// 记录页面访问
export function trackPageView(data: {
  path: string;
  title: string;
  userAgent: string;
  ip: string;
  referrer?: string;
  sessionId?: string;
  userId?: string;
}): void {
  const sessionId = data.sessionId || generateSessionId();
  const now = new Date();
  
  // 记录页面访问
  const pageView: PageView = {
    id: Math.random().toString(36).substring(2),
    path: data.path,
    title: data.title,
    timestamp: now,
    userAgent: data.userAgent,
    ip: data.ip,
    referrer: data.referrer,
    sessionId,
    userId: data.userId
  };
  
  pageViews.push(pageView);
  
  // 更新会话信息
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastActivity = now;
    session.pageViews++;
  } else {
    sessions.set(sessionId, {
      startTime: now,
      lastActivity: now,
      pageViews: 1
    });
  }
  
  // 清理旧数据（保留30天）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  pageViews = pageViews.filter(pv => pv.timestamp > thirtyDaysAgo);
}

// 获取分析数据
export function getAnalyticsData(dateRange?: { start: Date; end: Date }): AnalyticsData {
  const now = new Date();
  const startDate = dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = dateRange?.end || now;
  
  // 过滤时间范围内的数据
  const filteredViews = pageViews.filter(pv => 
    pv.timestamp >= startDate && pv.timestamp <= endDate
  );
  
  // 计算基础统计
  const totalViews = filteredViews.length;
  const uniqueVisitors = new Set(filteredViews.map(pv => pv.sessionId)).size;
  
  // 计算平均会话时长
  let totalSessionDuration = 0;
  let validSessions = 0;
  sessions.forEach(session => {
    if (session.pageViews > 1) {
      totalSessionDuration += session.lastActivity.getTime() - session.startTime.getTime();
      validSessions++;
    }
  });
  const avgSessionDuration = validSessions > 0 ? totalSessionDuration / validSessions / 1000 : 0;
  
  // 计算跳出率
  const singlePageSessions = Array.from(sessions.values()).filter(s => s.pageViews === 1).length;
  const bounceRate = sessions.size > 0 ? (singlePageSessions / sessions.size) * 100 : 0;
  
  // 按日期分组统计
  const dailyStats = new Map<string, { views: number; visitors: Set<string> }>();
  filteredViews.forEach(pv => {
    const dateKey = pv.timestamp.toISOString().split('T')[0];
    if (!dailyStats.has(dateKey)) {
      dailyStats.set(dateKey, { views: 0, visitors: new Set() });
    }
    const dayStats = dailyStats.get(dateKey)!;
    dayStats.views++;
    dayStats.visitors.add(pv.sessionId);
  });
  
  const dailyViews = Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      views: stats.views,
      visitors: stats.visitors.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // 统计热门页面
  const pageStats = new Map<string, { title: string; views: number; visitors: Set<string> }>();
  filteredViews.forEach(pv => {
    if (!pageStats.has(pv.path)) {
      pageStats.set(pv.path, { title: pv.title, views: 0, visitors: new Set() });
    }
    const stats = pageStats.get(pv.path)!;
    stats.views++;
    stats.visitors.add(pv.sessionId);
  });
  
  const topPages = Array.from(pageStats.entries())
    .map(([path, stats]) => ({
      path,
      title: stats.title,
      views: stats.views,
      uniqueViews: stats.visitors.size
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // 统计设备类型
  const deviceStats = new Map<string, number>();
  filteredViews.forEach(pv => {
    const device = getDeviceType(pv.userAgent);
    deviceStats.set(device, (deviceStats.get(device) || 0) + 1);
  });
  
  const deviceStatsArray = Array.from(deviceStats.entries())
    .map(([device, count]) => ({
      device,
      count,
      percentage: totalViews > 0 ? (count / totalViews) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
  
  // 模拟搜索查询统计（实际应该从搜索API获取）
  const searchQueries = [
    { query: 'DM数据库安装', count: 45, lastSearched: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { query: 'SQL语法', count: 32, lastSearched: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { query: '备份恢复', count: 28, lastSearched: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { query: '性能优化', count: 21, lastSearched: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { query: '用户管理', count: 18, lastSearched: new Date(Date.now() - 10 * 60 * 60 * 1000) }
  ];
  
  return {
    totalViews,
    uniqueVisitors,
    avgSessionDuration,
    bounceRate,
    dailyViews,
    topPages,
    deviceStats: deviceStatsArray,
    searchQueries
  };
}

// 客户端页面访问跟踪
export function initPageTracking(): void {
  if (typeof window === 'undefined') return;
  
  // 获取或创建会话ID
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  // 跟踪当前页面
  const trackCurrentPage = () => {
    const data = {
      path: window.location.pathname,
      title: document.title,
      userAgent: navigator.userAgent,
      ip: '127.0.0.1', // 实际应该从服务器获取
      referrer: document.referrer,
      sessionId
    };
    
    trackPageView(data);
  };
  
  // 初始页面加载
  trackCurrentPage();
  
  // 监听路由变化（SPA）
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      setTimeout(trackCurrentPage, 100); // 延迟确保标题更新
    }
  });
  
  observer.observe(document.head, {
    childList: true,
    subtree: true
  });
  
  // 监听popstate事件
  window.addEventListener('popstate', trackCurrentPage);
}

// 导出用于组件的钩子
export function useAnalytics() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchData = () => {
      try {
        const analyticsData = getAnalyticsData();
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // 每5分钟刷新一次数据
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { data, loading };
}