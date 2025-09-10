import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import GlobalSearch from '@site/src/components/Search/GlobalSearch';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <Heading as="h1" className={styles.heroTitle}>
              达梦数据库文档中心
            </Heading>
            <p className={styles.heroSubtitle}>
              专业的达梦数据库产品文档、技术指南和最佳实践
            </p>
            <div className={styles.heroSearch}>
              <GlobalSearch placeholder="搜索文档内容..." />
            </div>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                开始使用
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/docs/intro">
                快速入门
              </Link>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroImage}>
              <svg width="400" height="300" viewBox="0 0 400 300" fill="none" className={styles.techSvg}>
                {/* 背景容器 */}
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--dm-primary-5)" />
                <stop offset="100%" stopColor="var(--dm-primary-6)" />
                  </linearGradient>
                  <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b37feb" />
                    <stop offset="100%" stopColor="#722ed1" />
                  </linearGradient>
                  <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#73d13d" />
                    <stop offset="100%" stopColor="#52c41a" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 主容器 */}
                <rect width="400" height="300" rx="16" fill="url(#bgGradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                
                {/* 顶部标题栏 */}
                <rect x="16" y="16" width="368" height="48" rx="8" fill="url(#primaryGradient)" filter="url(#glow)" className={styles.animatedElement}/>
                <circle cx="40" cy="40" r="4" fill="rgba(255,255,255,0.8)" className={styles.pulseAnimation}/>
                <circle cx="56" cy="40" r="4" fill="rgba(255,255,255,0.6)" className={styles.pulseAnimation}/>
                <circle cx="72" cy="40" r="4" fill="rgba(255,255,255,0.4)" className={styles.pulseAnimation}/>
                <text x="200" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                  达梦数据库管理系统
                </text>
                
                {/* 数据库引擎模块 */}
                <rect x="16" y="80" width="180" height="100" rx="12" fill="url(#primaryGradient)" opacity="0.8" className={styles.floatAnimation}/>
                <rect x="24" y="88" width="164" height="16" rx="8" fill="rgba(255,255,255,0.3)"/>
                <rect x="24" y="112" width="120" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
                <rect x="24" y="128" width="140" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
                <rect x="24" y="144" width="100" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
                <text x="108" y="170" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                  数据库引擎
                </text>
                
                {/* 管理工具模块 */}
                <rect x="204" y="80" width="180" height="100" rx="12" fill="url(#secondaryGradient)" opacity="0.8" className={styles.floatAnimation}/>
                <circle cx="240" cy="110" r="12" fill="rgba(255,255,255,0.3)"/>
                <circle cx="270" cy="110" r="12" fill="rgba(255,255,255,0.3)"/>
                <circle cx="300" cy="110" r="12" fill="rgba(255,255,255,0.3)"/>
                <rect x="220" y="135" width="144" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                <rect x="220" y="145" width="100" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                <text x="294" y="170" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                  管理工具
                </text>
                
                {/* 开发者工具与API */}
                <rect x="16" y="196" width="368" height="88" rx="12" fill="url(#accentGradient)" opacity="0.8" className={styles.slideAnimation}/>
                <rect x="32" y="212" width="80" height="56" rx="8" fill="rgba(255,255,255,0.2)"/>
                <rect x="128" y="212" width="80" height="56" rx="8" fill="rgba(255,255,255,0.2)"/>
                <rect x="224" y="212" width="80" height="56" rx="8" fill="rgba(255,255,255,0.2)"/>
                <rect x="320" y="212" width="48" height="56" rx="8" fill="rgba(255,255,255,0.2)"/>
                <text x="200" y="278" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                  开发者工具与API
                </text>
                
                {/* 连接线动画 */}
                <path d="M108 180 L108 196" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className={styles.connectionLine}/>
                <path d="M294 180 L294 196" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className={styles.connectionLine}/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <Heading as="h2" className={styles.featuresTitle}>
            产品特色
          </Heading>
          <p className={styles.featuresSubtitle}>
            达梦数据库为企业级应用提供全方位的数据管理解决方案
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="var(--dm-primary-6)" fillOpacity="0.1"/>
                <path d="M24 12C29.5228 12 34 16.4772 34 22V26C34 31.5228 29.5228 36 24 36C18.4772 36 14 31.5228 14 26V22C14 16.4772 18.4772 12 24 12Z" fill="var(--dm-primary-6)"/>
                <path d="M20 20H28V24H20V20Z" fill="white"/>
                <path d="M20 26H28V30H20V26Z" fill="white"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>高性能架构</h3>
            <p className={styles.featureDescription}>
              采用先进的存储引擎和查询优化技术，提供卓越的数据处理性能
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#52c41a" fillOpacity="0.1"/>
                <path d="M24 12L30 18H26V30H22V18H18L24 12Z" fill="#52c41a"/>
                <path d="M16 32H32V36H16V32Z" fill="#52c41a"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>企业级安全</h3>
            <p className={styles.featureDescription}>
              多层次安全防护体系，支持数据加密、访问控制和审计追踪
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#722ed1" fillOpacity="0.1"/>
                <circle cx="24" cy="24" r="10" fill="#722ed1" fillOpacity="0.2"/>
                <circle cx="24" cy="24" r="6" fill="#722ed1"/>
                <path d="M24 20V28M20 24H28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>智能运维</h3>
            <p className={styles.featureDescription}>
              内置智能监控和自动化运维工具，降低管理复杂度
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageAdvantages() {
  return (
    <section className={styles.advantages}>
      <div className="container">
        <div className={styles.advantagesContent}>
          <div className={styles.advantagesLeft}>
            <Heading as="h2" className={styles.advantagesTitle}>
              为什么选择达梦数据库
            </Heading>
            <div className={styles.advantagesList}>
              <div className={styles.advantageItem}>
                <div className={styles.advantageNumber}>01</div>
                <div className={styles.advantageContent}>
                  <h4>自主可控</h4>
                  <p>完全自主研发的数据库产品，拥有完整的知识产权</p>
                </div>
              </div>
              <div className={styles.advantageItem}>
                <div className={styles.advantageNumber}>02</div>
                <div className={styles.advantageContent}>
                  <h4>高可用性</h4>
                  <p>支持集群部署和故障自动切换，保障业务连续性</p>
                </div>
              </div>
              <div className={styles.advantageItem}>
                <div className={styles.advantageNumber}>03</div>
                <div className={styles.advantageContent}>
                  <h4>标准兼容</h4>
                  <p>全面兼容SQL标准，支持主流数据库迁移</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.advantagesRight}>
            <div className={styles.advantagesImage}>
              <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
                <defs>
                  <linearGradient id="advantageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--dm-primary-5)" />
                <stop offset="100%" stopColor="var(--dm-primary-6)" />
                  </linearGradient>
                </defs>
                <rect width="400" height="300" rx="16" fill="url(#advantageGradient)" fillOpacity="0.1"/>
                <circle cx="200" cy="150" r="80" fill="url(#advantageGradient)" fillOpacity="0.2"/>
                <circle cx="200" cy="150" r="50" fill="url(#advantageGradient)" fillOpacity="0.4"/>
                <circle cx="200" cy="150" r="20" fill="var(--dm-primary-6)"/>
                <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">DM8</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="达梦数据库文档中心"
      description="达梦数据库官方文档中心，提供完整的产品文档、技术指南、API参考和最佳实践">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageAdvantages />
      </main>
    </Layout>
  );
}
