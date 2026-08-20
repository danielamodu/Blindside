# Blindside full product map

The product is organized as a route, not as a set of unrelated pages. The five surfaces are: the marketing landing page, shield and stealth setup, Extended funding, the trading account dashboard, and withdrawal/re-shield completion. Each application route should retain the same shell, active route status, wallet context, and a compact path back to the next valid step.

| Route | Core user job | Live context carried into the page | Primary completion state |
| --- | --- | --- | --- |
| `/` | Understand Blindside and launch the route | Route-ready status | Launch shielded app |
| `/app/shield` | Connect a wallet, shield USDC, create and confirm the stealth key, unshield to it | Wallet, USDC amount, shield state, stealth-address state | Stealth address funded |
| `/app/fund` | Initialize the Extended account and send USDC through the bridge address | Stealth address, API-key connection state, bridge address, funding monitor | Extended funded |
| `/app/trade` | Check collateral, open positions, transfer activity, and move into Extended to trade | Extended account status, balance, positions, pending transfers | Trade or begin withdrawal |
| `/app/withdraw` | Create a signed withdrawal, choose a fresh destination, optionally re-shield, export tracker data | Withdrawable margin, destination, withdrawal state, recorded pool-route count | Withdrawal confirmed / optional re-shield complete |

## Integration boundary

The first product expansion implements the complete responsive user interface, navigation, persistence of non-sensitive prototype flow state in the browser, careful key-backup warnings, and explicit empty/unconnected states. It does **not** claim to send a live financial transaction or validate a real Extended API key until wallet support, client-side signing, API connectivity, and secure handling are configured and tested.

The architecture requires three future integration seams: a Starknet wallet adapter for `starknet_shield` and `starknet_unshield`, a browser-session Extended API client for account/balance/positions/asset-operation reads, and an explicitly reviewed client-side SNIP12 signing flow for withdrawal. These seams must show a disconnected or not-yet-validated state until a user has actually connected and authorized them.
