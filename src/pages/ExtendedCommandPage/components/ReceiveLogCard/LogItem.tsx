import type { LogEntry } from './index';
import styles from './LogItem.module.css';

interface LogItemProps {
  entry: LogEntry;
}

export function LogItem({ entry }: LogItemProps) {
  const time = new Date(entry.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

  const configTypeClass = entry.configType
    ? styles[entry.configType === 'Data Memery' ? 'dm' : entry.configType === 'Info' ? 'ir' : entry.configType === 'Calendar' ? 'cl' : 'rg']
    : undefined;

  const configTypeLabel = entry.configType
    ? entry.configType === 'Data Memery' ? 'DM' : entry.configType === 'Info' ? 'IR' : entry.configType === 'Calendar' ? 'CL' : 'RG'
    : undefined;

  return (
    <div className={styles.logItem}>
      <span className={styles.time}>{timeStr}</span>
      <span className={`${styles.direction} ${entry.direction === 'TX' ? styles.tx : styles.rx}`}>
        {entry.direction}
      </span>
      {configTypeLabel && configTypeClass && (
        <span className={`${styles.configType} ${configTypeClass}`}>{configTypeLabel}</span>
      )}
      {entry.parsedInfo && <span className={styles.parsed}>{entry.parsedInfo}</span>}
      <span className={styles.rawHex}>{entry.rawHex}</span>
    </div>
  );
}