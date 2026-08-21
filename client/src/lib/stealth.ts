import { ec, hash, CallData, stark } from 'starknet';

/**
 * OZ account class hash, pulled from the STRK20 ecosystem's own account-deployment tooling
 * (tmp_research/starknet-privacy/e2e/scripts/deploy-accounts.ts:54-56 — "OZ account class hash"),
 * so a deployed stealth address matches the OZ contract version the rest of the STRK20 tooling
 * deploys against. That script is the only OZ account class hash declaration found anywhere in
 * the starknet-privacy repo; it deploys test/e2e accounts, not necessarily against mainnet, so
 * this is not independently confirmed as declared on Starknet mainnet — verify the class hash is
 * declared on mainnet (e.g. via Voyager) before relying on it to deploy a real stealth account.
 */
const OZ_ACCOUNT_CLASS_HASH = '0x5b4b537eaa2399e3aa99c4e2e0208ebd6c71bc1467938cd52c798c601e43564';

export interface StealthKey {
  privateKey: string;
  publicKey: string;
  address: string;
}

export function generateStealthKey(): StealthKey {
  const privateKey = stark.randomAddress();
  const publicKey = ec.starkCurve.getStarkKey(privateKey);

  const address = hash.calculateContractAddressFromHash(
    publicKey,
    OZ_ACCOUNT_CLASS_HASH,
    CallData.compile({ publicKey }),
    '0'
  );

  return { privateKey, publicKey, address };
}

const SESSION_KEY = 'blindside_stealth';

export function saveStealthKey(key: StealthKey): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(key));
}

export function loadStealthKey(): StealthKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StealthKey) : null;
  } catch {
    return null;
  }
}

export function clearStealthKey(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function shortAddr(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
