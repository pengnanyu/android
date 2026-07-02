import { useMemo } from 'react';
import type { VoltageCurrentDataPoint } from '@/types';

const DEFAULT_VISIBLE = 120;

interface ChartOption {
  [key: string]: unknown;
}

export function useChartOption(dataPoints: VoltageCurrentDataPoint[], totalCount: number): ChartOption {
  return useMemo(() => {
    const startIdx = Math.max(0, totalCount - DEFAULT_VISIBLE);
    const endPercent = totalCount <= DEFAULT_VISIBLE ? 100 : ((totalCount / (totalCount || 1)) * 100);
    const startPercent = totalCount <= DEFAULT_VISIBLE ? 0 : ((startIdx / (totalCount || 1)) * 100);

    return {
      animation: false,
      grid: { left: 30, right: 30, top: 10, bottom: 40 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: dataPoints.map((p) => {
          const d = new Date(p.timestamp);
          return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
        }),
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
          data: dataPoints.map((p) => p.voltage),
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
          data: dataPoints.map((p) => p.current),
          yAxisIndex: 1,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' },
          areaStyle: { color: 'rgba(245,158,11,0.1)' },
        },
      ],
    };
  }, [dataPoints, totalCount]);
}
