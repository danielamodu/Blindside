import { CONFIG } from './config';

export interface ExtendedAccount {
  accountId: string;
  starkKey: string;
  bridgeStarknetAddress: string;
  vaultId?: string;
}

export interface ExtendedBalance {
  balance: string;
  pendingDeposit?: string;
  pendingWithdrawal?: string;
}

export interface ExtendedPosition {
  market: string;
  side: 'LONG' | 'SHORT';
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  leverage: string;
}

export interface AssetOperation {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: string;
  timestamp: number;
  txHash?: string;
}

interface ApiResponse<T> {
  status: 'ok' | 'error';
  data: T;
  error?: { code: number; message: string };
  pagination?: { cursor: number; count: number };
}

export class ExtendedClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.baseUrl = CONFIG.extendedApiUrl;
    this.apiKey = apiKey;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'Blindside/0.1.0',
      'X-Api-Key': this.apiKey,
      ...extra,
    };
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Extended API ${path} → ${res.status}: ${text}`);
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (json.status === 'error') {
      throw new Error(`Extended API error: ${json.error?.message ?? 'unknown'}`);
    }
    return json.data;
  }

  private async post<T>(path: string, body: unknown, signature?: string): Promise<T> {
    const extra: Record<string, string> = signature ? { 'X-Signature': signature } : {};
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(extra),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Extended API POST ${path} → ${res.status}: ${text}`);
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (json.status === 'error') {
      throw new Error(`Extended API error: ${json.error?.message ?? 'unknown'}`);
    }
    return json.data;
  }

  async getAccount(): Promise<ExtendedAccount> {
    return this.get<ExtendedAccount>('/user/account');
  }

  async getBalance(): Promise<ExtendedBalance> {
    return this.get<ExtendedBalance>('/user/balance');
  }

  async getPositions(): Promise<ExtendedPosition[]> {
    return this.get<ExtendedPosition[]>('/user/positions');
  }

  async getAssetOperations(limit = 20): Promise<AssetOperation[]> {
    return this.get<AssetOperation[]>(`/user/assetOperations?limit=${limit}`);
  }

  async withdraw(
    amount: string,
    address: string,
    signature: string
  ): Promise<{ withdrawalId: string }> {
    return this.post<{ withdrawalId: string }>(
      '/user/withdrawal',
      { amount, address },
      signature
    );
  }
}

let _client: ExtendedClient | null = null;

export function initExtendedClient(apiKey: string): ExtendedClient {
  _client = new ExtendedClient(apiKey);
  return _client;
}

export function getExtendedClient(): ExtendedClient | null {
  return _client;
}

export function fmtUsdc(onChain: string | undefined): string {
  if (!onChain) return '—';
  const n = parseFloat(onChain) / 1_000_000;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
