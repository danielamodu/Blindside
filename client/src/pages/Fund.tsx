/**
 * Blindside visual reminder: Extended funding is a visibly separate handoff. Glass identifies
 * route and monitoring context; bridge addresses and credentials remain on solid surfaces.
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, Copy, Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck, Smartphone, WalletCards } from "lucide-react";
import { useState } from "react";

export default function Fund() {
  const [guideOpen, setGuideOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const bridgeAddress = "0x04e1...8F3A";

  const copy = async () => {
    try { await navigator.clipboard.writeText(bridgeAddress); } catch { /* See UI confirmation. */ }
    setCopied(true); window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell active="fund" eyebrow="Extended handoff · step 02" title="Fund Extended from your fresh route." description="Import the stealth key into your preferred Starknet wallet, initialize a separate Extended sub-account, then fund its bridge address from the stealth wallet.">
      {guideOpen && <section className="import-guide app-glass-panel"><div className="guide-mark"><Smartphone size={20} /></div><div><p className="eyebrow"><span className="eyebrow-dot" /> Before funding</p><h2>Bring your stealth account into Argent or Braavos.</h2><p>Use the backup key generated in the previous step, connect that account to Extended, and initialize the new sub-account before sending USDC.</p><div className="guide-steps"><span>01 Import stealth key</span><span>02 Connect to Extended</span><span>03 Initialize sub-account</span></div></div><button className="guide-dismiss" onClick={() => setGuideOpen(false)}>I’m ready <ArrowRight size={16} /></button></section>}

      <div className="app-grid fund-grid">
        <section className="app-solid-panel api-panel">
          <div className="panel-topline"><span className="mini-label">01 · Extended connection</span><span className={apiConnected ? "state-chip success" : "state-chip"}>{apiConnected ? "Session active" : "Not connected"}</span></div>
          <div className="panel-title-row"><div className="panel-icon"><KeyRound size={19} /></div><div><h2>Connect a session API key.</h2><p>Your key is held only in the current browser session. It clears when this tab closes.</p></div></div>
          <label className="stacked-field"><span>Extended API key</span><div className="secret-input"><input value={apiKey} type={showKey ? "text" : "password"} placeholder="x-api-key…" onChange={(event) => { setApiKey(event.target.value); setApiConnected(false); }} /><button onClick={() => setShowKey((visible) => !visible)} aria-label="Toggle API key visibility">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          <button className="app-primary-button" disabled={!apiKey || apiConnected} onClick={() => setApiConnected(true)}>{apiConnected ? <><Check size={16} /> API session connected</> : <>Validate session key <ArrowRight size={16} /></>}</button>
          <p className="app-form-note">Validation is visual only in this prototype; no request is made to Extended.</p>
        </section>

        <section className="app-solid-panel bridge-panel">
          <div className="panel-topline"><span className="mini-label">02 · Deposit bridge</span><span className="state-chip">Stealth wallet only</span></div>
          <div className="panel-title-row"><div className="panel-icon lens-icon"><WalletCards size={19} /></div><div><h2>Send USDC to the bridge address.</h2><p>This is the funding address for the selected Extended sub-account—not a destination for your primary wallet.</p></div></div>
          <div className="bridge-address"><div><span>Extended bridgeStarknetAddress</span><strong>{bridgeAddress}</strong></div><button onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</button></div>
          <div className="bridge-instruction"><span>From</span><strong>Stealth address · 0x061d...5bc1</strong><ArrowRight size={14} /><span>To</span><strong>Extended bridge</strong></div>
        </section>

        <section className="deposit-monitor app-glass-panel">
          <div className="monitor-header"><div><span className="mini-label">03 · Deposit confirmation monitor</span><h2>Watch the handoff without guessing.</h2></div><button className="refresh-monitor" onClick={() => setMonitoring(true)}><RefreshCw size={15} /> Refresh</button></div>
          <div className="monitor-grid"><div><span>Stealth route</span><strong><i className="status-dot" /> Ready to send</strong></div><div><span>Extended account</span><strong>{apiConnected ? <><i className="status-dot" /> Session connected</> : "Connect API key"}</strong></div><div><span>Deposit status</span><strong>{monitoring ? <><i className="waiting-dot" /> No confirmed deposit</> : "Monitoring paused"}</strong></div><div><span>Poll interval</span><strong>15 seconds</strong></div></div>
          <p>The live monitor will use your Extended session to detect the deposit after API connectivity is enabled in production.</p>
        </section>
      </div>
    </AppShell>
  );
}
