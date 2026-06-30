import type { FieldValue } from '@/utils/modbus';
import { CardShell } from '@/components/shared/CardShell';
import { StatusGroup } from './StatusGroup';
import type { StatusGroup as StatusGroupData, StatusGroupType } from '@/types';

interface StatusCardProps {
  infoFields: FieldValue[];
}

export function StatusCard({ infoFields }: StatusCardProps) {
  const groups: StatusGroupData[] = [];

  const bitTagFields = infoFields.filter(f => f.dataType === 'BitTag' || f.bitTag);
  if (bitTagFields.length > 0) {
    const groupMap = new Map<string, FieldValue[]>();
    for (const f of bitTagFields) {
      const key = f.configNameEn || 'Status';
      const list = groupMap.get(key) ?? [];
      list.push(f);
      groupMap.set(key, list);
    }
    for (const [name, fields] of groupMap) {
      const flags = fields.flatMap(f => {
        if (f.bitLabels) {
          return f.bitLabels.map((label, i) => ({
            label,
            active: ((f.value >> i) & 1) === 1,
          }));
        }
        return [{ label: f.name, active: f.value !== 0 }];
      });
      const type: StatusGroupType = name.toLowerCase().includes('safety') ? 'safety' : name.toLowerCase().includes('alarm') ? 'alarm' : 'status';
      groups.push({ name, type, flags });
    }
  }

  const sorted = [...groups].sort((a, b) => {
    const order: Record<StatusGroupType, number> = { safety: 0, alarm: 1, status: 2 };
    return order[a.type] - order[b.type];
  });

  return (
    <CardShell title="状态指示">
      {sorted.length > 0 ? sorted.map((group, i) => (
        <StatusGroup key={i} group={group} />
      )) : (
        <div style={{ color: 'var(--color-muted-foreground)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>--</div>
      )}
    </CardShell>
  );
}
