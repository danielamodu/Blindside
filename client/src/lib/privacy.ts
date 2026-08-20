import type { StarknetWindowObject } from '@starknet-io/get-starknet';
import { CONFIG, NETWORK } from './config';
import { logTx } from './txlog';

const WALLET_METHODS = {
  shield: 'starknet_shield',
  unshield: 'starknet_unshield',
  privateTransfer: 'starknet_privateTransfer',
  privateBalance: 'starknet_getPrivateBalance',
} as const;

export interface ShieldParams {
  token: string;
  amount: string;
  poolAddress?: string;
}

export interface UnshieldParams {
  token: string;
  amount: string;
  recipient: string;
  poolAddress?: string;
}

export interface PrivateTransferParams {
  token: string;
  amount: string;
  recipient: string;
  poolAddress?: string;
}

export interface PrivacyTxResult {
  transactionHash: string;
}

export interface PrivateBalanceResult {
  balance: string;
  token: string;
}

export async function shield(
  wallet: StarknetWindowObject,
  params: ShieldParams
): Promise<PrivacyTxResult> {
  const poolAddress = params.poolAddress ?? CONFIG.poolAddress;
  if (!poolAddress) {
    throw new Error('Pool address not configured.');
  }

  const result = (await (wallet as any).request({
    type: WALLET_METHODS.shield,
    params: {
      token: params.token,
      amount: params.amount,
      poolAddress,
    },
  })) as PrivacyTxResult;

  logTx({
    hash: result.transactionHash,
    action: 'shield',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
  });

  return result;
}

export async function unshield(
  wallet: StarknetWindowObject,
  params: UnshieldParams
): Promise<PrivacyTxResult> {
  const poolAddress = params.poolAddress ?? CONFIG.poolAddress;
  if (!poolAddress) {
    throw new Error('Pool address not configured.');
  }

  const result = (await (wallet as any).request({
    type: WALLET_METHODS.unshield,
    params: {
      token: params.token,
      amount: params.amount,
      recipient: params.recipient,
      poolAddress,
    },
  })) as PrivacyTxResult;

  logTx({
    hash: result.transactionHash,
    action: 'unshield',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
    note: `→ ${params.recipient.slice(0, 10)}...`,
  });

  return result;
}

export async function privateTransfer(
  wallet: StarknetWindowObject,
  params: PrivateTransferParams
): Promise<PrivacyTxResult> {
  const poolAddress = params.poolAddress ?? CONFIG.poolAddress;
  if (!poolAddress) {
    throw new Error('Pool address not configured.');
  }

  const result = (await (wallet as any).request({
    type: WALLET_METHODS.privateTransfer,
    params: {
      token: params.token,
      amount: params.amount,
      recipient: params.recipient,
      poolAddress,
    },
  })) as PrivacyTxResult;

  logTx({
    hash: result.transactionHash,
    action: 'private_transfer',
    network: NETWORK,
    amount: formatUsdcAmount(params.amount),
  });

  return result;
}

export async function getPrivateBalance(
  wallet: StarknetWindowObject,
  token: string,
  poolAddress?: string
): Promise<PrivateBalanceResult> {
  const pool = poolAddress ?? CONFIG.poolAddress;
  return (await (wallet as any).request({
    type: WALLET_METHODS.privateBalance,
    params: { token, poolAddress: pool },
  })) as PrivateBalanceResult;
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
