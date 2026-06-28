import { useMemo, useRef } from 'react';
import { useBmsStore } from '@/store/context';
import type { VoltageCurrentDataPoint } from '@/types';
import { SocPackCard } from './components/SocPackCard';
import { DeviceInfoCard } from './components/DeviceInfoCard';
import { StatusCard } from './components/StatusCard';
import { VoltageCurrentChart } from './components/VoltageCurrentChart';
import { CellVoltageCard } from './components/CellVoltageCard';
import { TemperatureCard } from './components/TemperatureCard';
import {
  mapSocPack,
  mapCellVoltages,
  mapTemperatures,
  mapExtraFields,
  mapBalanceFlags,
  mapStatusGroups,
  appendDataPoint,
} from '@/utils/data-map';
import styles from './BatteryInfoPage.module.css';

const CELL_VOLTAGE_PATTERN = /(?:电芯|单体|Cell)\s*电压\s*\d+/i;
const TEMPERATURE_PATTERN = /(?:温度|Temperature|Temp)\s*\d+/i;
const BALANCE_PATTERN = /(?:均衡|Balance)\s*\d+/i;
const SOC_PATTERNS = ['SOC', 'soc'];
const SOH_PATTERNS = ['SOH', 'soh'];
const TOTAL_VOLTAGE_PATTERNS = ['总电压', 'TotalVoltage', 'totalvoltage', 'Total_Voltage'];
const TOTAL_CURRENT_PATTERNS = ['总电流', 'TotalCurrent', 'totalcurrent', 'Total_Current'];
const POWER_PATTERNS = ['功率', 'Power', 'power', 'TotalPower'];
const MOS_TEMPERATURE_PATTERN = /(?:MOS管温度|MOS.*Temp|MosTemp)/i;
const STATUS_PATTERN = /(?:状态|告警|报警|保护|安全|Status|Alarm|Protect|Safety)/i;

function matchesAny(name: string, patterns: string[]): boolean {
  return patterns.some(p => name.includes(p));
}

function isInfoField(name: string): boolean {
  if (CELL_VOLTAGE_PATTERN.test(name)) return false;
  if (TEMPERATURE_PATTERN.test(name)) return false;
  if (BALANCE_PATTERN.test(name)) return false;
  if (MOS_TEMPERATURE_PATTERN.test(name)) return false;
  if (matchesAny(name, SOC_PATTERNS)) return false;
  if (matchesAny(name, SOH_PATTERNS)) return false;
  if (matchesAny(name, TOTAL_VOLTAGE_PATTERNS)) return false;
  if (matchesAny(name, TOTAL_CURRENT_PATTERNS)) return false;
  if (matchesAny(name, POWER_PATTERNS)) return false;
  if (STATUS_PATTERN.test(name)) return false;
  return true;
}

export function BatteryInfoPage() {
  const { parsedValues, connectionStatus } = useBmsStore();
  const loading = connectionStatus !== 'connected' || parsedValues.length === 0;

  const infoValues = useMemo(
    () => parsedValues.filter(v => v.configType === 'info-register'),
    [parsedValues]
  );

  const { soc, pack } = useMemo(() => mapSocPack(infoValues), [infoValues]);
  const cellVoltages = useMemo(() => mapCellVoltages(infoValues), [infoValues]);
  const { temperatures, mosTemperature } = useMemo(() => mapTemperatures(infoValues), [infoValues]);
  const cellBalanceFlags = useMemo(() => mapBalanceFlags(infoValues), [infoValues]);
  const statusGroups = useMemo(() => mapStatusGroups(infoValues), [infoValues]);

  const excludedNames = useMemo(() => {
    const s = new Set<string>();
    for (const v of infoValues) {
      if (!isInfoField(v.name)) s.add(v.name);
    }
    return s;
  }, [infoValues]);

  const extraFields = useMemo(
    () => mapExtraFields(infoValues, excludedNames),
    [infoValues, excludedNames]
  );

  const dataPointsRef = useRef<VoltageCurrentDataPoint[]>([]);
  const totalVoltage = pack?.totalVoltage ?? null;
  const totalCurrent = pack?.totalCurrent ?? null;
  const dataPoints = useMemo(() => {
    dataPointsRef.current = appendDataPoint(
      dataPointsRef.current, totalVoltage, totalCurrent
    );
    return dataPointsRef.current;
  }, [totalVoltage, totalCurrent]);

  const bmsTime = useMemo(() => {
    const timeField = parsedValues.find(v => v.dataType === 'Time');
    return timeField?.displayValue;
  }, [parsedValues]);

  const bmsId = useMemo(() => {
    const idField = parsedValues.find(v => v.dataType === 'ID');
    return idField?.displayValue;
  }, [parsedValues]);

  return (
    <div className={styles.grid}>
      <SocPackCard soc={soc} pack={pack} bmsTime={bmsTime} loading={loading} />
      <DeviceInfoCard bmsId={bmsId} extraFields={extraFields} loading={loading} />
      <StatusCard statusGroups={statusGroups} loading={loading} />
      <VoltageCurrentChart dataPoints={dataPoints} loading={loading} />
      <CellVoltageCard cellVoltages={cellVoltages} cellBalanceFlags={cellBalanceFlags} loading={loading} />
      <TemperatureCard temperatures={temperatures} mosTemperature={mosTemperature} loading={loading} />
    </div>
  );
}