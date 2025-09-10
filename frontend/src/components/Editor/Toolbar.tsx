// 编辑器工具栏组件

import React from 'react';
import type { ToolbarProps } from '../../types/editor';
import styles from './Toolbar.module.css';

export const Toolbar: React.FC<ToolbarProps> = ({ groups, className, style }) => {
  return (
    <div className={`${styles.toolbar} ${className || ''}`} style={style}>
      {groups.map(group => (
        <div key={group.id} className={styles.group}>
          {group.label && (
            <span className={styles.groupLabel}>{group.label}</span>
          )}
          <div className={styles.buttons}>
            {group.buttons.map(button => (
              <button
                key={button.id}
                className={`${styles.button} ${button.disabled ? styles.disabled : ''}`}
                onClick={button.action}
                disabled={button.disabled}
                title={button.tooltip || button.label}
                aria-label={button.label}
              >
                <span className={styles.icon}>{button.icon}</span>
                <span className={styles.label}>{button.label}</span>
                {button.shortcut && (
                  <span className={styles.shortcut}>{button.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toolbar;