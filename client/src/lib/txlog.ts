export type TxAction = 'shield' | 'unshield' | 'private_transfer' | 'extended_deposit' | 'extended_withdrawal';

export interface TxEntry {
  hash: string;
  action: TxAction;
  network: 'mainnet' | 'testnet';
  timestamp: number;
  amount?: string;
  note?: string;
}

const STORAGE_KEY = 'blindside_txlog';

function loadRaw(): TxEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TxEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRaw(entries: TxEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function logTx(entry: Omit<TxEntry, 'timestamp'>): TxEntry {
  const full: TxEntry = { ...entry, timestamp: Date.now() };
  const entries = loadRaw();
  entries.push(full);
  saveRaw(entries);
  return full;
}

export function getTxLog(): TxEntry[] {
  return loadRaw();
}

export function clearTxLog(): void {
  saveRaw([]);
}

export function countMainnetPoolTxs(): number {
  return loadRaw().filter(
    (e) => e.network === 'mainnet' && ['shield', 'unshield', 'private_transfer'].includes(e.action)
  ).length;
}

export function exportStrk20Json(): object {
  const entries = loadRaw();
  return {
    project: 'Blindside',
    repo: 'https://github.com/danielamodu/Blindside',
    transactions: entries
      .filter((e) => e.network === 'mainnet')
      .map((e) => ({
        hash: e.hash,
        action: e.action,
        network: e.network,
        timestamp: new Date(e.timestamp).toISOString(),
        ...(e.amount ? { amount: e.amount } : {}),
        ...(e.note ? { note: e.note } : {}),
      })),
    contracts: [],
    demo_video: '',
    demo_url: ''
  };
}
