/**
 * Blindside visual reminder: The account dashboard preserves the Extended boundary—clear
 * collateral and route state in Blindside, then a direct handoff to trade in Extended.
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleDollarSign, Download, ExternalLink, Plus, WalletMinimal } from "lucide-react";
import { useState } from "react";

const positions = [
  { market: "ETH-USD", side: "LONG", size: "1.20 ETH", entry: "$3,126.50", mark: "$3,184.20", pnl: "+69.24", leverage: "3.0×" },
  { market: "BTC-USD", side: "SHORT", size: "0.08 BTC", entry: "$106,322.00", mark: "$105,910.50", pnl: "+32.92", leverage: "2.0×" },
  { market: "STRK-USD", side: "LONG", size: "4,250 STRK", entry: "$0.1824", mark: "$0.1798", pnl: "-11.05", leverage: "2.5×" },
];

export default function Trade() {
  const [preview, setPreview] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);

  return (
    <AppShell active="trade" eyebrow="Extended account · step 03" title="Your margin is separate. Your trading stays normal." description="Blindside shows the funding route and account context. Open positions, leverage, and order execution remain in Extended’s native trading experience.">
      {!preview && <section className="app-empty-connection app-glass-panel"><div className="empty-connection-icon"><CircleDollarSign size={22} /></div><div><p className="eyebrow"><span className="eyebrow-dot" /> Account connection required</p><h2>Connect an Extended API session to populate account data.</h2><p>Until a session is connected, Blindside leaves your positions and balance untouched. Use the interface preview to inspect the account layout.</p></div><button className="app-primary-button" onClick={() => setPreview(true)}>Open interface preview <ArrowRight size={16} /></button></section>}

      <section className={preview ? "account-overview preview-mode" : "account-overview"}>
        {preview && <div className="preview-banner"><span className="status-dot" /> Preview data only — no live account or position data is shown.</div>}
        <div className="collateral-strip"><div className="collateral-title"><span className="mini-label">Collateral</span><strong>{preview ? "$2,450.00" : "—"} <small>USDC</small></strong><p>{preview ? "Available in Extended margin account" : "Connect an API session to view balance"}</p></div><div className="collateral-metrics"><div><span>Pending deposits</span><strong>{preview ? "$0.00" : "—"}</strong></div><div><span>Pending withdrawals</span><strong>{preview ? "$0.00" : "—"}</strong></div><div><span>Margin utilization</span><strong>{preview ? "22.8%" : "—"}</strong></div></div></div>
        <div className="account-actions"><a href="https://app.extended.exchange" target="_blank" rel="noreferrer" className="app-secondary-button">Go to trade on Extended <ExternalLink size={16} /></a><a href="/app/withdraw" className="app-primary-button">Withdraw margin <ArrowUpRight size={16} /></a></div>
      </section>

      <section className="positions-panel app-solid-panel"><div className="positions-header"><div><span className="mini-label">Open positions</span><h2>Positions in Extended</h2></div><div><span className={preview ? "state-chip success" : "state-chip"}>{preview ? "Preview refreshed" : "Awaiting API session"}</span><button className="table-action" onClick={() => setPreview((current) => !current)}>{preview ? "Clear preview" : "Load preview"}</button></div></div>
        {preview ? <div className="positions-table"><div className="positions-row positions-table-head"><span>Market</span><span>Side</span><span>Size</span><span>Entry</span><span>Mark</span><span>Unrealized PnL</span><span>Leverage</span></div>{positions.map((position) => <div className="positions-row" key={position.market}><strong>{position.market}</strong><span className={position.side === "LONG" ? "side-pill long" : "side-pill short"}>{position.side}</span><span>{position.size}</span><span>{position.entry}</span><span>{position.mark}</span><b className={position.pnl.startsWith("+") ? "pnl-positive" : "pnl-negative"}>{position.pnl} USDC</b><span>{position.leverage}</span></div>)}</div> : <div className="positions-empty"><BarChart3 size={25} /><h3>No position data connected.</h3><p>Once the Extended API session is active, this table will update on the configured account-refresh interval.</p></div>}
      </section>

      <section className="asset-history app-glass-panel"><div className="asset-history-head"><div><span className="mini-label">Asset operations</span><h2>Route-aware transfer history</h2></div><button className="table-action" onClick={() => setAssetOpen((open) => !open)}>{assetOpen ? "Hide history" : "View history"} <ChevronDown size={15} /></button></div>{assetOpen ? <div className="asset-history-list">{["STRK20 pool route prepared", "Fresh stealth account generated", "Extended bridge awaiting deposit"].map((item, index) => <div key={item}><span className={index < 2 ? "history-check done" : "history-check"}>{index < 2 ? <Check size={13} /> : "03"}</span><strong>{item}</strong><small>{index < 2 ? "Local route state" : "No API session connected"}</small></div>)}</div> : <p className="asset-history-empty">Open the route history to review confirmed Blindside states. Extended asset operations appear after the session API is connected.</p>}</section>
    </AppShell>
  );
}
