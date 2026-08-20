/**
 * Blindside Shield Page — Integrated with STRK20 Privacy Wallet API & Stealth Key derivation
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, Copy, KeyRound, Shield as ShieldIcon, Wallet, WandSparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { StarknetWindowObject } from "@starknet-io/get-starknet";
import { connect, disconnect } from "@starknet-io/get-starknet";
import { shield, unshield, USDC_ADDRESS, parseUsdcAmount, formatUsdcAmount } from "@/lib/privacy";
import { generateStealthKey, saveStealthKey, loadStealthKey, shortAddr } from "@/lib/stealth";
import type { StealthKey } from "@/lib/stealth";
import { CONFIG, explorerTxUrl } from "@/lib/config";

export default function Shield() {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [amount, setAmount] = useState("1.00");
  const [isShielding, setIsShielding] = useState(false);
  const [shieldTxHash, setShieldTxHash] = useState<string | null>(null);
  const [shieldError, setShieldError] = useState<string | null>(null);

  const [stealthKey, setStealthKey] = useState<StealthKey | null>(null);
  const [keySaved, setKeySaved] = useState(false);

  const [isUnshielding, setIsUnshielding] = useState(false);
  const [unshieldTxHash, setUnshieldTxHash] = useState<string | null>(null);
  const [unshieldError, setUnshieldError] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const displayAmount = useMemo(
    () => Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [amount]
  );

  useEffect(() => {
    const existing = loadStealthKey();
    if (existing) {
      setStealthKey(existing);
      setKeySaved(true);
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const starknet = await connect({ modalMode: "alwaysAsk" });
      if (starknet) {
        const walletObj = starknet as any;
        const addr: string | null = walletObj.account?.address ?? walletObj.selectedAddress ?? null;
        if (addr) {
          setWallet(starknet);
          setWalletAddress(addr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    if (wallet) {
      await disconnect({ clearLastWallet: true }).catch(() => {});
    }
    setWallet(null);
    setWalletAddress(null);
  };

  const handleShield = async () => {
    if (!wallet || !amount || parseFloat(amount) <= 0) return;
    setIsShielding(true);
    setShieldError(null);
    try {
      const onChain = parseUsdcAmount(amount);
      const res = await shield(wallet, {
        token: USDC_ADDRESS,
        amount: onChain,
        poolAddress: CONFIG.poolAddress,
      });
      setShieldTxHash(res.transactionHash);
    } catch (err) {
      setShieldError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsShielding(false);
    }
  };

  const handleGenerateStealth = () => {
    const key = generateStealthKey();
    saveStealthKey(key);
    setStealthKey(key);
    setKeySaved(false);
  };

  const handleUnshield = async () => {
    if (!wallet || !stealthKey || !amount || parseFloat(amount) <= 0) return;
    setIsUnshielding(true);
    setUnshieldError(null);
    try {
      const onChain = parseUsdcAmount(amount);
      const res = await unshield(wallet, {
        token: USDC_ADDRESS,
        amount: onChain,
        recipient: stealthKey.address,
        poolAddress: CONFIG.poolAddress,
      });
      setUnshieldTxHash(res.transactionHash);
    } catch (err) {
      setUnshieldError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUnshielding(false);
    }
  };

  const copy = async (value: string, isKey: boolean) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch { /* fallback */ }
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1600);
    } else {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 1600);
    }
  };

  return (
    <AppShell
      active="shield"
      eyebrow="Private entry · step 01"
      title="Shield, then create a fresh trading identity."
      description="Deposit USDC into the STRK20 pool, generate a new stealth account locally, and unshield to a destination that is separate from your main wallet."
    >
      <div className="app-grid shield-grid">
        {/* 01: Wallet Connection */}
        <section className="app-solid-panel shield-panel">
          <div className="panel-topline">
            <span className="mini-label">01 · Wallet</span>
            <span className={walletAddress ? "state-chip success" : "state-chip"}>
              {walletAddress ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon"><Wallet size={19} /></div>
            <div>
              <h2>Connect your funding wallet.</h2>
              <p>Argent X or Braavos provides the privacy-enabled wallet to interact with the pool.</p>
            </div>
          </div>
          {walletAddress ? (
            <div className="connected-wallet">
              <div>
                <span>Connected address</span>
                <strong>{shortAddr(walletAddress)}</strong>
              </div>
              <button onClick={handleDisconnectWallet}>Disconnect</button>
            </div>
          ) : (
            <button className="app-primary-button" disabled={isConnecting} onClick={handleConnectWallet}>
              <Wallet size={16} /> {isConnecting ? "Connecting..." : "Connect wallet"} <ArrowRight size={16} />
            </button>
          )}
        </section>

        {/* 02: Shield USDC */}
        <section className="app-solid-panel shield-panel">
          <div className="panel-topline">
            <span className="mini-label">02 · Shield USDC</span>
            <span className={shieldTxHash ? "state-chip success" : "state-chip"}>
              {shieldTxHash ? "Shielded" : isShielding ? "Shielding..." : "Awaiting approval"}
            </span>
          </div>
          <div className="shield-amount-row">
            <div>
              <label htmlFor="shield-amount">Amount to shield</label>
              <div className="shield-amount-input">
                <input
                  id="shield-amount"
                  disabled={!walletAddress || isShielding}
                  value={amount}
                  inputMode="decimal"
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <span>USDC</span>
              </div>
            </div>
            <div className="shield-orb"><ShieldIcon size={23} /><small>STRK20</small></div>
          </div>
          <div className="route-summary-line">
            <span>Main wallet</span><i /><strong>STRK20 pool</strong><i /><span>Encrypted note</span>
          </div>
          <button
            className="app-primary-button"
            disabled={!walletAddress || isShielding || Number(amount) <= 0}
            onClick={handleShield}
          >
            {isShielding ? "Confirming in wallet..." : shieldTxHash ? <><Check size={16} /> Shielded</> : <>Shield {displayAmount} USDC <ArrowRight size={16} /></>}
          </button>
          {shieldError && <p className="app-form-note text-red">{shieldError}</p>}
          {shieldTxHash && (
            <p className="inline-confirm">
              <Check size={14} /> Shield confirmed. Tx:{" "}
              <a href={explorerTxUrl(shieldTxHash)} target="_blank" rel="noreferrer" style={{ color: "#D8FF3E" }}>
                {shortAddr(shieldTxHash)}
              </a>
            </p>
          )}
        </section>

        {/* 03: Stealth Account Generation */}
        <section className="app-solid-panel shield-panel">
          <div className="panel-topline">
            <span className="mini-label">03 · Stealth account</span>
            <span className={stealthKey ? "state-chip success" : "state-chip"}>
              {stealthKey ? "Generated locally" : "Required"}
            </span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon lens-icon"><WandSparkles size={18} /></div>
            <div>
              <h2>Generate a fresh stealth keypair.</h2>
              <p>The Stark private key is generated locally using Web Crypto. Never transmitted.</p>
            </div>
          </div>
          {!stealthKey ? (
            <button className="app-secondary-button" onClick={handleGenerateStealth}>
              <KeyRound size={16} /> Generate fresh stealth keypair
            </button>
          ) : (
            <div className="key-backup-box">
              <div className="key-backup-head">
                <div>
                  <span>Stealth private key</span>
                  <strong>{shortAddr(stealthKey.privateKey)}</strong>
                </div>
                <button onClick={() => copy(stealthKey.privateKey, true)}>
                  {copiedKey ? <Check size={15} /> : <Copy size={15} />}
                  {copiedKey ? "Copied" : "Copy"}
                </button>
              </div>
              <p>Save this private key securely. It controls funds sent to your stealth address.</p>
              <label className="save-key-check">
                <input
                  type="checkbox"
                  checked={keySaved}
                  onChange={(e) => setKeySaved(e.target.checked)}
                />
                <span>I have saved my private key.</span>
              </label>
            </div>
          )}
        </section>

        {/* 04: Unshield to Stealth Address */}
        <section className="app-glass-panel unshield-panel">
          <div className="panel-topline">
            <span className="mini-label">04 · Unshield</span>
            <span className={unshieldTxHash ? "state-chip success" : "state-chip"}>
              {unshieldTxHash ? "Unshielded" : isUnshielding ? "Unshielding..." : "Fresh destination"}
            </span>
          </div>
          <div className="unshield-layout">
            <div>
              <h2>Unshield to your new address.</h2>
              <p>Withdraws from the pool to your stealth address with no on-chain link to your wallet.</p>
              {stealthKey && (
                <div className="stealth-address">
                  <span>Stealth Starknet address</span>
                  <strong>{shortAddr(stealthKey.address)}</strong>
                  <button onClick={() => copy(stealthKey.address, false)}>
                    {copiedAddr ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
            <div className="unshield-visual">
              <div className="privacy-lens mini"><span>NEW</span></div>
              <i /><span className="unshield-dot" />
            </div>
          </div>
          <button
            className="app-primary-button"
            disabled={!wallet || !stealthKey || !keySaved || isUnshielding || Number(amount) <= 0}
            onClick={handleUnshield}
          >
            {isUnshielding ? "Unshielding..." : unshieldTxHash ? <><Check size={16} /> Stealth address funded</> : <>Unshield {displayAmount} USDC <ArrowRight size={16} /></>}
          </button>
          {unshieldError && <p className="app-form-note text-red">{unshieldError}</p>}
          {unshieldTxHash && (
            <p className="inline-confirm">
              <Check size={14} /> Unshield confirmed. Tx:{" "}
              <a href={explorerTxUrl(unshieldTxHash)} target="_blank" rel="noreferrer" style={{ color: "#D8FF3E" }}>
                {shortAddr(unshieldTxHash)}
              </a>
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
