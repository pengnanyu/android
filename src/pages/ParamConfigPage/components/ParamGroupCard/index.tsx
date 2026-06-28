import type { ParamItem } from '@/types';
import { ParamRow } from './ParamRow';
import styles from './ParamGroupCard.module.css';

interface ParamGroupCardProps {
  groupName: string;
  params: ParamItem[];
  onValueChange: (key: string, newValue: string | number) => void;
  onBlur: (key: string) => void;
  onBack?: () => void;
}

export function ParamGroupCard({ groupName, params, onValueChange, onBlur, onBack }: ParamGroupCardProps) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="返回">
            ‹
          </button>
        )}
        <span className={styles.groupTitle}>{groupName}</span>
      </div>
      <div className={styles.groupContent}>
        <div className={styles.rowHeader}>
          <span>名称</span>
          <span>当前值</span>
          <span>设定值</span>
          <span>单位</span>
        </div>
        {params.map((param) => (
          <ParamRow key={param.key} param={param} onValueChange={onValueChange} onBlur={onBlur} />
        ))}
      </div>
    </div>
  );
}
