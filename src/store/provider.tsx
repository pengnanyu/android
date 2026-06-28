import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { ConnectionStatus, ProtocolDatabase, BridgeMessage } from '@/types';
import type { BmsStore } from './context';
import { BmsContext } from './context';
import { useBridgeMessage } from '@/hooks/useBridgeMessage';
import { isEmbedded } from '@/utils/platform';
import { parseModbusResponse, appendCrc } from '@/utils/modbus';

const PROTOCOL_API_URL = 'https://sql.hzxhhc.com/api/data/';

function hexToVersion(registers: number[]): string | null {
  if (registers.length < 1) return null;
  const val = registers[0]!;
  const major = (val >> 8) & 0xFF;
  const minor = val & 0xFF;
  return `${major}.${minor}`;
}

export function BmsProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [protocolDb, setProtocolDb] = useState<ProtocolDatabase | null>(null);
  const [protocolLoading, setProtocolLoading] = useState(false);
  const [versionQuerySent, setVersionQuerySent] = useState(false);
  const [deviceVersion, setDeviceVersion] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<Map<string, number>>(new Map());

  const sendMessageRef = useRef<((msg: BridgeMessage) => void) | null>(null);

  const sendFrame = useCallback((frame: number[]) => {
    if (sendMessageRef.current) {
      sendMessageRef.current({ type: 'bms:frame-send', payload: { frame } });
    }
  }, []);

  const loadProtocolDb = useCallback(async (version: string) => {
    setProtocolLoading(true);
    try {
      const res = await fetch(`${PROTOCOL_API_URL}?search=${encodeURIComponent(version)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.columns && data.rows) {
        setProtocolDb({
          version,
          table: data.table || '',
          columns: data.columns,
          rows: data.rows,
          loadedAt: Date.now(),
        });
      }
    } catch (_e) {
      console.error('[BmsStore] Failed to load protocol DB:', _e);
    } finally {
      setProtocolLoading(false);
    }
  }, []);

  const versionRef = useRef<string | null>(null);

  const handleRawData = useCallback((payload: unknown) => {
    const p = payload as { data: number[] };
    if (!p.data || p.data.length === 0) return;

    const parsed = parseModbusResponse(p.data);
    if (!parsed) return;

    if (!versionRef.current && parsed.registers.length > 0) {
      const ver = hexToVersion(parsed.registers);
      if (ver) {
        versionRef.current = ver;
        setDeviceVersion(ver);
        loadProtocolDb(ver);
      }
    }

    setParsedFields(prev => {
      const newFields = new Map(prev);
      for (let i = 0; i < parsed.registers.length; i++) {
        newFields.set(`reg_${i}`, parsed.registers[i]!);
      }
      return newFields;
    });
  }, [loadProtocolDb]);

  const handlers = useMemo(() => ({
    'bms:connection-status': (payload: unknown) => {
      const p = payload as { status: ConnectionStatus };
      setConnectionStatus(p.status);
    },
    'bms:raw-data': handleRawData,
  }), [handleRawData]);

  const { sendMessage } = useBridgeMessage({ handlers });
  sendMessageRef.current = sendMessage;

  useEffect(() => {
    if (isEmbedded()) {
      sendMessage({ type: 'bms:request-status', payload: {} });
    }
  }, [sendMessage]);

  useEffect(() => {
    if (connectionStatus === 'connected' && !versionQuerySent) {
      setVersionQuerySent(true);
      sendFrame(appendCrc([0x00, 0x03, 0x00, 0x00, 0x00, 0x01]));
    }
    if (connectionStatus !== 'connected') {
      setVersionQuerySent(false);
      versionRef.current = null;
      setDeviceVersion(null);
      setProtocolDb(null);
      setParsedFields(new Map());
    }
  }, [connectionStatus, versionQuerySent, sendFrame]);

  const updateParsedFields = useCallback((fields: Map<string, number>) => {
    setParsedFields(fields);
  }, []);

  const store = useMemo<BmsStore>(() => ({
    connectionStatus,
    protocolDb,
    protocolLoading,
    versionQuerySent,
    deviceVersion,
    parsedFields,
    setConnectionStatus,
    setProtocolDb,
    setProtocolLoading,
    setVersionQuerySent,
    setDeviceVersion,
    updateParsedFields,
    sendFrame,
  }), [connectionStatus, protocolDb, protocolLoading, versionQuerySent, deviceVersion, parsedFields, updateParsedFields, sendFrame]);

  return (
    <BmsContext.Provider value={store}>
      {children}
    </BmsContext.Provider>
  );
}
