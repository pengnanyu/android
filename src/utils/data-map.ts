import type { FieldValue } from '@/utils/modbus';
import type { SocData, PackData, CellVoltage, TempData, DeviceInfoField, StatusGroup, StatusFlag, VoltageCurrentDataPoint } from '@/types';

const SOC_PATTERNS = ['SOC', 'soc'];
const SOH_PATTERNS = ['SOH', 'soh'];
const TOTAL_VOLTAGE_PATTERNS = ['总电压', 'TotalVoltage', 'totalvoltage', 'Total_Voltage'];
const TOTAL_CURRENT_PATTERNS = ['总电流', 'TotalCurrent', 'totalcurrent', 'Total_Current'];
const POWER_PATTERNS = ['功率', 'Power', 'power', 'TotalPower'];
const CELL_VOLTAGE_PATTERN = /(?:电芯|单体|Cell)\s*电压\s*(\d+)/i;
const TEMPERATURE_PATTERN = /(?:温度|Temperature|Temp)\s*(\d+)/i;
const MOS_TEMPERATURE_PATTERN = /(?:MOS管温度|MOS.*Temp|MosTemp)/i;
const BALANCE_PATTERN = /(?:均衡|Balance)\s*(\d+)/i;

function matchesAny(name: string, patterns: string[]): boolean {
  return patterns.some(p => name.includes(p));
}

function extractIndex(name: string, pattern: RegExp): number | null {
  const m = name.match(pattern);
  return m ? parseInt(m[1]!, 10) : null;
}

export function mapSocPack(values: FieldValue[]): { soc: SocData | null; pack: PackData | null } {
  let soc: number | null = null;
  let soh: number | null = null;
  let totalVoltage: number | null = null;
  let totalCurrent: number | null = null;
  let power: number | null = null;

  for (const v of values) {
    if (matchesAny(v.name, SOC_PATTERNS)) soc = v.value;
    else if (matchesAny(v.name, SOH_PATTERNS)) soh = v.value;
    else if (matchesAny(v.name, TOTAL_VOLTAGE_PATTERNS)) totalVoltage = v.value;
    else if (matchesAny(v.name, TOTAL_CURRENT_PATTERNS)) totalCurrent = v.value;
    else if (matchesAny(v.name, POWER_PATTERNS)) power = v.value;
  }

  return {
    soc: soc !== null ? { soc, soh: soh ?? 0 } : null,
    pack: totalVoltage !== null ? {
      totalVoltage,
      totalCurrent: totalCurrent ?? 0,
      power: power ?? 0,
    } : null,
  };
}

export function mapCellVoltages(values: FieldValue[]): CellVoltage[] {
  const cells: CellVoltage[] = [];
  for (const v of values) {
    const idx = extractIndex(v.name, CELL_VOLTAGE_PATTERN);
    if (idx !== null) {
      cells.push({ index: idx, voltage: v.value, name: v.name });
    }
  }
  cells.sort((a, b) => a.index - b.index);
  return cells;
}

export function mapTemperatures(values: FieldValue[]): { temperatures: TempData[]; mosTemperature: TempData | undefined } {
  const temps: TempData[] = [];
  let mosTemp: TempData | undefined;
  for (const v of values) {
    if (MOS_TEMPERATURE_PATTERN.test(v.name)) {
      mosTemp = { index: 0, temperature: v.value, name: 'MOS' };
      continue;
    }
    const idx = extractIndex(v.name, TEMPERATURE_PATTERN);
    if (idx !== null) {
      temps.push({ index: idx, temperature: v.value, name: v.name });
    }
  }
  temps.sort((a, b) => a.index - b.index);
  return { temperatures: temps, mosTemperature: mosTemp };
}

export function mapExtraFields(values: FieldValue[], excludeNames: Set<string>): DeviceInfoField[] {
  return values
    .filter(v => !excludeNames.has(v.name))
    .map(v => ({
      label: v.name,
      value: v.displayValue,
      unit: v.unit || undefined,
    }));
}

export function mapBalanceFlags(values: FieldValue[]): StatusFlag[] {
  const flags: StatusFlag[] = [];
  for (const v of values) {
    const idx = extractIndex(v.name, BALANCE_PATTERN);
    if (idx !== null) {
      flags.push({ label: `C${idx}`, active: v.value !== 0 });
    }
  }
  flags.sort((a, b) => {
    const ai = parseInt(a.label.slice(1), 10);
    const bi = parseInt(b.label.slice(1), 10);
    return ai - bi;
  });
  return flags;
}

export function mapStatusGroups(values: FieldValue[]): StatusGroup[] {
  const groups: StatusGroup[] = [];
  for (const v of values) {
    const name = v.name;
    let type: 'status' | 'alarm' | 'safety' = 'status';
    if (/告警|报警|Alarm/i.test(name)) type = 'alarm';
    else if (/保护|安全|Protect|Safety/i.test(name)) type = 'safety';

    const existing = groups.find(g => g.type === type);
    const flag: StatusFlag = { label: name, active: v.value !== 0 };
    if (existing) {
      existing.flags.push(flag);
    } else {
      groups.push({
        name: type === 'safety' ? '安全保护' : type === 'alarm' ? '告警' : '状态',
        type,
        flags: [flag],
      });
    }
  }
  return groups;
}

export function appendDataPoint(
  history: VoltageCurrentDataPoint[],
  voltage: number | null,
  current: number | null,
  maxPoints: number = 120
): VoltageCurrentDataPoint[] {
  if (voltage === null && current === null) return history;
  const point: VoltageCurrentDataPoint = {
    timestamp: Date.now(),
    voltage: voltage ?? 0,
    current: current ?? 0,
  };
  const next = [...history, point];
  return next.length > maxPoints ? next.slice(-maxPoints) : next;
}