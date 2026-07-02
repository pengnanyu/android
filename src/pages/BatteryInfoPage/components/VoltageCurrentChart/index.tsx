import { useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts';
import type { VoltageCurrentDataPoint, CellVoltage } from '@/types';
import { CardShell } from '@/components/shared/CardShell';
import { CellIcon } from '../CellVoltageCard/CellIcon';
import cellStyles from '../CellVoltageCard/CellVoltageCard.module.css';
import styles from './VoltageCurrentChart.module.css';

const DEFAULT_VISIBLE = 120;
const RESTORE_DELAY = 3000;

interface VoltageCurrentChartProps {
  history: VoltageCurrentDataPoint[];
  cellVoltages?: CellVoltage[];
  voltageMax?: number;
  voltageMin?: number;
  balanceFlags?: boolean[];
  soc?: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function buildInitialOption(dataPoints: VoltageCurrentDataPoint[], totalCount: number) {
  const startIdx = Math.max(0, totalCount - DEFAULT_VISIBLE);
  const startPercent = totalCount <= DEFAULT_VISIBLE ? 0 : (startIdx / totalCount * 100);
  const endPercent = 100;

  return {
    animation: false,
    grid: { left: 30, right: 30, top: 10, bottom: 40 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dataPoints.map(p => formatTime(p.timestamp)),
      axisLabel: { fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'V',
        nameTextStyle: { fontSize: 10 },
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'A',
        nameTextStyle: { fontSize: 10 },
        axisLabel: { fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: startPercent,
        end: endPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        start: startPercent,
        end: endPercent,
        height: 14,
        bottom: 4,
        borderColor: 'transparent',
        backgroundColor: 'var(--color-muted)',
        fillerColor: 'var(--color-primary)',
        handleStyle: { color: 'var(--color-primary)' },
        textStyle: { fontSize: 10 },
      },
    ],
    series: [
      {
        name: 'Voltage',
        type: 'line',
        data: dataPoints.map(p => p.voltage),
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99,102,241,0.1)' },
      },
      {
        name: 'Current',
        type: 'line',
        data: dataPoints.map(p => p.current),
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        areaStyle: { color: 'rgba(245,158,11,0.1)' },
      },
    ],
  };
}

export function VoltageCurrentChart({ history, cellVoltages, voltageMax, voltageMin, balanceFlags, soc }: VoltageCurrentChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userZoomedRef = useRef(false);
  const prevLenRef = useRef(0);
  const initializedRef = useRef(false);

  const dispatchRestore = useCallback(() => {
    const chart = instanceRef.current;
    if (!chart || history.length === 0) return;
    const startIdx = Math.max(0, history.length - DEFAULT_VISIBLE);
    const startPercent = history.length <= DEFAULT_VISIBLE ? 0 : (startIdx / history.length * 100);
    chart.dispatchAction({
      type: 'dataZoom',
      start: startPercent,
      end: 100,
    });
    userZoomedRef.current = false;
  }, [history.length]);

  const titleExtra = (
    <div className={styles.titleLegend}>
      <span className={styles.legendItem}>
        <span className={styles.legendDot} style={{ background: '#6366f1' }} />
        Voltage
      </span>
      <span className={styles.legendItem}>
        <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
        Current
      </span>
      {voltageMax !== undefined && <span className={styles.legendItem}><span className={styles.arrowUp}>↑</span>{(voltageMax / 1000).toFixed(2)}V</span>}
      {voltageMin !== undefined && <span className={styles.legendItem}><span className={styles.arrowDown}>↓</span>{(voltageMin / 1000).toFixed(2)}V</span>}
    </div>
  );

  useEffect(() => {
    const el = chartRef.current;
    if (!el || history.length === 0) return;

    let chart = instanceRef.current;
    if (!chart) {
      chart = echarts.init(el, undefined, { renderer: 'canvas' });
      instanceRef.current = chart;
      chart.on('datazoom', () => {
        userZoomedRef.current = true;
      });
    }

    if (!initializedRef.current) {
      chart.setOption(buildInitialOption(history, history.length), true);
      initializedRef.current = true;
      prevLenRef.current = history.length;
      return;
    }

    const newPoints = history.slice(prevLenRef.current);
    prevLenRef.current = history.length;

    if (newPoints.length === 0) return;

    chart.setOption({
      xAxis: { data: history.map(p => formatTime(p.timestamp)) },
      series: [
        { data: history.map(p => p.voltage) },
        { data: history.map(p => p.current) },
      ],
    }, false, true);
  }, [history]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const chart = instanceRef.current;
      if (!chart) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        chart.resize();
      }
    });
    ro.observe(el);

    const handleMouseEnter = () => {
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      if (!userZoomedRef.current) return;
      restoreTimerRef.current = setTimeout(() => {
        dispatchRestore();
        restoreTimerRef.current = null;
      }, RESTORE_DELAY);
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ro.disconnect();
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      instanceRef.current?.dispose();
      instanceRef.current = null;
      initializedRef.current = false;
    };
  }, [dispatchRestore]);

  return (
    <CardShell title="电压电流曲线" titleExtra={titleExtra}>
      {history.length === 0 ? (
        <div className={styles.empty}>--</div>
      ) : (
        <div ref={chartRef} className={styles.chartContainer} />
      )}
      {cellVoltages && cellVoltages.length > 0 && (
        <div className={styles.cellSection}>
          <div className={cellStyles.grid}>
            {cellVoltages.map(cell => (
              <CellIcon
                key={cell.index}
                index={cell.index}
                voltage={cell.voltage}
                soc={soc}
                isBalancing={balanceFlags?.[(cell.index - 1)] ?? false}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}
