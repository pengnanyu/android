import type { DeviceInfoField } from '@/types';
import { CardShell } from '@/components/shared/CardShell';
import styles from './DeviceInfoCard.module.css';

interface DeviceInfoCardProps {
  bmsId?: string;
  extraFields: DeviceInfoField[];
}

export function DeviceInfoCard({ bmsId, extraFields }: DeviceInfoCardProps) {
  return (
    <CardShell
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.1-.9 2-2 2s-2-.9-2-2 2-4 4-4h2c2.2 0 4 1.8 4 4 0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="10" /></svg>设备信息</span>}
      titleExtra={bmsId ? <span style={{ fontSize: 12, opacity: 0.7 }}>{bmsId}</span> : undefined}
    >
      <div className={styles.fieldList}>
        {extraFields.length > 0 ? extraFields.map((field, i) => (
          <div key={i} className={styles.field}>
            <span className={styles.fieldLabel}>{field.label}</span>
            <span>
              <span className={styles.fieldValue}>{field.value}</span>
              {field.unit && <span className={styles.fieldUnit}>{field.unit}</span>}
            </span>
          </div>
        )) : (
          <div className={styles.empty}>--</div>
        )}
      </div>
    </CardShell>
  );
}
