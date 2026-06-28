import { useState, useCallback } from 'react';
import { useBmsStore } from '@/store/context';
import { SendFrameCard } from './components/SendFrameCard';
import { ReceiveLogCard, type LogEntry, type LogFilter } from './components/ReceiveLogCard';
import { ProtocolDbCard } from './components/ProtocolDbCard';
import styles from './ExtendedCommandPage.module.css';

export function ExtendedCommandPage() {
  const { protocolDb, protocolLoading, sendFrame } = useBmsStore();
  const [prefilledHex, setPrefilledHex] = useState<string | undefined>();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>('all');

  const handleSendFrame = useCallback((frame: number[]) => {
    sendFrame(frame);
    setLogs(prev => [...prev, {
      id: `tx_${Date.now()}`,
      timestamp: Date.now(),
      direction: 'TX' as const,
      rawHex: frame.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
    }]);
  }, [sendFrame]);

  const handleFillCommand = useCallback((hex: string) => {
    setPrefilledHex(hex);
  }, []);

  return (
    <div className={styles.container}>
      <SendFrameCard onSendFrame={handleSendFrame} prefilledHex={prefilledHex} />
      <ReceiveLogCard logs={logs} filter={filter} onFilterChange={setFilter} />
      <ProtocolDbCard
        database={protocolDb}
        loading={protocolLoading}
        onInitProtocol={() => { }}
        onLoadDatabase={() => { }}
        onAutoRead={() => { }}
        onFillCommand={handleFillCommand}
      />
    </div>
  );
}
