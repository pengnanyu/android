import { useMemo } from 'react';
import { useBmsStore } from '@/store/context';
import { useTranslation } from 'react-i18next';
import type { FieldValue } from '@/utils/modbus';
import { SocPackCard } from './components/SocPackCard';
import { DeviceInfoCard } from './components/DeviceInfoCard';
import { StatusCard } from './components/StatusCard';
import { VoltageCurrentChart } from './components/VoltageCurrentChart';
import { CellVoltageCard } from './components/CellVoltageCard';
import { TemperatureCard } from './components/TemperatureCard';
import styles from './BatteryInfoPage.module.css';

function findField(fields: FieldValue[], nameEn: string): FieldValue | undefined {
  return fields.find(f => f.name === nameEn);
}

export function BatteryInfoPage() {
  const { parsedValues, deviceVersion } = useBmsStore();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const infoFields = useMemo(() => parsedValues.filter(f => f.configType === 'Info' || f.configType === 'Register'), [parsedValues]);

  const soc = useMemo(() => {
    const socF = findField(infoFields, 'SOC');
    const sohF = findField(infoFields, 'SOH');
    if (!socF && !sohF) return null;
    return { soc: socF?.value ?? 0, soh: sohF?.value ?? 0 };
  }, [infoFields]);

  const pack = useMemo(() => {
    const vF = findField(infoFields, 'Total_Voltage');
    const iF = findField(infoFields, 'Total_Current');
    const pF = findField(infoFields, 'Power');
    if (!vF && !iF) return null;
    return { totalVoltage: vF?.value ?? 0, totalCurrent: iF?.value ?? 0, power: pF?.value ?? 0 };
  }, [infoFields]);

  const cellVoltages = useMemo(() => {
    return infoFields
      .filter(f => /^Cell_\d+_Voltage$/i.test(f.name) || /^Cell\d+$/i.test(f.name) || /^Cell_Voltage_\d+$/i.test(f.name))
      .map((f, i) => ({ index: i + 1, voltage: f.value, name: isZh ? f.nameZh : f.name }));
  }, [infoFields, isZh]);

  const temperatures = useMemo(() => {
    return infoFields
      .filter(f => /^Temp_\d+$/i.test(f.name) || /^Temperature_\d+$/i.test(f.name) || /^MOS_Temperature$/i.test(f.name))
      .map((f, i) => ({ index: i + 1, temperature: f.value, name: isZh ? f.nameZh : f.name }));
  }, [infoFields, isZh]);

  const extraFields = useMemo(() => {
    const skipNames = new Set(['SOC', 'SOH', 'Total_Voltage', 'Total_Current', 'Power']);
    return infoFields
      .filter(f => !skipNames.has(f.name) && !/^Cell_\d+_Voltage$/i.test(f.name) && !/^Cell\d+$/i.test(f.name) && !/^Cell_Voltage_\d+$/i.test(f.name) && !/^Temp_\d+$/i.test(f.name) && !/^Temperature_\d+$/i.test(f.name) && !/^MOS_Temperature$/i.test(f.name))
      .map(f => ({ label: isZh ? f.nameZh : f.name, value: f.displayValue, unit: f.unit }));
  }, [infoFields, isZh]);

  const bmsTime = useMemo(() => {
    const tf = findField(infoFields, 'BMS_Time');
    return tf?.displayValue;
  }, [infoFields]);

  return (
    <div className={styles.grid}>
      <SocPackCard soc={soc} pack={pack} bmsTime={bmsTime} />
      <DeviceInfoCard bmsId={deviceVersion ?? undefined} extraFields={extraFields} />
      <StatusCard infoFields={infoFields} />
      <VoltageCurrentChart dataPoints={[]} />
      <CellVoltageCard cellVoltages={cellVoltages} />
      <TemperatureCard temperatures={temperatures} />
    </div>
  );
}
