// 编辑器状态栏组件

import React from 'react';
import type { StatusBarProps, EditorLanguage } from '../../types/editor';
import styles from './StatusBar.module.css';

export const StatusBar: React.FC<StatusBarProps> = ({
  info,
  className,
  style,
  onLanguageChange,
  onEncodingChange,
  onLineEndingChange
}) => {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value as EditorLanguage;
    onLanguageChange?.(language);
  };

  const handleEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const encoding = e.target.value;
    onEncodingChange?.(encoding);
  };

  const handleLineEndingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lineEnding = e.target.value;
    onLineEndingChange?.(lineEnding);
  };

  return (
    <div className={`${styles.statusBar} ${className || ''}`} style={style}>
      <div className={styles.left}>
        <span className={styles.item}>
          行 {info.line}, 列 {info.column}
        </span>
        
        {info.selection && (
          <span className={styles.item}>
            已选择 {info.selection.characters} 个字符，{info.selection.lines} 行
          </span>
        )}
        
        <span className={styles.item}>
          {info.wordCount} 词，{info.characterCount} 字符
        </span>
        
        {info.isDirty && (
          <span className={`${styles.item} ${styles.dirty}`}>
            ● 未保存
          </span>
        )}
      </div>
      
      <div className={styles.right}>
        <select 
          className={styles.select}
          value={info.language}
          onChange={handleLanguageChange}
          title="选择语言"
        >
          <option value="markdown">Markdown</option>
          <option value="html">HTML</option>
          <option value="plaintext">纯文本</option>
        </select>
        
        <select 
          className={styles.select}
          value={info.encoding}
          onChange={handleEncodingChange}
          title="选择编码"
        >
          <option value="UTF-8">UTF-8</option>
          <option value="ASCII">ASCII</option>
          <option value="GBK">GBK</option>
        </select>
        
        <select 
          className={styles.select}
          value={info.lineEnding}
          onChange={handleLineEndingChange}
          title="选择行结束符"
        >
          <option value="LF">LF</option>
          <option value="CRLF">CRLF</option>
          <option value="CR">CR</option>
        </select>
      </div>
    </div>
  );
};

export default StatusBar;