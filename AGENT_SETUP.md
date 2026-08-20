# Blindside — Agent Setup Guide

Blindside is a static React 19 + TypeScript + Vite interface prototype for a shielded Extended perps account workflow on Starknet. The current source implements the complete five-page product experience in the **Liquid Obsidian** design system.

> **Current implementation boundary:** The interface is interactive, but it intentionally does not send Starknet transactions, validate Extended API keys, store private keys, or submit withdrawals. The pages clearly label this prototype state. Add and test those integrations before treating the project as a live financial application.

## Requirements

| Requirement | Recommended version |
| --- | --- |
| Node.js | 22.x or newer |
| pnpm | 10.x |
| Browser | Current Chromium, Chrome, Firefox, or Safari |

## Install and run

Clone the private repository, change into the project directory, and install the lockfile-pinned dependencies.

```bash
git clone <YOUR_PRIVATE_REPOSITORY_URL>
cd blindside-ui
pnpm install --frozen-lockfile
pnpm dev
```

Vite will print a local development URL, typically `http://localhost:3000`. Run the type check before making a handoff or opening a pull request.

```bash
pnpm check
pnpm build
pnpm start
```

## Application routes

| Path | Surface | Current scope |
| --- | --- | --- |
| `/` | Landing page | Marketing narrative, interactive route console, architecture, and closing conversion/footer |
| `/app/shield` | Shield & Stealth | Wallet state, USDC shield review, fresh stealth key backup, and unshield route states |
| `/app/fund` | Fund Extended | Stealth import guide, visual API session state, bridge address, and deposit-monitor layout |
| `/app/trade` | Account dashboard | Collateral, open positions, transfer-history state, and Extended handoff |
| `/app/withdraw` | Withdraw & Re-shield | Client-side signing review, fresh destination, re-shield option, and STRK20 tracker layout |

## Design system rules

Blindside follows **Liquid Obsidian**. The shared route field, privacy lens, acid-lime signal, status island, and graphite transaction surfaces are intentional product constraints:

1. Use glass only for navigation, status, and contextual controls.
2. Keep amounts, addresses, balances, API credentials, and signing/review data on stable graphite surfaces.
3. Preserve the privacy lens wherever the product explains shielding, fresh address generation, route handoff, or clean withdrawal.
4. Use `#D8FF3E` only for active route state, confirmation, and the primary action.

Design context and original reference notes live in `ideas.md`, `blindside-design-brief.md`, `blindside-core-flow.md`, and `product-map.md`.

## Assets

The current UI uses project-managed image URLs such as `/manus-storage/blindside-mark_2ece01de.png`. They resolve in the current managed project environment. If you run the source elsewhere, upload equivalent assets to the target host or update the image URLs in `client/src/pages/Home.tsx` and `client/src/components/AppShell.tsx`.

The key brand assets are the aperture mark, the hero privacy lens, the low-contrast route-topography background, and the verification object. Their original generation paths are recorded in the project’s delivery history.

## Integration roadmap

The UI already exposes intentional integration seams. Implement them in this order:

| Capability | Required change | Important constraint |
| --- | --- | --- |
| Starknet wallet | Add wallet discovery/connection and call the supported shield/unshield methods | Never present a simulated confirmation as a confirmed on-chain transaction |
| Stealth key generation | Generate a Stark keypair locally through audited client-side code | Do not store or transmit a private key; require explicit backup confirmation |
| Extended API session | Add API-key validation, session-only storage, and account/balance/positions requests | Use a server-side proxy if the target API requires a protected credential or blocks browser CORS |
| Deposit monitor | Poll asset operations only after a verified session exists | Show timestamps and last-confirmed state; do not use an indeterminate loader as proof of settlement |
| Withdrawal | Implement auditable client-side SNIP12 signing and post the signed request | Treat key handling and destination review as security-critical; add explicit confirmation and recovery states |
| STRK20 export | Generate `strk20.json` from confirmed pool receipt records only | Never fabricate transaction hashes or eligibility state |

## Useful project files

```text
client/src/App.tsx                 # Route registration
client/src/components/AppShell.tsx # Shared route field, shell, and status island
client/src/pages/Home.tsx          # Landing page
client/src/pages/Shield.tsx        # Shield & Stealth flow
client/src/pages/Fund.tsx          # Extended funding flow
client/src/pages/Trade.tsx         # Account dashboard
client/src/pages/Withdraw.tsx      # Withdrawal and re-shield flow
client/src/index.css               # Global Liquid Obsidian style system and responsiveness
ideas.md                           # Chosen design direction
product-map.md                     # Product IA and integration boundaries
```

## Agent handoff checklist

An agent taking over this codebase should install dependencies, run `pnpm check`, inspect the five application routes at desktop and mobile widths, and preserve the existing privacy route hierarchy before making visual changes. Before enabling real financial actions, implement testnet-only wallet/API flows, formal key-handling review, runtime validation, user-facing error states, and end-to-end transaction testing.
