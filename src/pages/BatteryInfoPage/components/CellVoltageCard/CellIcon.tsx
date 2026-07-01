import { getSocColor } from '@/utils/color';
import styles from './CellIcon.module.css';

interface CellIconProps {
  index: number;
  voltage: number;
  soc?: number;
  isBalancing?: boolean;
  compact?: boolean;
}

export function CellIcon({ index, voltage, soc, isBalancing, compact }: CellIconProps) {
  const fillPercent = soc !== undefined ? Math.max(soc, 5) : 50;
  const fillColor = getSocColor(soc ?? 50);
  const voltageV = (voltage / 1000).toFixed(2);

  return (
    <div className={`${styles.cell} ${compact ? styles.cellCompact : ''}`} title={`C${index}: ${voltage}mV`}>
      <div className={styles.battery}>
        <div className={styles.inner}>
          <div
            className={styles.fill}
            style={{ height: `calc(${fillPercent}% - 4px)`, background: fillColor }}
          />
        </div>
        <div className={styles.cap} />
      </div>
      {isBalancing && <span className={styles.balancing}>⚡</span>}
      <div className={styles.cellInfo}>
        <span className={styles.cellName}>C{index}</span>
        <span className={styles.cellVoltage}>{voltageV}V</span>
      </div>
    </div>
  );
}
