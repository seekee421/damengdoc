import React from 'react';
import type { JSX } from 'react';
import Layout from '@theme/Layout';
import { Version } from '../components/VersionSelector/VersionSelector';
import styles from './version-history.module.css';

// 完整版本历史数据
const versionHistory: Version[] = [
  {
    id: 'v9.0-beta',
    name: 'v9.0-beta',
    label: 'DM9.0 Beta',
    path: '/docs/v9.0-beta',
    releaseDate: '2024-03-01',
    status: 'beta',
    description: '下一代版本预览，包含实验性功能和性能优化'
  },
  {
    id: 'v8.1',
    name: 'v8.1',
    label: 'DM8.1 (最新版)',
    path: '/docs/v8.1',
    isLatest: true,
    releaseDate: '2024-01-15',
    status: 'stable',
    description: '最新稳定版本，包含所有新特性和性能优化'
  },
  {
    id: 'v8.0',
    name: 'v8.0',
    label: 'DM8.0 (LTS)',
    path: '/docs/v8.0',
    isLTS: true,
    releaseDate: '2023-06-20',
    status: 'stable',
    description: '长期支持版本，稳定可靠，适合生产环境'
  },
  {
    id: 'v7.6',
    name: 'v7.6',
    label: 'DM7.6',
    path: '/docs/v7.6',
    releaseDate: '2022-12-10',
    status: 'stable',
    description: '经典版本，功能完善'
  },
  {
    id: 'v7.1',
    name: 'v7.1',
    label: 'DM7.1',
    path: '/docs/v7.1',
    releaseDate: '2021-08-15',
    status: 'deprecated',
    description: '已停止维护，建议升级到新版本'
  },
  {
    id: 'v6.0',
    name: 'v6.0',
    label: 'DM6.0',
    path: '/docs/v6.0',
    releaseDate: '2020-03-20',
    status: 'deprecated',
    description: '已停止维护，建议升级到新版本'
  }
];

// 版本特性数据
const versionFeatures: Record<string, string[]> = {
  'v9.0-beta': [
    '全新的查询优化器',
    '增强的并发控制',
    '改进的内存管理',
    '新增AI辅助功能',
    '云原生架构支持'
  ],
  'v8.1': [
    '性能提升30%',
    '新增JSON数据类型',
    '增强的安全特性',
    '改进的备份恢复',
    '优化的索引算法'
  ],
  'v8.0': [
    '分布式架构支持',
    '在线DDL操作',
    '增强的监控功能',
    '改进的高可用性',
    '新增数据压缩'
  ],
  'v7.6': [
    '稳定的ACID事务',
    '完整的SQL标准支持',
    '高性能存储引擎',
    '丰富的数据类型',
    '强大的管理工具'
  ]
};

function getStatusIcon(status: Version['status']) {
  switch (status) {
    case 'stable':
      return '✅';
    case 'beta':
      return '🧪';
    case 'alpha':
      return '⚠️';
    case 'deprecated':
      return '⚰️';
    default:
      return '';
  }
}

function getStatusLabel(status: Version['status']) {
  switch (status) {
    case 'stable':
      return '稳定版';
    case 'beta':
      return '测试版';
    case 'alpha':
      return '预览版';
    case 'deprecated':
      return '已弃用';
    default:
      return '';
  }
}

