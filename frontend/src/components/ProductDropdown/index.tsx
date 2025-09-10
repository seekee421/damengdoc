import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface ProductItem {
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface ProductSection {
  title: string;
  items: ProductItem[];
}

const productSections: ProductSection[] = [
  {
    title: '数据库产品',
    items: [
      {
        title: 'DM8 数据库',
        description: '新一代企业级数据库',
        icon: '🗄️',
        href: '/products/dm8',
      },
      {
        title: 'DM Cloud 云数据库',
        description: '弹性可扩展的云端数据库服务',
        icon: '☁️',
        href: '/products/dm-cloud',
      },
    ],
  },
  {
    title: '开发工具',
    items: [
      {
        title: 'DM 管理工具 (DMA)',
        description: '数据库管理和监控工具',
        icon: '🛠️',
        href: '/tools/dma',
      },
      {
        title: '数据迁移工具 (DMS)',
        description: '数据库迁移和同步工具',
        icon: '📊',
        href: '/tools/dms',
      },
      {
        title: '开发者工具 (DDC)',
        description: '数据库开发和调试工具',
        icon: '🔧',
        href: '/tools/ddc',
      },
      {
        title: '自动化运维 (DAS)',
        description: '数据库自动化运维平台',
        icon: '🚀',
        href: '/tools/das',
      },
    ],
  },
];

const ProductDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={clsx(styles.dropdown, { [styles.open]: isOpen })}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={styles.trigger}>
        产品
        <svg 
          className={styles.arrow} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="currentColor"
        >
          <path d="M6 8.5L2.5 5h7L6 8.5z" />
        </svg>
      </button>
      
      <div className={styles.content}>
        <div className={styles.container}>
          {productSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <div className={styles.grid}>
                {section.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.href}
                    className={styles.item}
                  >
                    <div className={styles.icon}>{item.icon}</div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemDescription}>{item.description}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDropdown;