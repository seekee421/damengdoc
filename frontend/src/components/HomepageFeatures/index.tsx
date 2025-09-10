import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

// 创建自定义SVG图标组件
function DatabaseIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 100 100" fill="currentColor">
      <ellipse cx="50" cy="20" rx="30" ry="8" fill="#0066cc"/>
      <rect x="20" y="20" width="60" height="40" fill="#0066cc" opacity="0.8"/>
      <ellipse cx="50" cy="60" rx="30" ry="8" fill="#0066cc"/>
      <ellipse cx="50" cy="75" rx="30" ry="8" fill="#0066cc" opacity="0.6"/>
    </svg>
  );
}

function PerformanceIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="35" fill="none" stroke="#28a745" strokeWidth="4"/>
      <path d="M30 50 L45 65 L70 35" stroke="#28a745" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="3" fill="#28a745"/>
    </svg>
  );
}

function SecurityIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 10 L20 25 L20 55 C20 70 35 85 50 90 C65 85 80 70 80 55 L80 25 Z" fill="#dc3545"/>
      <path d="M40 45 L47 52 L60 35" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

const FeatureList: FeatureItem[] = [
  {
    title: '高性能数据库引擎',
    Svg: DatabaseIcon,
    description: (
      <>
        达梦数据库采用先进的存储引擎和查询优化技术，
        提供卓越的性能表现，支持海量数据处理和高并发访问。
      </>
    ),
  },
  {
    title: '企业级可靠性',
    Svg: PerformanceIcon,
    description: (
      <>
        提供完整的事务处理、数据一致性保障和故障恢复机制，
        确保关键业务数据的安全性和系统的高可用性。
      </>
    ),
  },
  {
    title: '全面安全防护',
    Svg: SecurityIcon,
    description: (
      <>
        内置多层安全防护体系，包括访问控制、数据加密、
        审计日志等功能，满足企业级安全合规要求。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
