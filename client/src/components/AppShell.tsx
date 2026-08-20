/**
 * Blindside visual reminder: Liquid Obsidian keeps navigation and route context glass-like,
 * while financial decisions live on stable graphite surfaces.
 */
import { ArrowUpRight, CircleHelp, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type AppRoute = "shield" | "fund" | "trade" | "withdraw";

const routeItems: { id: AppRoute; label: string; href: string; note: string }[] = [
  { id: "shield", label: "Shield & stealth", href: "/app/shield", note: "Private entry" },
  { id: "fund", label: "Fund Extended", href: "/app/fund", note: "Bridge funding" },
  { id: "trade", label: "Account", href: "/app/trade", note: "Collateral & positions" },
  { id: "withdraw", label: "Withdraw", href: "/app/withdraw", note: "Private exit" },
];

export function AppShell({ active, children, eyebrow, title, description }: { active: AppRoute; children: ReactNode; eyebrow: string; title: string; description: string }) {
  const activeIndex = routeItems.findIndex((item) => item.id === active);

  return (
    <main className="app-shell">
      <header className="app-header glass-shell">
        <a className="brand" href="/"><img src="/manus-storage/blindside-mark_2ece01de.png" alt="" /><span>blindside</span></a>
        <div className="app-header-route"><span className="status-dot" /> Shielded account <span className="app-header-separator" /> Starknet mainnet</div>
        <div className="app-header-actions"><a href="/#architecture" className="app-help"><CircleHelp size={15} /> Help</a><a href="/" className="app-exit">Exit app <ArrowUpRight size={14} /></a></div>
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="app-sidebar-label"><span>Route</span><span>{String(activeIndex + 1).padStart(2, "0")} / 04</span></div>
          <nav className="app-route-nav" aria-label="Application route">
            {routeItems.map((item, index) => (
              <a key={item.id} href={item.href} className={item.id === active ? "app-route-link active" : index < activeIndex ? "app-route-link complete" : "app-route-link"}>
                <span className="app-route-index">{index < activeIndex ? <ShieldCheck size={13} /> : `0${index + 1}`}</span>
                <span><strong>{item.label}</strong><small>{item.id === active ? "Current step" : item.note}</small></span>
              </a>
            ))}
          </nav>
          <div className="app-sidebar-trust glass-shell"><span className="mini-label">System state</span><strong><i className="status-dot" /> Route ready</strong><p>Blindside separates funding and withdrawal edges. Extended remains your trading venue.</p></div>
        </aside>

        <section className="app-main">
          <div className="app-mobile-route glass-shell"><span>0{activeIndex + 1} / 04</span><strong>{routeItems[activeIndex].label}</strong><span className="status-dot" /></div>
          <div className="app-route-field" aria-hidden="true">
            <span className="route-field-label route-field-source">MAIN WALLET</span>
            <span className="route-field-label route-field-fresh">FRESH ADDRESS</span>
            <span className="route-field-label route-field-extended">EXTENDED</span>
            <div className="route-field-line route-field-line-one" />
            <div className="route-field-line route-field-line-two" />
            <div className="route-field-lens"><span>BLINDSIDE</span></div>
            <span className="route-field-marker marker-source" />
            <span className="route-field-marker marker-fresh" />
            <span className="route-field-marker marker-extended" />
          </div>
          <div className="app-page-heading">
            <p className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="app-status-island glass-shell"><span className="status-dot" /><span>Private route</span><strong>0{activeIndex + 1} · {routeItems[activeIndex].label}</strong><i /></div>
          {children}
        </section>
      </div>
    </main>
  );
}
