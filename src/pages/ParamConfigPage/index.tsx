import { useMemo, useCallback } from 'react';
import { useBmsStore } from '@/store/context';
import type { ParamItem } from '@/types';
import { ParamGroupCard } from './components/ParamGroupCard';
import { ParamToolbar } from './components/ParamToolbar';
import styles from './ParamConfigPage.module.css';

export function ParamConfigPage() {
  const { parsedValues, protocolDb, connectionStatus } = useBmsStore();

  const params = useMemo<ParamItem[]>(() => {
    const configValues = parsedValues.filter(
      v => v.configType !== 'info-register' && v.configType !== 'Calendar' && v.configType !== ''
    );
    const rows = protocolDb?.rows;

    return configValues.map(v => {
      const raw = rows?.[v.rowIndex] as Record<string, unknown> | undefined;
      return {
        key: `${v.rowIndex}`,
        label: v.name,
        value: v.value,
        displayValue: v.displayValue,
        unit: v.unit || undefined,
        group: v.configType,
        min: raw ? (raw['Min'] as number | undefined) : undefined,
        max: raw ? (raw['Max'] as number | undefined) : undefined,
        step: raw ? (raw['Step'] as number | undefined) : undefined,
        readonly: raw ? (raw['ReadOnly'] as boolean | undefined) : undefined,
        description: raw ? (raw['Description'] as string | undefined) : undefined,
        dataType: v.dataType,
      };
    });
  }, [parsedValues, protocolDb]);

  const grouped = useMemo(() => {
    const map = new Map<string, ParamItem[]>();
    for (const p of params) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return map;
  }, [params]);

  const handleValueChange = useCallback((_key: string, _newValue: string | number) => { }, []);
  const handleBlur = useCallback((_key: string) => { }, []);

  const loading = connectionStatus !== 'connected' || parsedValues.length === 0;

  return (
    <div>
      <ParamToolbar
        onReadParams={() => { }}
        onBatchWrite={() => { }}
        onImport={() => { }}
        onExport={() => { }}
        onPreset={(_id: string) => { }}
        reading={loading}
      />
      <div className={styles.masonry}>
        {Array.from(grouped.entries()).map(([groupName, groupParams]) => (
          <ParamGroupCard
            key={groupName}
            groupName={groupName}
            params={groupParams}
            onValueChange={handleValueChange}
            onBlur={handleBlur}
          />
        ))}
      </div>
    </div>
  );
}