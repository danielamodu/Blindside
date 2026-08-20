/**
 * Blindside visual reminder: the Liquid Obsidian page uses a floating glass control layer,
 * a stable graphite transaction console, and one acid-lime route signal for active state.
 */
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Menu,
  MoveRight,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RoutePhase = 0 | 1 | 2 | 3;

const routePhases = [
  { eyebrow: "Step 1 of 4", label: "Prepare route", detail: "Choose a USDC amount from your connected wallet." },
  { eyebrow: "Step 2 of 4", label: "Review shield", detail: "Confirm the amount, network, pool, and funding route." },
  { eyebrow: "Step 3 of 4", label: "Funding Extended", detail: "Blindside is routing through a fresh address." },
  { eyebrow: "Step 4 of 4", label: "Extended ready", detail: "Your funded perps account is ready to trade." },
];

const architecture = [
  "User  →  shield USDC (STRK20 pool)",
  "     →  unshield to a fresh stealth address",
  "     →  fund Extended account (bridgeStakeAddress deposit)",
  "     →  trade normally via Extended's existing UI/API (untouched)",
  "     →  withdraw to a fresh address",
  "     →  optional: re-shield back into the pool",
];

export default function Home() {
  const [phase, setPhase] = useState<RoutePhase>(0);
  const [amount, setAmount] = useState("500");
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [extendedOpen, setExtendedOpen] = useState(false);

  const current = routePhases[phase];
  const routeAmount = useMemo(() => {
    const value = Number(amount.replace(/,/g, ""));
    return Number.isFinite(value) && value > 0 ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0";
  }, [amount]);

  useEffect(() => {
    if (phase !== 2) return;
    const timer = window.setTimeout(() => setPhase(3), 1250);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const startRoute = () => {
    document.getElementById("route-console")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const launchShieldedApp = () => {
    window.location.href = "/app/shield";
  };

  const advanceRoute = () => {
    if (phase === 0) setPhase(1);
    if (phase === 1) setPhase(2);
    if (phase === 3) setExtendedOpen(true);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText("0x9c81...dA41");
    } catch {
      // The visual feedback still makes the action legible in environments without clipboard permission.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const actionLabel = phase === 0 ? "Review shield" : phase === 1 ? `Shield ${routeAmount} USDC` : phase === 2 ? "Funding Extended" : "Open Extended";

  return (
    <main className="blindside-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="topography" />

      <header className="site-header glass-shell">
        <a className="brand" href="#top" aria-label="Blindside home">
          <img src="/manus-storage/blindside-mark_2ece01de.png" alt="" />
          <span>blindside</span>
        </a>
        <nav className={menuOpen ? "main-nav mobile-open" : "main-nav"} aria-label="Primary navigation">
          <a href="#flow">How it works</a>
          <a href="#architecture">Architecture</a>
          <a href="#verify">Verify</a>
        </nav>
        <div className="header-actions">
          <button className="route-status" onClick={startRoute}>
            <span className="status-dot" />
            Route ready
          </button>
          <Button className="header-cta" onClick={launchShieldedApp}>
            Shield USDC <ArrowUpRight size={15} />
          </Button>
          <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Private funding route for Extended perps</p>
          <h1>Trade on Extended.<br /><em>Keep the rest separate.</em></h1>
          <p className="hero-lede">Blindside funds and withdraws an Extended perps account without connecting your trading identity to the rest of your on-chain activity.</p>
          <div className="hero-actions">
            <Button className="primary-action" onClick={launchShieldedApp}>Launch shielded app <ArrowRight size={17} /></Button>
            <button className="secondary-action" onClick={() => document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" })}>View the flow <ChevronRight size={16} /></button>
          </div>
          <div className="hero-proof" aria-label="Product capabilities">
            <span>Non-custodial route</span>
            <span>Fresh addresses</span>
            <span>Extended-compatible</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <img src="/manus-storage/blindside-hero-lens_3a9eaf65.png" alt="" />
          <div className="visual-caption caption-top"><span className="caption-dot" /> ROUTE ACTIVE</div>
          <div className="visual-caption caption-bottom">FRESH DESTINATION <MoveRight size={14} /></div>
        </div>

        <div className="hero-floor">
          <span>01</span>
          <span>Private route, visible state.</span>
          <span>Blindside / Extended</span>
        </div>
      </section>

      <section className="console-section" id="route-console">
        <div className="section-kicker"><span>Route console</span><span>LIVE PROTOTYPE</span></div>
        <div className="console-layout">
          <aside className="route-side glass-shell">
            <div className="route-side-top">
              <span className="mini-label">Current route</span>
              <span className="route-state-pill"><span className={phase === 3 ? "status-dot done" : "status-dot"} /> {phase === 3 ? "Funded" : "In progress"}</span>
            </div>
            <div className="route-steps">
              {routePhases.map((item, index) => (
                <button className={index === phase ? "route-step active" : index < phase ? "route-step completed" : "route-step"} key={item.label} onClick={() => index <= phase && setPhase(index as RoutePhase)}>
                  <span className="step-index">{index < phase ? <Check size={13} /> : `0${index + 1}`}</span>
                  <span><strong>{item.label}</strong><small>{index === phase ? item.detail : index < phase ? "Confirmed" : "Next"}</small></span>
                </button>
              ))}
            </div>
            <button className="quiet-link" onClick={() => setDetailsOpen((open) => !open)}>{detailsOpen ? "Hide route details" : "View route details"} <ChevronRight size={15} /></button>
          </aside>

          <section className="transaction-console">
            <div className="status-island glass-shell">
              <span className="island-pulse" />
              <span>{current.eyebrow}</span>
              <strong>{current.label}</strong>
            </div>
            <div className="console-head">
              <div>
                <p className="eyebrow"><span className="eyebrow-dot" /> Blindside route</p>
                <h2>{phase === 3 ? "Extended is ready." : phase === 2 ? "Funding your account." : phase === 1 ? "Check the route." : "Choose what to shield."}</h2>
              </div>
              <div className="wallet-chip glass-shell"><Wallet size={15} /> 0x7A2e...e81B</div>
            </div>

            <div className="solid-console">
              {phase < 3 ? (
                <>
                  <div className="console-row amount-row">
                    <div>
                      <label htmlFor="amount">Amount to shield</label>
                      <div className="amount-input-wrap">
                        <input id="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} aria-label="USDC amount" />
                        <span>USDC</span>
                      </div>
                      <p>Available <b>1,284.32 USDC</b> <button onClick={() => setAmount("1284.32")}>Max</button></p>
                    </div>
                    <div className="amount-art"><span>$</span><b>{routeAmount}</b></div>
                  </div>

                  <div className="route-canvas" aria-label="Funding route visualization">
                    <div className="route-node source"><span className="node-icon"><Wallet size={15} /></span><div><small>Source</small><strong>Your wallet</strong></div></div>
                    <div className="route-line line-one" /><div className="route-line line-two" />
                    <div className="privacy-lens"><span>BLINDSIDE</span></div>
                    <div className="route-node fresh"><span className="node-icon signal"><Sparkles size={15} /></span><div><small>Destination</small><strong>Fresh address</strong></div></div>
                    <div className="route-line line-three" />
                    <div className="route-node extended"><span className="node-icon extended-icon">E</span><div><small>Handoff</small><strong>Extended</strong></div></div>
                  </div>

                  <div className="data-grid">
                    <div><span>Network</span><strong>Starknet</strong></div>
                    <div><span>Shield pool</span><strong>STRK20</strong></div>
                    <div><span>Route fee</span><strong>0.42 USDC</strong></div>
                  </div>
                </>
              ) : (
                <div className="funded-state">
                  <div className="funded-orb"><Check size={26} /></div>
                  <p className="eyebrow"><span className="eyebrow-dot" /> Route complete</p>
                  <h3>Your Extended perps account is funded.</h3>
                  <p>{routeAmount} USDC is ready at a fresh Extended funding destination. Trading now happens in Extended’s existing UI/API.</p>
                  <div className="funded-receipt"><span>Fresh destination</span><b>0x9c81...dA41</b><button onClick={copyAddress}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button></div>
                  {extendedOpen && <div className="prototype-notice"><Check size={15} /> Extended handoff opened in prototype mode.</div>}
                </div>
              )}

              {phase === 1 && <div className="review-note"><Check size={15} /> You are approving a new private route, not a trading order.</div>}
              {phase === 2 && <div className="routing-note"><span className="route-loader" /> Waiting for the funding route to confirm. You can safely leave this screen.</div>}

              <div className="console-actions">
                {phase > 0 && phase < 3 ? <button className="back-action" onClick={() => setPhase((phase - 1) as RoutePhase)}>Back</button> : <span />}
                <Button className="route-primary" disabled={phase === 2 || Number(amount) <= 0} onClick={advanceRoute}>{actionLabel} {phase === 3 ? <ExternalLink size={16} /> : <ArrowRight size={16} />}</Button>
              </div>
            </div>
          </section>
        </div>

        {detailsOpen && (
          <div className="route-detail-drawer glass-shell">
            <div><span className="mini-label">Route details</span><strong>One route. Two product surfaces.</strong></div>
            <p>Blindside owns shielding, fresh-address generation, and withdrawal routing. Extended remains the normal trading interface once funding is complete.</p>
            <button onClick={() => setDetailsOpen(false)}>Close <ChevronRight size={15} /></button>
          </div>
        )}
      </section>

      <section className="flow-section" id="flow">
        <div className="section-heading">
          <p className="eyebrow"><span className="eyebrow-dot" /> The route, at a glance</p>
          <h2>One clean transition.<br />No new trading terminal.</h2>
          <p>Blindside handles the private entry and exit. Extended stays untouched for the part you already know: trading.</p>
        </div>
        <div className="flow-grid">
          <article className="flow-card flow-card-primary"><span className="flow-number">01</span><div className="flow-icon source-icon"><Wallet size={19} /></div><h3>Shield</h3><p>Send USDC into the pool from your connected wallet.</p><span className="flow-caption">Your wallet → STRK20 pool</span></article>
          <article className="flow-card flow-card-lens"><span className="flow-number">02</span><div className="small-lens"><span /></div><h3>Route</h3><p>Unshield to a fresh stealth address, then fund Extended.</p><span className="flow-caption">Fresh address → Extended</span></article>
          <article className="flow-card flow-card-extended"><span className="flow-number">03</span><div className="extended-mark">E</div><h3>Trade</h3><p>Trade normally via Extended’s existing UI or API.</p><span className="flow-caption">Extended stays untouched</span></article>
          <article className="flow-card flow-card-withdraw"><span className="flow-number">04</span><div className="withdraw-icon"><ArrowDown size={20} /></div><h3>Withdraw</h3><p>Exit to a fresh destination, with an option to re-shield.</p><span className="flow-caption">Fresh address → optional pool</span></article>
        </div>
      </section>

      <section className="architecture-section" id="architecture">
        <div className="architecture-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Transparent by design</p>
          <h2>See the route.<br />Verify the boundary.</h2>
          <p>Blindside does not replace your trading venue. It provides a private route around the funding and withdrawal edges.</p>
          <a href="#verify">Verify the route <ArrowUpRight size={15} /></a>
        </div>
        <div className="architecture-visual">
          <img src="/manus-storage/blindside-verify-object_e0e1da24.png" alt="Abstract verification route" />
          <div className="architecture-card">
            <div className="architecture-card-head"><span>Architecture</span><button onClick={copyAddress} aria-label="Copy architecture route">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
            <pre>{architecture.join("\n")}</pre>
          </div>
        </div>
      </section>

      <section className="verify-section" id="verify">
        <div className="verify-text"><span className="verify-kicker">ON-CHAIN VERIFIED</span><h2>Private by route.<br />Clear by state.</h2><p>Every Blindside step is designed to leave a legible receipt without turning the product into a black box.</p></div>
        <div className="verify-stats glass-shell">
          <div><span>Route state</span><strong><i className="status-dot" /> Ready</strong></div>
          <div><span>Last update</span><strong>Just now</strong></div>
          <div><span>Network</span><strong>Starknet</strong></div>
          <button onClick={startRoute}>Open route <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="footer-cta" aria-labelledby="footer-cta-title">
        <div className="footer-cta-inner">
          <div className="footer-cta-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> The private way in</p>
            <h2 id="footer-cta-title">Your trading route<br /><em>starts separate.</em></h2>
            <p>Shield USDC, fund Extended through a fresh route, then trade normally. No new terminal. No unnecessary overlap.</p>
            <div className="footer-cta-actions">
              <Button className="footer-primary-action" onClick={launchShieldedApp}>Launch shielded app <ArrowRight size={17} /></Button>
              <button className="footer-route-control glass-shell" onClick={() => document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" })}><span className="status-dot" /> View route architecture <ArrowUpRight size={15} /></button>
            </div>
          </div>
          <div className="footer-art" aria-hidden="true">
            <div className="footer-art-orbit orbit-one" />
            <div className="footer-art-orbit orbit-two" />
            <div className="footer-art-route"><span /><i /><b /></div>
            <img src="/manus-storage/blindside-mark_2ece01de.png" alt="" />
            <span className="footer-art-label">ROUTE READY</span>
          </div>
          <div className="footer-cta-meta"><span>PRIVATE ROUTE</span><span>FRESH DESTINATION</span><span>EXTENDED READY</span></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <a className="brand footer-brand" href="#top"><img src="/manus-storage/blindside-mark_2ece01de.png" alt="" /><span>blindside</span></a>
            <p>Private funding routes for traders who want their Extended perps activity separated from the rest of their on-chain life.</p>
            <button className="footer-status" onClick={startRoute}><span className="status-dot" /> Route status: ready <ArrowUpRight size={13} /></button>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-nav-group"><span>Product</span><a href="#route-console">Shield USDC</a><a href="#flow">How it works</a><button onClick={() => setExtendedOpen(true)}>Open Extended</button></div>
            <div className="footer-nav-group"><span>Protocol</span><a href="#architecture">Architecture</a><a href="#verify">Verify route</a><a href="#architecture">Privacy model</a></div>
            <div className="footer-nav-group"><span>Resources</span><a href="#flow">Route guide</a><a href="#architecture">Technical notes</a><a href="#verify">System status</a></div>
            <div className="footer-nav-group"><span>Company</span><a href="mailto:hello@blindside.dev">Contact</a><a href="#top">Brand</a><a href="#top">Back to top</a></div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Blindside. Interface prototype.</span>
          <div><span>Built for Starknet</span><span>Private by route</span><span>All systems nominal <i className="status-dot" /></span></div>
        </div>
      </footer>
    </main>
  );
}