export default function VersionHistoryPage(): JSX.Element {
  const handleVersionClick = (version: Version) => {
    window.location.href = version.path;
  };

  return (
    <Layout
      title="版本历史"
      description="达梦数据库产品版本历史和特性对比"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>📋</span>
            产品版本历史
          </h1>
          <p className={styles.subtitle}>
            查看达梦数据库各个版本的发布时间、状态和主要特性
          </p>
        </div>

        <div className={styles.content}>
          {/* 版本时间线 */}
          <div className={styles.timeline}>
            {versionHistory.map((version, index) => (
              <div key={version.id} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <div className={`${styles.timelineDot} ${styles[version.status]}`}>
                    {getStatusIcon(version.status)}
                  </div>
                  {index < versionHistory.length - 1 && (
                    <div className={styles.timelineLine} />
                  )}
                </div>
                
                <div className={styles.versionCard}>
                  <div className={styles.versionHeader}>
                    <div className={styles.versionInfo}>
                      <h3 className={styles.versionName}>
                        {version.label}
                      </h3>
                      <div className={styles.versionBadges}>
                        {version.isLatest && (
                          <span className={styles.latestBadge}>最新</span>
                        )}
                        {version.isLTS && (
                          <span className={styles.ltsBadge}>LTS</span>
                        )}
                        <span className={`${styles.statusBadge} ${styles[version.status]}`}>
                          {getStatusIcon(version.status)} {getStatusLabel(version.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.versionMeta}>
                      <div className={styles.releaseDate}>
                        📅 {version.releaseDate}
                      </div>
                      <button 
                        className={styles.viewDocsButton}
                        onClick={() => handleVersionClick(version)}
                        disabled={version.status === 'deprecated'}
                      >
                        {version.status === 'deprecated' ? '已停止维护' : '查看文档'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.versionDescription}>
                    {version.description}
                  </div>
                  
                  {/* 版本特性 */}
                  {versionFeatures[version.id] && (
                    <div className={styles.versionFeatures}>
                      <h4 className={styles.featuresTitle}>
                        <span className={styles.featuresIcon}>✨</span>
                        主要特性
                      </h4>
                      <ul className={styles.featuresList}>
                        {versionFeatures[version.id].map((feature, idx) => (
                          <li key={idx} className={styles.featureItem}>
                            <span className={styles.featureIcon}>•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 版本对比表格 */}
        <div className={styles.comparisonSection}>
          <h2 className={styles.comparisonTitle}>
            <span className={styles.comparisonIcon}>📊</span>
            版本对比
          </h2>
          
          <div className={styles.comparisonTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>版本</th>
                  <th>发布日期</th>
                  <th>状态</th>
                  <th>支持情况</th>
                  <th>推荐用途</th>
                </tr>
              </thead>
              <tbody>
                {versionHistory.filter(v => v.status !== 'deprecated').map((version) => (
                  <tr key={version.id} className={styles.tableRow}>
                    <td className={styles.versionCell}>
                      <div className={styles.versionCellContent}>
                        <strong>{version.name}</strong>
                        <div className={styles.versionCellBadges}>
                          {version.isLatest && (
                            <span className={styles.latestBadge}>最新</span>
                          )}
                          {version.isLTS && (
                            <span className={styles.ltsBadge}>LTS</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{version.releaseDate}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[version.status]}`}>
                        {getStatusIcon(version.status)} {getStatusLabel(version.status)}
                      </span>
                    </td>
                    <td>
                      {version.isLTS ? '长期支持' : version.isLatest ? '积极维护' : '常规支持'}
                    </td>
                    <td>
                      {version.isLatest 
                        ? '新项目开发' 
                        : version.isLTS 
                        ? '生产环境' 
                        : version.status === 'beta' 
                        ? '测试评估' 
                        : '稳定项目'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 升级指南 */}
        <div className={styles.upgradeSection}>
          <h2 className={styles.upgradeTitle}>
            <span className={styles.upgradeIcon}>🚀</span>
            升级指南
          </h2>
          
          <div className={styles.upgradeCards}>
            <div className={styles.upgradeCard}>
              <h3 className={styles.upgradeCardTitle}>从 v7.x 升级到 v8.x</h3>
              <p className={styles.upgradeCardDesc}>
                重大版本升级，包含架构改进和新特性，建议详细阅读升级文档。
              </p>
              <a href="/docs/upgrade/v7-to-v8" className={styles.upgradeLink}>
                查看升级指南 →
              </a>
            </div>
            
            <div className={styles.upgradeCard}>
              <h3 className={styles.upgradeCardTitle}>从 v8.0 升级到 v8.1</h3>
              <p className={styles.upgradeCardDesc}>
                小版本升级，向后兼容，主要包含性能优化和bug修复。
              </p>
              <a href="/docs/upgrade/v8.0-to-v8.1" className={styles.upgradeLink}>
                查看升级指南 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}