import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { ConnectionStatus, ProtocolDatabase, BridgeMessage } from '@/types';
import type { BmsStore, LogEntry } from './context';
import { BmsContext } from './context';
import { useBridgeMessage } from '@/hooks/useBridgeMessage';
import { isEmbedded } from '@/utils/platform';
import { parseModbusResponse, appendCrc, bigEndianHex, parseProtocolRows, parseDataFields } from '@/utils/modbus';
import type { ParsedProtocol, FieldValue } from '@/utils/modbus';
import i18n from '@/i18n';

const PROTOCOL_API_URL = 'https://sql.hzxhhc.com/api/data/';
const VERSION_QUERY_INTERVAL = 1000;
const RESPONSE_TIMEOUT = 2000;
const POLL_INTERVAL = 1000;

function toHex(data: number[]): string {
  return data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

function registerToVersionHex(register: number): string {
  return bigEndianHex(register);
}

export interface RegisterKey {
  slaveAddr: number;
  funcCode: number;
  registerIndex: number;
}

export function makeRegisterKey(slaveAddr: number, funcCode: number, registerIndex: number): string {
  return `${slaveAddr}:${funcCode}:${registerIndex}`;
}

export function parseRegisterKey(key: string): RegisterKey | null {
  const parts = key.split(':');
  if (parts.length !== 3) return null;
  return {
    slaveAddr: parseInt(parts[0]!, 10),
    funcCode: parseInt(parts[1]!, 10),
    registerIndex: parseInt(parts[2]!, 10),
  };
}

export function BmsProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [protocolDb, setProtocolDb] = useState<ProtocolDatabase | null>(null);
  const [protocolLoading, setProtocolLoading] = useState(false);
  const [deviceVersion, setDeviceVersion] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<Map<string, number>>(new Map());
  const [parsedValues, setParsedValues] = useState<FieldValue[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const sendMessageRef = useRef<((msg: BridgeMessage) => void) | null>(null);
  const versionRef = useRef<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIdRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIdxRef = useRef(0);
  const waitingResponseRef = useRef(false);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsedProtocolRef = useRef<ParsedProtocol | null>(null);
  const registerInstructionsRef = useRef<number[]>([]);
  const initPhaseRef = useRef<'idle' | 'version' | 'protocol' | 'polling'>('idle');

  const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    logIdRef.current += 1;
    const id = `${entry.direction}_${logIdRef.current}`;
    console.log('[BmsStore]', entry.direction, entry.rawHex || entry.parsedInfo || '');
    setLogs(prev => [...prev.slice(-200), { ...entry, id }]);
  }, []);

  const sendFrame = useCallback((frame: number[]) => {
    const hex = toHex(frame);
    console.log('[BmsStore] TX:', hex);
    addLog({ timestamp: Date.now(), direction: 'TX', rawHex: hex });
    if (sendMessageRef.current) {
      sendMessageRef.current({ type: 'bms:frame-send', payload: { frame } });
    } else {
      console.warn('[BmsStore] sendMessage not available, frame not sent');
    }
  }, [addLog]);

  const stopTimers = useCallback(() => {
    if (retryTimerRef.current) { clearInterval(retryTimerRef.current); retryTimerRef.current = null; }
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    if (responseTimerRef.current) { clearTimeout(responseTimerRef.current); responseTimerRef.current = null; }
    waitingResponseRef.current = false;
  }, []);

  const sendVersionQuery = useCallback(() => {
    const frame = appendCrc([0x00, 0x03, 0x00, 0x00, 0x00, 0x01]);
    sendFrame(frame);
  }, [sendFrame]);

  const startVersionRetry = useCallback(() => {
    if (retryTimerRef.current) return;
    initPhaseRef.current = 'version';
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

  const loadProtocolDb = useCallback(async (version: string) => {
    setProtocolLoading(true);
    initPhaseRef.current = 'protocol';
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
        addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: `Protocol DB loaded: v${version} (${data.rows.length} rows)`, rawHex: '' });
      }
    } catch (_e) {
      addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: `Failed to load protocol DB: ${_e}`, rawHex: '' });
    } finally {
      setProtocolLoading(false);
    }
  }, [addLog]);

  const sendInstructionFrame = useCallback((instIdx: number) => {
    const protocol = parsedProtocolRef.current;
    if (!protocol || instIdx >= protocol.instructions.length) return;
    const inst = protocol.instructions[instIdx]!;
    const frame = appendCrc([
      inst.slaveAddr,
      inst.funcCode,
      (inst.startAddr >> 8) & 0xFF,
      inst.startAddr & 0xFF,
      (inst.quantity >> 8) & 0xFF,
      inst.quantity & 0xFF,
    ]);
    waitingResponseRef.current = true;
    sendFrame(frame);
    responseTimerRef.current = setTimeout(() => {
      if (!waitingResponseRef.current) return;
      addLog({ timestamp: Date.now(), direction: 'TX', parsedInfo: `Timeout, retry instruction #${instIdx + 1}`, rawHex: '' });
      sendInstructionFrame(instIdx);
    }, RESPONSE_TIMEOUT);
  }, [sendFrame, addLog]);

  const startInitialPoll = useCallback(() => {
    const db = protocolDb;
    if (!db) return;
    const parsed = parseProtocolRows(db.rows);
    parsedProtocolRef.current = parsed;

    const regIndices: number[] = [];
    for (let i = 0; i < parsed.instructions.length; i++) {
      const inst = parsed.instructions[i]!;
      if (inst.configType !== 'Calendar') {
        regIndices.push(i);
      }
    }
    registerInstructionsRef.current = regIndices;

    if (regIndices.length === 0) {
      addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: 'No Register instructions to poll', rawHex: '' });
      return;
    }

    initPhaseRef.current = 'polling';
    pollIdxRef.current = 0;
    addLog({ timestamp: Date.now(), direction: 'TX', parsedInfo: `Initial poll: ${regIndices.length} register instructions`, rawHex: '' });
    sendInstructionFrame(regIndices[0]!);
  }, [protocolDb, sendFrame, addLog]);

  const startPeriodicPoll = useCallback(() => {
    if (pollTimerRef.current) return;
    const regIndices = registerInstructionsRef.current;
    if (regIndices.length === 0) return;

    addLog({ timestamp: Date.now(), direction: 'TX', parsedInfo: `Periodic poll started: ${regIndices.length} instructions / ${POLL_INTERVAL}ms`, rawHex: '' });
    pollIdxRef.current = 0;

    pollTimerRef.current = setInterval(() => {
      if (waitingResponseRef.current) return;
      const idx = pollIdxRef.current % regIndices.length;
      sendInstructionFrame(regIndices[idx]!);
      pollIdxRef.current++;
    }, POLL_INTERVAL);
  }, [sendFrame, addLog]);

  const advancePoll = useCallback(() => {
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    waitingResponseRef.current = false;

    if (initPhaseRef.current === 'polling') {
      const regIndices = registerInstructionsRef.current;
      pollIdxRef.current++;
      if (pollIdxRef.current < regIndices.length) {
        sendInstructionFrame(regIndices[pollIdxRef.current]!);
      } else {
        addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: 'Initial poll complete', rawHex: '' });
        initPhaseRef.current = 'idle';
        startPeriodicPoll();
      }
    }
  }, [sendInstructionFrame, addLog, startPeriodicPoll]);

  const handleRawData = useCallback((payload: unknown) => {
    const p = payload as { data: number[] };
    const hex = (p.data && p.data.length > 0) ? toHex(p.data) : '(empty)';

    addLog({ timestamp: Date.now(), direction: 'RX', rawHex: hex });

    if (!p.data || p.data.length === 0) return;

    const parsed = parseModbusResponse(p.data);

    if (parsed) {
      addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: `FC:${parsed.funcCode.toString(16).toUpperCase()} BC:${parsed.byteCount} Regs:${parsed.registers.length}`, rawHex: hex });
    }

    if (!parsed) return;

    if (!versionRef.current && parsed.registers.length > 0) {
      const verHex = registerToVersionHex(parsed.registers[0]!);
      versionRef.current = verHex;
      setDeviceVersion(verHex);
      stopVersionRetry();
      addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: `Version: ${verHex}`, rawHex: '' });
      loadProtocolDb(verHex);
      return;
    }

    setParsedFields(prev => {
      const newFields = new Map(prev);
      for (let i = 0; i < parsed.registers.length; i++) {
        newFields.set(makeRegisterKey(parsed.slaveAddr, parsed.funcCode, i), parsed.registers[i]!);
      }
      return newFields;
    });

    const protocol = parsedProtocolRef.current;
    if (protocol && protocol.dataFields.length > 0) {
      const regIndices = registerInstructionsRef.current;
      const currentInstrArrayIdx = pollIdxRef.current % regIndices.length;
      const instrIdx = regIndices[currentInstrArrayIdx] ?? -1;
      if (instrIdx >= 0 && instrIdx < protocol.instructions.length) {
        const inst = protocol.instructions[instrIdx]!;
        if (inst.funcCode === parsed.funcCode) {
          const fieldValues = parseDataFields(parsed.registers, protocol.dataFields, instrIdx);
          if (fieldValues.length > 0) {
            setParsedValues(prev => {
              const updated = prev.filter(v => !fieldValues.some(fv => fv.rowIndex === v.rowIndex));
              return [...updated, ...fieldValues];
            });
          }
        }
      }
    }

    advancePoll();
  }, [addLog, stopVersionRetry, loadProtocolDb, advancePoll]);

  const handleConnectionStatus = useCallback((payload: unknown) => {
    const p = payload as { status: ConnectionStatus };
    console.log('[BmsStore] connection-status:', p.status);
    addLog({ timestamp: Date.now(), direction: 'RX', parsedInfo: `Connection: ${p.status}`, rawHex: '' });
    setConnectionStatus(p.status);
  }, [addLog]);

  const handleThemeChange = useCallback((payload: unknown) => {
    const p = payload as { theme: 'light' | 'dark' };
    document.documentElement.setAttribute('data-theme', p.theme);
    try { localStorage.setItem('bms-theme', p.theme); } catch (_e) { /* noop */ }
  }, []);

  const handleLocaleChange = useCallback((payload: unknown) => {
    const p = payload as { locale: 'zh' | 'en' };
    i18n.changeLanguage(p.locale);
    try { localStorage.setItem('bms-locale', p.locale); } catch (_e) { /* noop */ }
  }, []);

  const handlers = useMemo(() => ({
    'bms:connection-status': handleConnectionStatus,
    'bms:raw-data': handleRawData,
    'bms:theme-change': handleThemeChange,
    'bms:locale-change': handleLocaleChange,
  }), [handleConnectionStatus, handleRawData, handleThemeChange, handleLocaleChange]);

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
      stopTimers();
      stopVersionRetry();
      versionRef.current = null;
      initPhaseRef.current = 'idle';
      setDeviceVersion(null);
      setProtocolDb(null);
      setParsedFields(new Map());
      setParsedValues([]);
    }
    return () => {
      stopTimers();
      stopVersionRetry();
    };
  }, [connectionStatus, startVersionRetry, stopVersionRetry, stopTimers]);

  useEffect(() => {
    if (protocolDb && connectionStatus === 'connected') {
      startInitialPoll();
    }
  }, [protocolDb, connectionStatus, startInitialPoll]);

  const autoRead = useCallback(() => {
    if (protocolDb && connectionStatus === 'connected') {
      stopTimers();
      startInitialPoll();
    }
  }, [protocolDb, connectionStatus, stopTimers, startInitialPoll]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const store = useMemo<BmsStore>(() => ({
    connectionStatus,
    protocolDb,
    protocolLoading,
    deviceVersion,
    parsedFields,
    parsedValues,
    logs,
    sendFrame,
    clearLogs,
    autoRead,
  }), [connectionStatus, protocolDb, protocolLoading, deviceVersion, parsedFields, parsedValues, logs, sendFrame, clearLogs, autoRead]);

  return (
    <BmsContext.Provider value={store}>
      {children}
    </BmsContext.Provider>
  );
}
