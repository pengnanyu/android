import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { ConnectionStatus, ProtocolDatabase, BridgeMessage } from '@/types';
import type { BmsStore, LogEntry } from './context';
import { BmsContext } from './context';
import { useBridgeMessage } from '@/hooks/useBridgeMessage';
import { isEmbedded } from '@/utils/platform';
import { parseModbusResponse, appendCrc } from '@/utils/modbus';

const PROTOCOL_API_URL = 'https://sql.hzxhhc.com/api/data/';
const VERSION_QUERY_INTERVAL = 1000;

function toHex(data: number[]): string {
  return data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

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
  const [deviceVersion, setDeviceVersion] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<Map<string, number>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const sendMessageRef = useRef<((msg: BridgeMessage) => void) | null>(null);
  const versionRef = useRef<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    logIdRef.current += 1;
    setLogs(prev => [...prev.slice(-200), { ...entry, id: `${entry.direction}_${logIdRef.current}` }]);
  }, []);

  const sendFrame = useCallback((frame: number[]) => {
    if (sendMessageRef.current) {
      sendMessageRef.current({ type: 'bms:frame-send', payload: { frame } });
      addLog({
        timestamp: Date.now(),
        direction: 'TX',
        rawHex: toHex(frame),
      });
    }
  }, [addLog]);

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
        addLog({
          timestamp: Date.now(),
          direction: 'RX',
          parsedInfo: `Protocol DB loaded: v${version} (${data.rows.length} rows)`,
          rawHex: '',
        });
      }
    } catch (_e) {
      addLog({
        timestamp: Date.now(),
        direction: 'RX',
        parsedInfo: `Failed to load protocol DB: ${_e}`,
        rawHex: '',
      });
    } finally {
      setProtocolLoading(false);
    }
  }, [addLog]);

  const sendVersionQuery = useCallback(() => {
    const frame = appendCrc([0x00, 0x03, 0x00, 0x00, 0x00, 0x01]);
    sendFrame(frame);
  }, [sendFrame]);

  const startVersionRetry = useCallback(() => {
    if (retryTimerRef.current) return;
    sendVersionQuery();
    retryTimerRef.current = setInterval(() => {
      if (!versionRef.current) {
        sendVersionQuery();
      }
    }, VERSION_QUERY_INTERVAL);
  }, [sendVersionQuery]);

  const stopVersionRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const handleRawData = useCallback((payload: unknown) => {
    const p = payload as { data: number[] };
    if (!p.data || p.data.length === 0) return;

    const hex = toHex(p.data);
    const parsed = parseModbusResponse(p.data);

    addLog({
      timestamp: Date.now(),
      direction: 'RX',
      parsedInfo: parsed ? `FC:${parsed.funcCode.toString(16).toUpperCase()} BC:${parsed.byteCount} Regs:${parsed.registers.length}` : 'CRC fail',
      rawHex: hex,
    });

    if (!parsed) return;

    if (!versionRef.current && parsed.registers.length > 0) {
      const ver = hexToVersion(parsed.registers);
      if (ver) {
        versionRef.current = ver;
        setDeviceVersion(ver);
        stopVersionRetry();
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
  }, [addLog, stopVersionRetry, loadProtocolDb]);

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
    if (connectionStatus === 'connected') {
      startVersionRetry();
    } else {
      stopVersionRetry();
      versionRef.current = null;
      setDeviceVersion(null);
      setProtocolDb(null);
      setParsedFields(new Map());
    }
    return () => stopVersionRetry();
  }, [connectionStatus, startVersionRetry, stopVersionRetry]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const store = useMemo<BmsStore>(() => ({
    connectionStatus,
    protocolDb,
    protocolLoading,
    deviceVersion,
    parsedFields,
    logs,
    sendFrame,
    clearLogs,
  }), [connectionStatus, protocolDb, protocolLoading, deviceVersion, parsedFields, logs, sendFrame, clearLogs]);

  return (
    <BmsContext.Provider value={store}>
      {children}
    </BmsContext.Provider>
  );
}
