/**
 * Blindside Withdraw Page — Integrated with SNIP12 Signed Extended Withdrawals, Optional Re-shield & Hackathon strk20.json Tracker
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, CircleAlert, Copy, Download, KeyRound, Shield, ShieldCheck, WalletCards } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { getExtendedClient, fmtUsdc } from "@/lib/extended";
import { shield, USDC_ADDRESS, parseUsdcAmount } from "@/lib/privacy";
import { getTxLog, countMainnetPoolTxs, exportStrk20Json, logTx } from "@/lib/txlog";
import type { TxEntry } from "@/lib/txlog";
import { CONFIG, NETWORK, explorerTxUrl } from "@/lib/config";
import { shortAddr } from "@/lib/stealth";

export default function Withdraw() {
  const [amount, setAmount] = useState("1.00");
  const [destination, setDestination] = useState("");
  const [starkPrivKey, setStarkPrivKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [reShieldEnabled, setReShieldEnabled] = useState(false);
  const [isReshielding, setIsReshielding] = useState(false);
  const [reshieldTxHash, setReshieldTxHash] = useState<string | null>(null);
  const [reshieldError, setReshieldError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [txLogs, setTxLogs] = useState<TxEntry[]>([]);
  const [mainnetCount, setMainnetCount] = useState(0);

  const displayAmount = useMemo(
    () => Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [amount]
  );

  const refreshTracker = () => {
    setTxLogs(getTxLog());
    setMainnetCount(countMainnetPoolTxs());
  };

  useEffect(() => {
    refreshTracker();
  }, []);

  const handleWithdraw = async () => {
    const client = getExtendedClient();
    if (!client) {
      setWithdrawError("Not connected to Extended. Return to the Extended handoff step.");
      return;
    }
    if (!amount || !destination || !starkPrivKey) return;
    setIsSubmitting(true);
    setWithdrawError(null);
    try {
      const onChainAmount = parseUsdcAmount(amount);
      const { ec, hash, shortString } = await import("starknet");

      const msgHash = hash.computeHashOnElements([
        shortString.encodeShortString("ExtendedWithdrawal"),
        onChainAmount,
        destination,
      ]);

      const sig = ec.starkCurve.sign(msgHash, starkPrivKey);
      const signature = `${sig.r.toString(16)},${sig.s.toString(16)}`;

      const result = await client.withdraw(onChainAmount, destination, signature);
      setWithdrawalId(result.withdrawalId);

      logTx({
        hash: result.withdrawalId,
        action: "extended_withdrawal",
        network: NETWORK,
        amount: `${displayAmount} USDC`,
        note: `→ ${shortAddr(destination)}`,
      });

      refreshTracker();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReshield = async () => {
    const wallet = (window as any).starknet;
    if (!wallet || !amount) return;
    setIsReshielding(true);
    setReshieldError(null);
    try {
      const onChainAmount = parseUsdcAmount(amount);
      const res = await shield(wallet, {
        token: USDC_ADDRESS,
        amount: onChainAmount,
        poolAddress: CONFIG.poolAddress,
      });
      setReshieldTxHash(res.transactionHash);
      refreshTracker();
    } catch (err) {
      setReshieldError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsReshielding(false);
    }
  };

  const downloadJson = () => {
    const data = exportStrk20Json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "strk20.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(destination);
    } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell
      active="withdraw"
      eyebrow="Private exit · step 04"
      title="Withdraw cleanly, then close the loop if you choose."
      description="Create a signed Extended withdrawal to a fresh Starknet destination. Once funds arrive, you can optionally start a new STRK20 shield route."
    >
      <div className="withdraw-grid">
        {/* 01: Extended Withdrawal Form */}
        <section className="app-solid-panel withdrawal-form">
          <div className="panel-topline">
            <span className="mini-label">01 · Extended withdrawal</span>
            <span className={withdrawalId ? "state-chip success" : "state-chip"}>
              {withdrawalId ? "Withdrawal initiated" : "Not signed"}
            </span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon"><WalletCards size={19} /></div>
            <div>
              <h2>Request margin withdrawal.</h2>
              <p>Uses your Extended Stark key client-side to generate a SNIP12 signature.</p>
            </div>
          </div>
          <div className="form-two-column">
            <label className="stacked-field">
              <span>Amount</span>
              <div className="inline-input">
                <input
                  value={amount}
                  inputMode="decimal"
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <b>USDC</b>
              </div>
            </label>
            <label className="stacked-field">
              <span>Amount to withdraw</span>
              <div className="read-field">
                <strong>{displayAmount} USDC</strong>
              </div>
            </label>
          </div>
          <label className="stacked-field">
            <span>Fresh Starknet destination address</span>
            <div className="secret-input destination-input">
              <input
                value={destination}
                placeholder="0x..."
                onChange={(e) => setDestination(e.target.value)}
              />
              <button onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
            </div>
          </label>
          <label className="stacked-field">
            <span>Extended Stark private key</span>
            <div className="secret-input">
              <input
                type="password"
                value={starkPrivKey}
                placeholder="Required for SNIP12 signature"
                onChange={(e) => setStarkPrivKey(e.target.value)}
              />
              <KeyRound size={16} />
            </div>
          </label>
          <div className="signing-warning">
            <CircleAlert size={16} />
            <span>Used only in-memory to sign the request. Never stored or transmitted.</span>
          </div>

          {withdrawError && <p className="app-form-note text-red">{withdrawError}</p>}

          <button
            className="app-primary-button"
            disabled={!amount || !destination || !starkPrivKey || isSubmitting || !!withdrawalId}
            onClick={handleWithdraw}
          >
            {isSubmitting ? "Signing request..." : withdrawalId ? <><Check size={16} /> Withdrawal ID: {withdrawalId}</> : <>Sign withdrawal for {displayAmount} USDC <ArrowRight size={16} /></>}
          </button>
        </section>

        {/* Route Status Card */}
        <section className="withdraw-route app-glass-panel">
          <div className="panel-topline">
            <span className="mini-label">Withdrawal route</span>
            <span className="state-chip">Fresh destination</span>
          </div>
          <div className="withdraw-route-visual">
            <div className="route-end extended-end"><span>E</span><strong>Extended account</strong></div>
            <i />
            <div className="privacy-lens small"><span>EXIT</span></div>
            <i />
            <div className="route-end fresh-end"><span><ShieldCheck size={15} /></span><strong>Fresh address</strong></div>
          </div>
          <div className="withdraw-route-summary">
            <div><span>Source</span><strong>Extended sub-account</strong></div>
            <div><span>Destination</span><strong>{destination ? shortAddr(destination) : "—"}</strong></div>
            <div>
              <span>Route state</span>
              <strong><i className={withdrawalId ? "status-dot" : "waiting-dot"} /> {withdrawalId ? "Withdrawal requested" : "Awaiting signature"}</strong>
            </div>
          </div>
        </section>

        {/* 02: Optional Re-shield */}
        <section className={reShieldEnabled ? "reshield-card app-solid-panel enabled" : "reshield-card app-solid-panel"}>
          <div className="panel-topline">
            <span className="mini-label">02 · Optional continuation</span>
            <span className={reShieldEnabled ? "state-chip success" : "state-chip"}>
              {reShieldEnabled ? "Included" : "Optional"}
            </span>
          </div>
          <div className="panel-title-row">
            <div className="panel-icon lens-icon"><Shield size={19} /></div>
            <div>
              <h2>Re-shield after withdrawal.</h2>
              <p>Close the circular privacy loop by shielding USDC back into the pool.</p>
            </div>
          </div>
          <button
            className={reShieldEnabled ? "toggle-choice active" : "toggle-choice"}
            onClick={() => setReShieldEnabled((v) => !v)}
          >
            <span><i /></span>
            {reShieldEnabled ? "Re-shield option enabled" : "Enable re-shield option"}
          </button>
          {reShieldEnabled && (
            <div className="mt-4">
              <button
                className="app-primary-button"
                disabled={isReshielding || !amount}
                onClick={handleReshield}
              >
                {isReshielding ? "Re-shielding..." : reshieldTxHash ? <><Check size={16} /> Re-shielded</> : <>Re-shield {displayAmount} USDC into pool <ArrowRight size={16} /></>}
              </button>
              {reshieldError && <p className="app-form-note text-red">{reshieldError}</p>}
              {reshieldTxHash && (
                <p className="inline-confirm">
                  <Check size={14} /> Re-shielded. Tx:{" "}
                  <a href={explorerTxUrl(reshieldTxHash)} target="_blank" rel="noreferrer" style={{ color: "#D8FF3E" }}>
                    {shortAddr(reshieldTxHash)}
                  </a>
                </p>
              )}
            </div>
          )}
        </section>

        {/* 03: Hackathon Submission Tracker */}
        <section className="hackathon-tracker app-glass-panel">
          <div className="tracker-head">
            <div>
              <span className="mini-label">STRK20 submission tracker</span>
              <h2>Mainnet Pool Transactions</h2>
            </div>
            <span className="tracker-count">{mainnetCount} <small>/ 3 required</small></span>
          </div>
          <div className="tracker-progress">
            <span style={{ width: `${Math.min((mainnetCount / 3) * 100, 100)}%`, background: mainnetCount >= 3 ? "#34d399" : "#D8FF3E" }} />
          </div>
          <div className="tracker-copy">
            <p>Confirmed mainnet pool transactions are recorded here for your hackathon submission.</p>
            <button className="app-secondary-button" onClick={downloadJson}>
              <Download size={16} /> Download strk20.json
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
