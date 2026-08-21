/**
 * Blindside Trade Page — Integrated with Extended Account Balance, Open Positions & Real-Time Refresh
 */
import { AppShell } from "@/components/AppShell";
import { ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleDollarSign, ExternalLink, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getExtendedClient, fmtUsdc } from "@/lib/extended";
import type { ExtendedBalance, ExtendedPosition, AssetOperation } from "@/lib/extended";

export default function Trade() {
  const [balance, setBalance] = useState<ExtendedBalance | null>(null);
  const [positions, setPositions] = useState<ExtendedPosition[]>([]);
  const [operations, setOperations] = useState<AssetOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const client = getExtendedClient();
    if (!client) {
      setIsConnected(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [bal, pos, ops] = await Promise.all([
        client.getBalance(),
        client.getPositions(),
        client.getAssetOperations(10),
      ]);
      setBalance(bal);
      setPositions(pos);
      setOperations(ops);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10_000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <AppShell
      active="trade"
      eyebrow="Extended account · step 03"
      title="Your margin is separate. Your trading stays normal."
      description="Blindside shows the funding route and account context. Open positions, leverage, and order execution remain in Extended’s native trading experience."
    >
      {!isConnected && (
        <section className="app-empty-connection app-glass-panel">
          <div className="empty-connection-icon"><CircleDollarSign size={22} /></div>
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Account connection required</p>
            <h2>Connect an Extended API session to populate live account data.</h2>
            <p>Go to the Extended handoff step to enter your API session key.</p>
          </div>
          <a href="/app/fund" className="app-primary-button">
            Go to Extended handoff <ArrowRight size={16} />
          </a>
        </section>
      )}

      <section className="account-overview">
        <div className="collateral-strip">
          <div className="collateral-title">
            <span className="mini-label">Collateral balance</span>
            <strong>{isConnected ? fmtUsdc(balance?.balance) : "—"} <small>USDC</small></strong>
            <p>{isConnected ? "Available margin on Extended" : "Connect an API session to view balance"}</p>
          </div>
          <div className="collateral-metrics">
            <div>
              <span>Available to trade</span>
              <strong>{isConnected ? `${fmtUsdc(balance?.availableForTrade)} USDC` : "—"}</strong>
            </div>
            <div>
              <span>Available to withdraw</span>
              <strong>{isConnected ? `${fmtUsdc(balance?.availableForWithdrawal)} USDC` : "—"}</strong>
            </div>
            <div>
              <span>Open positions</span>
              <strong>{isConnected ? `${positions.length} active` : "—"}</strong>
            </div>
          </div>
        </div>
        <div className="account-actions">
          <button className="app-secondary-button" onClick={fetchDashboardData} disabled={isLoading || !isConnected}>
            <RefreshCw size={15} className={isLoading ? "spin" : ""} /> Refresh data
          </button>
          <a href="https://app.extended.exchange" target="_blank" rel="noreferrer" className="app-secondary-button">
            Trade on Extended <ExternalLink size={16} />
          </a>
          <a href="/app/withdraw" className="app-primary-button">
            Withdraw margin <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {error && <div className="app-notice text-red">{error}</div>}

      <section className="positions-panel app-solid-panel">
        <div className="positions-header">
          <div>
            <span className="mini-label">Open positions</span>
            <h2>Positions in Extended</h2>
          </div>
          <span className={isConnected ? "state-chip success" : "state-chip"}>
            {isConnected ? "Live API active" : "Awaiting API session"}
          </span>
        </div>

        {positions.length > 0 ? (
          <div className="positions-table">
            <div className="positions-row positions-table-head">
              <span>Market</span>
              <span>Side</span>
              <span>Size</span>
              <span>Entry</span>
              <span>Mark</span>
              <span>Unrealized PnL</span>
              <span>Leverage</span>
            </div>
            {positions.map((pos, idx) => {
              const pnl = parseFloat(pos.unrealisedPnl);
              return (
                <div className="positions-row" key={idx}>
                  <strong>{pos.market}</strong>
                  <span className={pos.side === "LONG" ? "side-pill long" : "side-pill short"}>{pos.side}</span>
                  <span>{pos.size}</span>
                  <span>${parseFloat(pos.openPrice).toFixed(2)}</span>
                  <span>${parseFloat(pos.markPrice).toFixed(2)}</span>
                  <b className={pnl >= 0 ? "pnl-positive" : "pnl-negative"}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDC
                  </b>
                  <span>{pos.leverage}×</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="positions-empty">
            <BarChart3 size={25} />
            <h3>No open positions.</h3>
            <p>{isConnected ? "Open positions on Extended to view them here in real-time." : "Connect an API session to load your perpetual positions."}</p>
          </div>
        )}
      </section>

      <section className="asset-history app-glass-panel">
        <div className="asset-history-head">
          <div>
            <span className="mini-label">Asset operations</span>
            <h2>Route-aware transfer history</h2>
          </div>
          <button className="table-action" onClick={() => setAssetOpen((open) => !open)}>
            {assetOpen ? "Hide history" : "View history"} <ChevronDown size={15} />
          </button>
        </div>
        {assetOpen && (
          <div className="asset-history-list">
            {operations.length > 0 ? (
              operations.map((op) => (
                <div key={op.id}>
                  <span className="history-check done"><Check size={13} /></span>
                  <strong>{op.type} — {fmtUsdc(op.amount)} USDC</strong>
                  <small>Status: {op.status}</small>
                </div>
              ))
            ) : (
              <p className="asset-history-empty">No asset operations recorded yet.</p>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}
