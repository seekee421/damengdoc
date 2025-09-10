import React from 'react';
import {
  DatabaseOutlined,
  CloudOutlined,
  ToolOutlined,
  BarChartOutlined,
  SettingOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import styles from './styles.module.css';

interface NavbarDropdownItemProps {
  icon: 'database' | 'cloud' | 'tool' | 'chart' | 'setting' | 'rocket';
  label: string;
  href: string;
}

const iconMap = {
  database: DatabaseOutlined,
  cloud: CloudOutlined,
  tool: ToolOutlined,
  chart: BarChartOutlined,
  setting: SettingOutlined,
  rocket: RocketOutlined,
};

const NavbarDropdownItem: React.FC<NavbarDropdownItemProps> = ({ icon, label, href }) => {
  const IconComponent = iconMap[icon];
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = href;
  };
  
  return (
    <div className={styles.dropdownItem} onClick={handleClick}>
      <IconComponent className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default NavbarDropdownItem;