import { createContext, useContext } from 'react';
import type { ConnectionStatus, ProtocolDatabase } from '@/types';

export interface BmsState {
  connectionStatus: ConnectionStatus;
  protocolDb: ProtocolDatabase | null;
  protocolLoading: boolean;
  versionQuerySent: boolean;
  deviceVersion: string | null;
  parsedFields: Map<string, number>;
}

export interface BmsActions {
  setConnectionStatus: (status: ConnectionStatus) => void;
  setProtocolDb: (db: ProtocolDatabase | null) => void;
  setProtocolLoading: (loading: boolean) => void;
  setVersionQuerySent: (sent: boolean) => void;
  setDeviceVersion: (version: string | null) => void;
  updateParsedFields: (fields: Map<string, number>) => void;
  sendFrame: (frame: number[]) => void;
}

export type BmsStore = BmsState & BmsActions;

export const BmsContext = createContext<BmsStore | null>(null);

export function useBmsStore(): BmsStore {
  const store = useContext(BmsContext);
  if (!store) throw new Error('useBmsStore must be used within BmsProvider');
  return store;
}