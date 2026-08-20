import { ec, hash, CallData, stark } from 'starknet';

const OZ_ACCOUNT_CLASS_HASH = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';

export interface StealthKey {
  privateKey: string;
  publicKey: string;
  address: string;
}

export function generateStealthKey(): StealthKey {
  const entropy = new Uint8Array(32);
  crypto.getRandomValues(entropy);
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
