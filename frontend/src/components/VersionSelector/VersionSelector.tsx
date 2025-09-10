import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { 
  AppstoreOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  WarningOutlined,
  DeleteOutlined,
  StarOutlined,
  SafetyOutlined,
  BookOutlined,
  TagOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CheckOutlined
} from '@ant-design/icons';
import styles from './VersionSelector.module.css';

// 版本信息接口
export interface Version {
  id: string;
  name: string;
  label: string;
  path: string;
  isLatest?: boolean;
  isLTS?: boolean;
  releaseDate?: string;
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
  description?: string;
}

// 版本选择器属性
interface VersionSelectorProps {
  versions?: Version[];
  currentVersion?: string;
  onVersionChange?: (version: Version) => void;
  className?: string;
  showDescription?: boolean;
  position?: 'navbar' | 'sidebar' | 'inline';
}

// 模拟版本数据
const defaultVersions: Version[] = [
  {
    id: 'dm8',
    name: 'DM8.1.3',
    label: 'DM8.1.3 (最新版)',
    path: '/docs/dm8',
    isLatest: true,
    releaseDate: '2024-01-15',
    status: 'stable',
    description: '最新稳定版本 - 推荐使用'
  },
  {
    id: 'dm8-prev',
    name: 'DM8.1.2',
    label: 'DM8.1.2',
    path: '/docs/dm8-prev',
    releaseDate: '2023-12-01',
    status: 'stable',
    description: '稳定版本'
  },
  {
    id: 'dm7',
    name: 'DM7.6.0',
    label: 'DM7.6.0 (LTS)',
    path: '/docs/dm7',
    isLTS: true,
    releaseDate: '2022-06-15',
    status: 'stable',
    description: '长期支持版本 (LTS)'
  },
  {
    id: 'dm6',
    name: 'DM6.0',
    label: 'DM6.0',
    path: '/docs/dm6',
    releaseDate: '2020-03-20',
    status: 'deprecated',
    description: '历史版本'
  },
  {
    id: 'v9.0-beta',
    name: 'v9.0-beta',
    label: 'DM9.0 Beta',
    path: '/docs/v9.0-beta',
    releaseDate: '2024-03-01',
    status: 'beta',
    description: '下一代版本预览，包含实验性功能'
  }
];

export default function VersionSelector({
  versions = defaultVersions,
  currentVersion,
  onVersionChange,
  className = '',
  showDescription = true,
  position = 'navbar'
}: VersionSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const location = useLocation();

  // 初始化当前版本
  useEffect(() => {
    if (currentVersion) {
      const version = versions.find(v => v.id === currentVersion);
      setSelectedVersion(version || versions[0]);
    } else {
      // 从URL路径推断当前版本
      const pathVersion = versions.find(v => location.pathname.startsWith(v.path));
      setSelectedVersion(pathVersion || versions.find(v => v.isLatest) || versions[0]);
    }
  }, [currentVersion, versions, location.pathname]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ESC键关闭下拉菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    setIsOpen(false);
    
    // 触发回调
    if (onVersionChange) {
      onVersionChange(version);
    }
    
    // 导航到对应版本的文档
    const currentPath = location.pathname;
    const currentVersionPath = selectedVersion?.path;
    
    if (currentVersionPath && currentPath.startsWith(currentVersionPath)) {
      // 替换当前版本路径为新版本路径
      const relativePath = currentPath.substring(currentVersionPath.length);
      const newPath = version.path + relativePath;
      history.push(newPath);
    } else {
      // 直接跳转到新版本首页
      history.push(version.path);
    }
  };

  const getStatusIcon = (status: Version['status']) => {
    switch (status) {
      case 'stable':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'beta':
        return <ExperimentOutlined style={{ color: '#faad14' }} />;
      case 'alpha':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'deprecated':
        return <DeleteOutlined style={{ color: '#8c8c8c' }} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Version['status']) => {
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
  };

  if (!selectedVersion) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      className={`${styles.versionSelector} ${styles[position]} ${className}`}
      ref={dropdownRef}
    >
      {/* 版本选择按钮 */}
      <button
        className={styles.versionButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`当前版本: ${selectedVersion.label}`}
      >
        <div className={styles.versionInfo}>
          <div className={styles.versionText}>
            <span className={styles.versionName}>{selectedVersion.name}</span>
            <div className={styles.badges}>

              {selectedVersion.isLTS && (
                <span className={styles.ltsBadge}><SafetyOutlined /> LTS</span>
              )}
              {selectedVersion.status === 'deprecated' && (
                <span className={styles.deprecatedBadge}><BookOutlined /> 历史</span>
              )}
            </div>
          </div>
        </div>
        <span className={`${styles.dropdownArrow} ${isOpen ? styles.open : ''}`}>
          {isOpen ? <CaretUpOutlined /> : <CaretDownOutlined />}
        </span>
      </button>

      {/* 版本下拉列表 */}
      {isOpen && (
        <div className={styles.versionDropdown} role="listbox">
          <div className={styles.dropdownHeader}>
            <span className={styles.headerIcon}><TagOutlined /></span>
            <span>选择产品版本</span>
          </div>
          
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div
                key={version.id}
                className={`${styles.versionItem} ${
                  version.id === selectedVersion.id ? styles.selected : ''
                }`}
                onClick={() => handleVersionSelect(version)}
                role="option"
                aria-selected={version.id === selectedVersion.id}
              >
                <div className={styles.versionItemHeader}>
                  <div className={styles.versionItemInfo}>
                    <span className={styles.versionItemName}>
                      {version.label}
                    </span>
                    <div className={styles.versionBadges}>
                      {version.isLatest && (
                        <span className={styles.latestBadge}>最新</span>
                      )}
                      {version.isLTS && (
                        <span className={styles.ltsBadge}>LTS</span>
                      )}
                      <span className={`${styles.statusBadge} ${styles[version.status]}`}>
                        <span style={{ marginRight: '4px' }}>{getStatusIcon(version.status)}</span> {getStatusLabel(version.status)}
                      </span>
                    </div>
                  </div>
                  {version.id === selectedVersion.id && (
                    <span className={styles.selectedIcon}><CheckOutlined /></span>
                  )}
                </div>
                
                {showDescription && version.description && (
                  <div className={styles.versionDescription}>
                    {version.description}
                  </div>
                )}
                
                {version.releaseDate && (
                  <div className={styles.versionMeta}>
                    <span className={styles.releaseDate}>
                      <CalendarOutlined /> 发布日期: {version.releaseDate}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}