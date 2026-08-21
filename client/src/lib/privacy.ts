import type { StarknetWindowObject } from '@starknet-io/get-starknet';
import { NETWORK } from './config';
import { logTx } from './txlog';

/**
 * Wire shape of a STRK20 privacy action (the deposit/withdraw/transfer variants of the
 * wallet-api `STRK20_ACTION` union this app sends). Verified against
 * tmp_research/starknet-privacy/client/src/builder.ts:137-159 (PrivacyTokenBuilderImpl.deposit/
 * withdraw/transfer) and client/src/interfaces.ts:29-33,77-78 — no `poolAddress` field on the
 * action itself, since the pool is resolved by the wallet, not supplied by the dapp.
 *
 * Not imported from `starknet` because `STRK20_ACTION` only ships in starknet.js
 * ^10.0.0-beta.6 (tmp_research/starknet-privacy/client/package.json:51), while this app
 * pins starknet ^6.24.1 (package.json). Local shim, same approach interfaces.ts itself uses
 * for wallet-api types not yet released upstream.
 */
type Strk20Action =
  | { type: 'deposit'; token: string; amount: string }
  | { type: 'withdraw'; token: string; amount: string; recipient: string }
  | { type: 'transfer'; token: string; amount: string; recipient: string };

/**
 * The privacy subset of a get-starknet v6 wallet a privacy-enabled wallet (e.g. Ready or Braavos
 * with STRK20 support) exposes directly on the wallet object — not through a generic
 * `wallet.request({type})` call. Verified against
 * tmp_research/starknet-privacy/client/src/interfaces.ts:111-125 (`PrivacyWallet`) and
 * client/src/client.ts:51-53, which shows `strk20InvokeTransaction(actions)` as the direct
 * prove+broadcast fast path used when there are no surrounding calls — exactly Blindside's case.
 */
interface Strk20Wallet {
  strk20InvokeTransaction(actions: Strk20Action[]): Promise<{ transaction_hash: string }>;
}

function asStrk20Wallet(wallet: StarknetWindowObject): Strk20Wallet {
  const candidate = wallet as unknown as Partial<Strk20Wallet>;
  if (typeof candidate.strk20InvokeTransaction !== 'function') {
    throw new Error(
      'Connected wallet does not expose STRK20 privacy methods (strk20InvokeTransaction). ' +
        'Connect a privacy-enabled Starknet wallet (e.g. Ready or Braavos with STRK20 support).'
    );
  }
  return candidate as Strk20Wallet;
}

export interface ShieldParams {
  token: string;
  amount: string;
}

export interface UnshieldParams {
  token: string;
  amount: string;
  recipient: string;
}

export interface PrivateTransferParams {
  token: string;
  amount: string;
  recipient: string;
}

export interface PrivacyTxResult {
  transactionHash: string;
}

export async function shield(
  wallet: StarknetWindowObject,
  params: ShieldParams
): Promise<PrivacyTxResult> {
  const strk20 = asStrk20Wallet(wallet);
  const { transaction_hash } = await strk20.strk20InvokeTransaction([
    { type: 'deposit', token: params.token, amount: params.amount },
  ]);

  logTx({
    hash: transaction_hash,
    action: 'shield',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
  });

  return { transactionHash: transaction_hash };
}

export async function unshield(
  wallet: StarknetWindowObject,
  params: UnshieldParams
): Promise<PrivacyTxResult> {
  const strk20 = asStrk20Wallet(wallet);
  const { transaction_hash } = await strk20.strk20InvokeTransaction([
    { type: 'withdraw', token: params.token, amount: params.amount, recipient: params.recipient },
  ]);

  logTx({
    hash: transaction_hash,
    action: 'unshield',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
    note: `→ ${params.recipient.slice(0, 10)}...`,
  });

  return { transactionHash: transaction_hash };
}

export async function privateTransfer(
  wallet: StarknetWindowObject,
  params: PrivateTransferParams
): Promise<PrivacyTxResult> {
  const strk20 = asStrk20Wallet(wallet);
  const { transaction_hash } = await strk20.strk20InvokeTransaction([
    { type: 'transfer', token: params.token, amount: params.amount, recipient: params.recipient },
  ]);

  logTx({
    hash: transaction_hash,
    action: 'private_transfer',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
  });

  return { transactionHash: transaction_hash };
}

export const USDC_ADDRESS_MAINNET = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';
export const USDC_ADDRESS_TESTNET = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
export const USDC_ADDRESS = NETWORK === 'mainnet' ? USDC_ADDRESS_MAINNET : USDC_ADDRESS_TESTNET;

export function parseUsdcAmount(human: string): string {
  const n = parseFloat(human);
  if (isNaN(n) || n <= 0) throw new Error('Invalid USDC amount');
  return Math.floor(n * 1_000_000).toString();
}

export function formatUsdcAmount(onChain: string): string {
  const n = parseInt(onChain, 10);
  return `${(n / 1_000_000).toFixed(2)} USDC`;
}
