import { CONFIG } from './config';

/**
 * Verified against `AccountInfo` (tmp_research/python_sdk/specs/rest-api.openapi.yaml:589-610).
 * No `starkKey` field exists there — the real field is `l2Key`. `accountId` is an int64 number,
 * not a string, and there is no `vaultId` field (the closest is the nullable `l2Vault`).
 */
export interface ExtendedAccount {
  accountId: number;
  l2Key: string;
  bridgeStarknetAddress: string;
  l2Vault: string | null;
  status: string;
}

/**
 * Verified against `Balance` (rest-api.openapi.yaml:658-697) and its Python model
 * (tmp_research/python_sdk/x10/models/balance.py:7-19, all `Decimal` fields). The prior
 * `pendingDeposit`/`pendingWithdrawal` fields don't exist anywhere in the real schema — dropped
 * in favor of the real `availableForTrade`/`availableForWithdrawal` fields.
 */
export interface ExtendedBalance {
  balance: string;
  equity: string;
  availableForTrade: string;
  availableForWithdrawal: string;
  unrealisedPnl: string;
}

/**
 * Verified against `Position` (rest-api.openapi.yaml:699-747). `entryPrice`/`unrealizedPnl`
 * (American spelling) didn't match the real field names `openPrice`/`unrealisedPnl`.
 */
export interface ExtendedPosition {
  market: string;
  side: 'LONG' | 'SHORT';
  size: string;
  openPrice: string;
  markPrice: string;
  unrealisedPnl: string;
  leverage: string;
}

/**
 * Verified against `AssetOperation` (rest-api.openapi.yaml:1267-1289). There is no `txHash`
 * field on this object anywhere in the spec (dropped — fabricated), and timestamps are
 * `createdAt`/`updatedAt`, not a single `timestamp`.
 */
export interface AssetOperation {
  id: string;
  accountId: number;
  type: string;
  status: string;
  amount: string;
  asset: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Response envelope verified against `ApiResponse` / `PaginatedResponse` / `ErrorResponse`
 * (rest-api.openapi.yaml:192-235): the discriminant is `ok: boolean`, not `status: 'ok'|'error'`
 * — the prior code's `json.status === 'error'` check could never match a real response (the
 * field doesn't exist), so API-level errors were silently swallowed and `undefined` data was
 * returned as if it were valid. An error response carries `code`/`message` directly on the
 * envelope, not nested under `error`.
 */
interface ApiResponse<T> {
  ok: boolean;
  data: T;
  code?: number;
  message?: string;
  cursor?: string | null;
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
    if (!json.ok) {
      throw new Error(`Extended API error: ${json.message ?? 'unknown'}`);
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
    if (!json.ok) {
      throw new Error(`Extended API error: ${json.message ?? 'unknown'}`);
    }
    return json.data;
  }

  /**
   * GET /user/account/info — verified rest-api.openapi.yaml:2100-2126. `/user/account`
   * (singular, no `/info`) does not exist in the spec and 404s.
   */
  async getAccount(): Promise<ExtendedAccount> {
    return this.get<ExtendedAccount>('/user/account/info');
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

  /**
   * POST /user/withdrawal. NOT YET IMPLEMENTED against the real request shape — see the
   * caller in Withdraw.tsx and the accompanying report for why. The flat
   * `{amount, asset, destination, nonce}` body the OpenAPI `WithdrawalRequest` component
   * describes (rest-api.openapi.yaml:1119-1137) is not what the reference client actually
   * sends: `x10/clients/rest/modules/account_module.py:302-349` posts to this same path with
   * `create_withdrawal_object(...).to_api_request_json()`
   * (x10/signing/withdrawal_object.py:20-77), a nested object carrying a StarkEx settlement
   * signature — not a signature over this method's plain arguments.
   */
  async withdraw(): Promise<{ withdrawalId: string }> {
    throw new Error(
      'Extended withdrawal signing is not implemented — see report: it requires a StarkEx ' +
        'settlement hash (fast_stark_crypto.get_withdrawal_msg_hash), not SNIP-12 typed data.'
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

/**
 * Extended REST balances/amounts are plain decimal strings (e.g. "150.50"), not raw on-chain
 * integers — verified against `format: decimal` in the OpenAPI schema and the Python SDK's
 * `Decimal`-typed model fields (tmp_research/python_sdk/x10/models/balance.py:9-18), parsed
 * directly from the JSON value with no further scaling. The prior implementation divided by
 * 1_000_000 as if this were raw on-chain USDC calldata (which *is* scaled that way — see
 * `parseUsdcAmount`/`formatUsdcAmount` in privacy.ts, a different unit domain), which would
 * have displayed "150.50" as "0.00015".
 */
export function fmtUsdc(decimalValue: string | undefined): string {
  if (!decimalValue) return '—';
  const n = parseFloat(decimalValue);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
