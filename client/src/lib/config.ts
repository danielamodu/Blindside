export type Network = 'mainnet' | 'testnet';

export const NETWORK = (import.meta.env.VITE_NETWORK ?? 'mainnet') as Network;

export const MAINNET_CONFIG = {
  chainId: 'SN_MAIN',
  rpcUrl: import.meta.env.VITE_RPC_URL ?? 'https://rpc.starknet.lava.build',
  poolAddress: import.meta.env.VITE_POOL_ADDRESS ?? '0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a',
  extendedApiUrl: import.meta.env.VITE_EXTENDED_API_URL ?? 'https://api.starknet.extended.exchange/api/v1',
  extendedWsUrl: import.meta.env.VITE_EXTENDED_WS_URL ?? 'wss://api.starknet.extended.exchange/stream.extended.exchange/v1',
  explorerUrl: 'https://voyager.online',
} as const;

export const TESTNET_CONFIG = {
  chainId: 'SN_SEPOLIA',
  rpcUrl: 'https://free-rpc.nethermind.io/sepolia-juno',
  poolAddress: '',
  extendedApiUrl: import.meta.env.VITE_EXTENDED_TESTNET_API_URL ?? 'https://api.starknet.sepolia.extended.exchange/api/v1',
  extendedWsUrl: import.meta.env.VITE_EXTENDED_TESTNET_WS_URL ?? 'wss://starknet.sepolia.extended.exchange/stream.extended.exchange/v1',
  explorerUrl: 'https://sepolia.voyager.online',
} as const;

export const CONFIG = NETWORK === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

export function explorerTxUrl(hash: string): string {
  return `${CONFIG.explorerUrl}/tx/${hash}`;
}

export function explorerAddrUrl(addr: string): string {
  return `${CONFIG.explorerUrl}/contract/${addr}`;
}
