import type { SocData, PackData } from '@/types';
import { CardShell } from '@/components/shared/CardShell';
import { GaugeCanvas } from './GaugeCanvas';
import styles from './SocPackCard.module.css';

interface SocPackCardProps {
  soc: SocData | null;
  pack: PackData | null;
  chargeVoltage?: number;
  bmsTime?: string;
}

export function SocPackCard({ soc, pack, chargeVoltage, bmsTime }: SocPackCardProps) {
  const voltageMax = chargeVoltage ?? 100;
  const currentMax = Math.max(Math.abs(pack?.totalCurrent ?? 0) * 1.5, 50);

  return (
    <CardShell
      title="SOC Pack"
      titleExtra={bmsTime ? <span>{bmsTime}</span> : undefined}
    >
      <div className={styles.layout}>
        <div className={styles.ringArea}>
          <GaugeCanvas
            type="soc"
            value={soc?.soc ?? 0}
            max={100}
            soc={soc?.soc ?? 0}
          />
          {soc?.soh !== undefined && soc.soh > 0 && (
            <div className={styles.sohLabel}>SOH {soc.soh}%</div>
          )}
        </div>
        <div className={styles.statsArea}>
          <div className={styles.statCards}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statDot} style={{ background: '#6366f1' }} />
                <span className={styles.statLabel}>Voltage</span>
              </div>
              <div className={styles.statValue}>{(pack?.totalVoltage ?? 0).toFixed(1)}</div>
              <div className={styles.statUnit}>V</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statDot} style={{ background: '#f59e0b' }} />
                <span className={styles.statLabel}>Current</span>
              </div>
              <div className={styles.statValue}>{(pack?.totalCurrent ?? 0).toFixed(1)}</div>
              <div className={styles.statUnit}>A</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statDot} style={{ background: '#10b981' }} />
                <span className={styles.statLabel}>Power</span>
              </div>
              <div className={styles.statValue}>{(pack?.power ?? 0).toFixed(0)}</div>
              <div className={styles.statUnit}>W</div>
            </div>
          </div>
          <div className={styles.miniGauges}>
            <div className={styles.miniGauge}>
              <GaugeCanvas type="voltage" value={pack?.totalVoltage ?? 0} max={voltageMax} />
            </div>
            <div className={styles.miniGauge}>
              <GaugeCanvas type="current" value={pack?.totalCurrent ?? 0} max={currentMax} />
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
