/**
 * Blindside Fund Page — Integrated with Extended API Key Validation & Deposit Operations Monitor
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, Copy, Eye, EyeOff, KeyRound, RefreshCw, Smartphone, WalletCards } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { initExtendedClient, getExtendedClient } from "@/lib/extended";
import type { ExtendedAccount, AssetOperation } from "@/lib/extended";
import { loadStealthKey, shortAddr } from "@/lib/stealth";

export default function Fund() {
  const [guideOpen, setGuideOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [account, setAccount] = useState<ExtendedAccount | null>(null);
  const [operations, setOperations] = useState<AssetOperation[]>([]);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stealthKey = loadStealthKey();

  useEffect(() => {
    const storedKey = sessionStorage.getItem("blindside_ext_apikey");
    if (storedKey) {
      setApiKey(storedKey);
      connectApiKey(storedKey);
    }
  }, []);

  const connectApiKey = async (keyToUse?: string) => {
    const k = (keyToUse ?? apiKey).trim();
    if (!k) return;
    setIsConnecting(true);
    setApiError(null);
    try {
      const client = initExtendedClient(k);
      const acct = await client.getAccount();
      setAccount(acct);
      setApiConnected(true);
      sessionStorage.setItem("blindside_ext_apikey", k);
      fetchOperations();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : String(err));
      setApiConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchOperations = useCallback(async () => {
    const client = getExtendedClient();
    if (!client) return;
    setIsRefreshing(true);
    try {
      const ops = await client.getAssetOperations(10);
      setOperations(ops);
    } catch {
      // silent polling
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!apiConnected) return;
    const interval = setInterval(fetchOperations, 15_000);
    return () => clearInterval(interval);
  }, [apiConnected, fetchOperations]);

  const copy = async () => {
    if (!account?.bridgeStarknetAddress) return;
    try {
      await navigator.clipboard.writeText(account.bridgeStarknetAddress);
    } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell
      active="fund"
      eyebrow="Extended handoff · step 02"
      title="Fund Extended from your fresh route."
      description="Import the stealth key into your preferred Starknet wallet, initialize a separate Extended sub-account, then fund its bridge address from the stealth wallet."
    >
      {guideOpen && (
        <section className="import-guide app-glass-panel">
          <div className="guide-mark"><Smartphone size={20} /></div>
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Before funding</p>
            <h2>Bring your stealth account into Argent or Braavos.</h2>
            <p>Use the backup key generated in the previous step, connect that account to Extended, and copy your API key.</p>
            <div className="guide-steps">
              <span>01 Import stealth key</span>
              <span>02 Connect to Extended</span>
              <span>03 Get Extended API key</span>
            </div>
          </div>
          <button className="guide-dismiss" onClick={() => setGuideOpen(false)}>
            I&apos;m ready <ArrowRight size={16} />
          </button>
        </section>
      )}

      <div className="app-grid fund-grid">
        {/* 01: Extended API Key Connection */}
        <section className="app-solid-panel api-panel">
          <div className="panel-topline">
            <span className="mini-label">01 · Extended connection</span>
            <span className={apiConnected ? "state-chip success" : "state-chip"}>
              {apiConnected ? "Session active" : "Not connected"}
            </span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon"><KeyRound size={19} /></div>
            <div>
              <h2>Connect a session API key.</h2>
              <p>Stored only in sessionStorage for security. Cleared when tab closes.</p>
            </div>
          </div>
          <label className="stacked-field">
            <span>Extended API key</span>
            <div className="secret-input">
              <input
                value={apiKey}
                type={showKey ? "text" : "password"}
                placeholder="Paste Extended API key..."
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiConnected(false);
                }}
              />
              <button onClick={() => setShowKey((v) => !v)} aria-label="Toggle API key visibility">
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {apiError && <p className="app-form-note text-red">{apiError}</p>}
          <button
            className="app-primary-button"
            disabled={!apiKey || apiConnected || isConnecting}
            onClick={() => connectApiKey()}
          >
            {isConnecting ? "Connecting..." : apiConnected ? <><Check size={16} /> API session connected</> : <>Connect Extended Session <ArrowRight size={16} /></>}
          </button>
        </section>

        {/* 02: Bridge Address Display */}
        <section className="app-solid-panel bridge-panel">
          <div className="panel-topline">
            <span className="mini-label">02 · Deposit bridge</span>
            <span className="state-chip">Stealth wallet only</span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon lens-icon"><WalletCards size={19} /></div>
            <div>
              <h2>Send USDC to the bridge address.</h2>
              <p>Extended credits your account automatically once the transaction is detected.</p>
            </div>
          </div>
          <div className="bridge-address">
            <div>
              <span>Extended bridgeStarknetAddress</span>
              <strong>{account ? shortAddr(account.bridgeStarknetAddress) : "Connect API key to view"}</strong>
            </div>
            {account && (
              <button onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="bridge-instruction">
            <span>From</span>
            <strong>{stealthKey ? shortAddr(stealthKey.address) : "Stealth address"}</strong>
            <ArrowRight size={14} />
            <span>To</span>
            <strong>Extended bridge</strong>
          </div>
        </section>

        {/* 03: Deposit Confirmation Monitor */}
        <section className="deposit-monitor app-glass-panel">
          <div className="monitor-header">
            <div>
              <span className="mini-label">03 · Deposit confirmation monitor</span>
              <h2>Watch deposit operations in real-time.</h2>
            </div>
            <button className="refresh-monitor" disabled={isRefreshing || !apiConnected} onClick={fetchOperations}>
              <RefreshCw size={15} className={isRefreshing ? "spin" : ""} /> Refresh
            </button>
          </div>
          <div className="monitor-grid">
            <div>
              <span>Stealth route</span>
              <strong><i className="status-dot" /> {stealthKey ? "Key generated" : "No stealth key"}</strong>
            </div>
            <div>
              <span>Extended account</span>
              <strong>{account ? <><i className="status-dot" /> {account.accountId}</> : "Connect API key"}</strong>
            </div>
            <div>
              <span>Recent operations</span>
              <strong>{operations.length > 0 ? `${operations.length} recorded` : "Awaiting operations"}</strong>
            </div>
            <div>
              <span>Poll interval</span>
              <strong>15 seconds</strong>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
