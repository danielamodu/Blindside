/**
 * Blindside visual reminder: Shield setup uses a glass route context around solid,
 * reviewable wallet, amount, and key-backup surfaces.
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, Copy, KeyRound, Shield as ShieldIcon, Wallet, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";

export default function Shield() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [amount, setAmount] = useState("500");
  const [shielded, setShielded] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [unshielded, setUnshielded] = useState(false);
  const [copied, setCopied] = useState(false);
  const displayAmount = useMemo(() => Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }), [amount]);
  const stealthAddress = "0x061d...5bc1";

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); } catch { /* Visual confirmation is still useful when clipboard access is unavailable. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell active="shield" eyebrow="Private entry · step 01" title="Shield, then create a fresh trading identity." description="Deposit USDC into the STRK20 pool, generate a new stealth account locally, and unshield to a destination that is separate from your main wallet.">
      <div className="app-notice"><span className="status-dot" /> <strong>Prototype interface.</strong> No wallet transaction is sent from this environment.</div>
      <div className="app-grid shield-grid">
        <section className="app-solid-panel shield-panel">
          <div className="panel-topline"><span className="mini-label">01 · Wallet</span><span className={walletConnected ? "state-chip success" : "state-chip"}>{walletConnected ? "Connected" : "Not connected"}</span></div>
          <div className="panel-title-row"><div className="panel-icon"><Wallet size={19} /></div><div><h2>Connect your funding wallet.</h2><p>Argent X or Braavos will provide the wallet that enters the privacy pool.</p></div></div>
          {walletConnected ? <div className="connected-wallet"><div><span>Connected address</span><strong>0x12A9...9fE7</strong></div><div><span>Available USDC</span><strong>1,284.32</strong></div><button onClick={() => setWalletConnected(false)}>Disconnect</button></div> : <button className="app-primary-button" onClick={() => setWalletConnected(true)}><Wallet size={16} /> Connect wallet <ArrowRight size={16} /></button>}
        </section>

        <section className="app-solid-panel shield-panel">
          <div className="panel-topline"><span className="mini-label">02 · Shield USDC</span><span className={shielded ? "state-chip success" : "state-chip"}>{shielded ? "Shielded" : "Awaiting approval"}</span></div>
          <div className="shield-amount-row"><div><label htmlFor="shield-amount">Amount to shield</label><div className="shield-amount-input"><input id="shield-amount" disabled={!walletConnected || shielded} value={amount} inputMode="decimal" onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} /><span>USDC</span></div><p>Available balance: <b>1,284.32 USDC</b></p></div><div className="shield-orb"><ShieldIcon size={23} /><small>STRK20</small></div></div>
          <div className="route-summary-line"><span>Main wallet</span><i /><strong>STRK20 privacy pool</strong><i /><span>Encrypted note</span></div>
          <button className="app-primary-button" disabled={!walletConnected || shielded || Number(amount) <= 0} onClick={() => setShielded(true)}>{shielded ? <><Check size={16} /> Shield complete</> : <>Shield {displayAmount} USDC <ArrowRight size={16} /></>}</button>
          {shielded && <p className="inline-confirm"><Check size={14} /> Shield request prepared. A verified pool receipt appears here after wallet confirmation.</p>}
        </section>

        <section className="app-solid-panel shield-panel">
          <div className="panel-topline"><span className="mini-label">03 · Stealth account</span><span className={keyGenerated ? "state-chip success" : "state-chip"}>{keyGenerated ? "Generated locally" : "Required"}</span></div>
          <div className="panel-title-row"><div className="panel-icon lens-icon"><WandSparkles size={18} /></div><div><h2>Generate a fresh stealth keypair.</h2><p>The private key is created locally and is required to control the new Starknet address.</p></div></div>
          {!keyGenerated ? <button className="app-secondary-button" disabled={!shielded} onClick={() => setKeyGenerated(true)}><KeyRound size={16} /> Generate fresh stealth keypair</button> : <div className="key-backup-box"><div className="key-backup-head"><div><span>Stealth private key</span><strong>0x06ac...1d7b</strong></div><button onClick={() => copy("0x06ac2d3a...1d7b")}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button></div><p>This key is only shown for the purpose of this product prototype. In production, users must back it up securely before continuing.</p><label className="save-key-check"><input type="checkbox" checked={keySaved} onChange={(event) => setKeySaved(event.target.checked)} /> <span>I have saved my private key.</span></label></div>}
        </section>

        <section className="app-glass-panel unshield-panel">
          <div className="panel-topline"><span className="mini-label">04 · Unshield</span><span className={unshielded ? "state-chip success" : "state-chip"}>{unshielded ? "Stealth funded" : "Fresh destination"}</span></div>
          <div className="unshield-layout"><div><h2>Unshield to your new address.</h2><p>Only the destination for the next leg is visible here. This becomes the funding wallet for your Extended sub-account.</p><div className="stealth-address"><span>Stealth Starknet address</span><strong>{stealthAddress}</strong><button onClick={() => copy(stealthAddress)}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div></div><div className="unshield-visual"><div className="privacy-lens mini"><span>NEW</span></div><i /><span className="unshield-dot" /></div></div>
          <button className="app-primary-button" disabled={!keyGenerated || !keySaved || unshielded} onClick={() => setUnshielded(true)}>{unshielded ? <><Check size={16} /> Stealth address funded</> : <>Unshield {displayAmount} USDC <ArrowRight size={16} /></>}</button>
        </section>
      </div>
    </AppShell>
  );
}
