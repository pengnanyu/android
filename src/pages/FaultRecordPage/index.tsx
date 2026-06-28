import { useMemo } from 'react';
import { useBmsStore } from '@/store/context';
import type { FaultRecord } from '@/types';
import { FaultCard } from './components/FaultCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslation } from 'react-i18next';
import styles from './FaultRecordPage.module.css';

const FAULT_PATTERNS = /故障|Fault|Error|报警|告警|保护|Protect|Alarm/i;

export function FaultRecordPage() {
  const { t } = useTranslation();
  const { parsedValues, connectionStatus } = useBmsStore();

  const records = useMemo<FaultRecord[]>(() => {
    const faultValues = parsedValues.filter(v => FAULT_PATTERNS.test(v.name));

    return faultValues.map((v, i) => {
      const isActive = v.value !== 0;
      let level: 'warning' | 'error' | 'critical' = 'warning';
      if (/保护|Protect|Safety|critical/i.test(v.name)) level = 'critical';
      else if (/告警|报警|Alarm|Error/i.test(v.name)) level = 'error';

      return {
        id: `fault_${v.rowIndex}`,
        code: v.dataType === 'HEX' || v.dataType === '2HEX'
          ? v.displayValue
          : v.rawValue.toString(),
        message: v.name,
        level,
        startTime: isActive ? Date.now() : 0,
        endTime: isActive ? null : Date.now(),
        active: isActive,
      };
    });
  }, [parsedValues]);

  if (records.length === 0) {
    return <EmptyState message={t('fault.emptyState')} />;
  }

  return (
    <div className={styles.grid}>
      {records.map((record) => (
        <FaultCard key={record.id} record={record} />
      ))}
    </div>
  );
}