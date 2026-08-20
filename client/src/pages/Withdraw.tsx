/**
 * Blindside visual reminder: Withdrawal is a solid review surface with an optional, clearly
 * separated re-shield step; glass is used only for status and the route completion context.
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Check, CircleAlert, Copy, Download, KeyRound, RefreshCw, Shield, ShieldCheck, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState("500");
  const [destination, setDestination] = useState("0x02b9...Aa41");
  const [privateKey, setPrivateKey] = useState("");
  const [reShield, setReShield] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const displayAmount = useMemo(() => Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }), [amount]);

  const copy = async () => { try { await navigator.clipboard.writeText(destination); } catch { /* See visual confirmation. */ } setCopied(true); window.setTimeout(() => setCopied(false), 1600); };

  return (
    <AppShell active="withdraw" eyebrow="Private exit · step 04" title="Withdraw cleanly, then close the loop if you choose." description="Create a signed Extended withdrawal to a fresh Starknet destination. Once funds arrive, you can optionally start a new STRK20 shield route.">
      <div className="withdraw-grid">
        <section className="app-solid-panel withdrawal-form">
          <div className="panel-topline"><span className="mini-label">01 · Extended withdrawal</span><span className={submitted ? "state-chip success" : "state-chip"}>{submitted ? "Review submitted" : "Not signed"}</span></div>
          <div className="panel-title-row"><div className="panel-icon"><WalletCards size={19} /></div><div><h2>Request margin withdrawal.</h2><p>The client-side signing key is used only to prepare the SNIP12 withdrawal request.</p></div></div>
          <div className="form-two-column"><label className="stacked-field"><span>Amount</span><div className="inline-input"><input value={amount} inputMode="decimal" onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} /><b>USDC</b></div></label><label className="stacked-field"><span>Withdrawable margin</span><div className="read-field"><strong>2,450.00 USDC</strong><button onClick={() => setAmount("2450")}>Max</button></div></label></div>
          <label className="stacked-field"><span>Fresh Starknet destination</span><div className="secret-input destination-input"><input value={destination} onChange={(event) => setDestination(event.target.value)} /><button onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div></label>
          <label className="stacked-field"><span>Extended Stark private key</span><div className="secret-input"><input type="password" value={privateKey} placeholder="Required for client-side SNIP12 signing" onChange={(event) => setPrivateKey(event.target.value)} /><KeyRound size={16} /></div></label>
          <div className="signing-warning"><CircleAlert size={16} /><span>Your private key must never be stored. The production flow should only use it locally for request signing.</span></div>
          <button className="app-primary-button" disabled={!amount || !destination || !privateKey || submitted} onClick={() => setSubmitted(true)}>{submitted ? <><Check size={16} /> Withdrawal review ready</> : <>Sign withdrawal for {displayAmount} USDC <ArrowRight size={16} /></>}</button>
          {submitted && <p className="inline-confirm"><Check size={14} /> Prototype signing state recorded. No withdrawal was submitted to Extended.</p>}
        </section>

        <section className="withdraw-route app-glass-panel">
          <div className="panel-topline"><span className="mini-label">Withdrawal route</span><span className="state-chip">Fresh destination</span></div>
          <div className="withdraw-route-visual"><div className="route-end extended-end"><span>E</span><strong>Extended account</strong></div><i /><div className="privacy-lens small"><span>EXIT</span></div><i /><div className="route-end fresh-end"><span><ShieldCheck size={15} /></span><strong>Fresh address</strong></div></div>
          <div className="withdraw-route-summary"><div><span>Source</span><strong>Extended sub-account</strong></div><div><span>Destination</span><strong>{destination}</strong></div><div><span>Route state</span><strong><i className={submitted ? "status-dot" : "waiting-dot"} /> {submitted ? "Ready for review" : "Awaiting signature"}</strong></div></div>
        </section>

        <section className={reShield ? "reshield-card app-solid-panel enabled" : "reshield-card app-solid-panel"}>
          <div className="panel-topline"><span className="mini-label">02 · Optional continuation</span><span className={reShield ? "state-chip success" : "state-chip"}>{reShield ? "Included" : "Optional"}</span></div>
          <div className="panel-title-row"><div className="panel-icon lens-icon"><Shield size={19} /></div><div><h2>Re-shield after withdrawal.</h2><p>Once funds land at your fresh destination, start a separate pool route to complete the circular privacy flow.</p></div></div>
          <button className={reShield ? "toggle-choice active" : "toggle-choice"} onClick={() => setReShield((enabled) => !enabled)}><span><i /></span>{reShield ? "Re-shield option added" : "Add re-shield option"}</button>
        </section>

        <section className="hackathon-tracker app-glass-panel">
          <div className="tracker-head"><div><span className="mini-label">STRK20 submission tracker</span><h2>Pool-route record</h2></div><span className="tracker-count">0 <small>/ 3 required</small></span></div>
          <div className="tracker-progress"><span /></div>
          <div className="tracker-copy"><p>Confirmed mainnet pool transactions appear here and are exported in the project tracker once real routes are complete.</p><button className="app-secondary-button" disabled><Download size={16} /> Download strk20.json</button></div>
        </section>
      </div>
    </AppShell>
  );
}
