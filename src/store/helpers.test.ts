import { describe, expect, it } from 'vitest';
import { buildDataMemoryGroups, buildFieldValueMap } from './helpers';
import type { FieldValue } from '@/utils/modbus';

describe('store helpers', () => {
  it('groups data-memory fields by config name and keeps row order stable', () => {
    const values: FieldValue[] = [
      { rowIndex: 3, configType: 'Data Memery', configNameEn: 'Pack', name: 'c', nameZh: 'C', value: 3, displayValue: '3', rawValue: 3, absAddr: 0x10, byteLen: 2, byteOffset: 0, regLen: 1, operation: 'raw', ratio: 1, rwType: 'rw', dataType: 'UINT16', parentInstructionIndex: 0 } as FieldValue,
      { rowIndex: 1, configType: 'Data Memery', configNameEn: 'Pack', name: 'a', nameZh: 'A', value: 1, displayValue: '1', rawValue: 1, absAddr: 0x0E, byteLen: 2, byteOffset: 0, regLen: 1, operation: 'raw', ratio: 1, rwType: 'rw', dataType: 'UINT16', parentInstructionIndex: 0 } as FieldValue,
      { rowIndex: 2, configType: 'Data Memery', configNameEn: 'Cell', name: 'b', nameZh: 'B', value: 2, displayValue: '2', rawValue: 2, absAddr: 0x0F, byteLen: 2, byteOffset: 0, regLen: 1, operation: 'raw', ratio: 1, rwType: 'rw', dataType: 'UINT16', parentInstructionIndex: 0 } as FieldValue,
    ];

    const groups = buildDataMemoryGroups(values);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.fields.map(field => field.rowIndex)).toEqual([1, 3]);
    expect(groups[1]?.fields.map(field => field.rowIndex)).toEqual([2]);
  });

  it('builds a field map keyed by row index', () => {
    const values: FieldValue[] = [
      { rowIndex: 5, value: 5 } as FieldValue,
      { rowIndex: 8, value: 8 } as FieldValue,
    ];

    const map = buildFieldValueMap(values);
    expect(map.get(5)?.value).toBe(5);
    expect(map.get(8)?.value).toBe(8);
  });
});
