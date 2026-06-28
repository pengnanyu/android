import { useTranslation } from 'react-i18next';
import { CardShell } from '@/components/shared/CardShell';
import { LogItem } from './LogItem';
import type { LogEntry } from '@/store/context';
import styles from './ReceiveLogCard.module.css';

export type LogFilter = 'all' | 'Data Memery';

export type { LogEntry };

interface ReceiveLogCardProps {
  logs: LogEntry[];
  filter: LogFilter;
  onFilterChange: (filter: LogFilter) => void;
}

export function ReceiveLogCard({ logs, filter, onFilterChange }: ReceiveLogCardProps) {
  const { t } = useTranslation();

  const filtered = filter === 'all'
    ? logs
    : logs.filter((l) => l.configType === 'Data Memery');

  return (
    <CardShell title={t('command.receiveLog')}>
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => onFilterChange('all')}
        >
          {t('command.filterAll')}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'Data Memery' ? styles.filterBtnActive : ''}`}
          onClick={() => onFilterChange('Data Memery')}
        >
          {t('command.filterDataMemory')}
        </button>
      </div>
      <div className={styles.logList}>
        {filtered.length === 0 && (
          <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
            {t('command.noLogs', 'No log entries yet. Connect a device to see data.')}
          </div>
        )}
        {filtered.map((entry) => (
          <LogItem key={entry.id} entry={entry} />
        ))}
      </div>
    </CardShell>
  );
}