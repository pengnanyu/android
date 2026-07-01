import type { TempData } from '@/types';
import { CardShell } from '@/components/shared/CardShell';
import { TempBar } from './TempBar';
import styles from './TemperatureCard.module.css';

interface TemperatureCardProps {
  temperatures: TempData[];
  mosTemperature?: TempData;
  voltageMax?: number;
  voltageMin?: number;
}

export function TemperatureCard({ temperatures, mosTemperature, voltageMax, voltageMin }: TemperatureCardProps) {
  const titleExtra = (voltageMax !== undefined || voltageMin !== undefined) ? (
    <div className={styles.headerInfo}>
      {voltageMax !== undefined && (
        <span className={styles.headerItem}>↑ {voltageMax.toFixed(3)}V</span>
      )}
      {voltageMin !== undefined && (
        <span className={styles.headerItem}>↓ {voltageMin.toFixed(3)}V</span>
      )}
    </div>
  ) : undefined;

  return (
    <CardShell title="温度" titleExtra={titleExtra}>
      <div className={styles.tempList}>
        {temperatures.length > 0 ? (
          <>
            {temperatures.map((temp) => (
              <TempBar key={temp.index} index={temp.index} temperature={temp.temperature} name={temp.name} />
            ))}
            {mosTemperature && (
              <TempBar index={mosTemperature.index} temperature={mosTemperature.temperature} name="MOS" />
            )}
          </>
        ) : (
          <div style={{ color: 'var(--color-muted-foreground)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>--</div>
        )}
      </div>
    </CardShell>
  );
}
