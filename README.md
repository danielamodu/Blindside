# Blindside

A shielded margin-account layer for [Extended](https://extended.exchange) (a perps DEX settled on
Starknet mainnet), built for the [STRK20 Private Sprint](https://strk20.starknet.io/hackathon).

Blindside doesn't touch Extended's matching, margin, or liquidation logic — those stay exactly as
Extended built them, with real liquidity, unmodified. Blindside is purely a private funding and
exit layer on top: shield USDC into the STRK20 privacy pool, unshield to a fresh stealth Starknet
address, fund an Extended account from that address, trade normally in Extended's own UI, withdraw
to another fresh address, optionally re-shield.

## Flow

`/app/shield` → `/app/fund` → `/app/trade` → `/app/withdraw`, detailed per-route in
[product-map.md](product-map.md). Setup and local run instructions are in
[AGENT_SETUP.md](AGENT_SETUP.md).

## Privacy model — read this before trusting the product's privacy claims

Exact wording from the STRK20 sprint's own docs
([MAINNET-DAY-0.md](tmp_research/strk20-hackathon/docs/MAINNET-DAY-0.md)) — don't overclaim beyond
this:

| Public | Private |
| --- | --- |
| Deposits: your address, the token, the amount | Note-to-note transfers: amounts and parties |
| Withdrawal destination and amount | Which deposit a withdrawal came from |

Shielding a deposit is **not** private — your address, the token, and the amount are all visible
on-chain the moment you shield. What's private is that nobody can link a specific *withdrawal*
back to the specific *deposit* that funded it, which is the property Blindside's stealth-address
pattern depends on.

That property doesn't survive careless timing or amounts. Unshielding a distinctive amount and
funding Extended with it moments later is correlatable by amount and timing alone, with no
on-chain link required. Blindside does not yet add a delay or amount-jitter between the unshield
and the Extended funding step — treat this as a real gap, not a cosmetic one, if you're relying on
the product's privacy claim.

## Known limitation: Extended withdrawal signing is not implemented

`ExtendedClient.withdraw()` ([client/src/lib/extended.ts](client/src/lib/extended.ts)) throws
rather than submit a withdrawal. This is deliberate, not an oversight.

Extended's `/user/withdrawal` endpoint requires a StarkEx settlement signature — a specific hash
construction and ECDSA variant computed by StarkWare's `fast_stark_crypto` (see
`x10.signing.withdrawal_object.create_withdrawal_object` in the official
[x10xchange/python_sdk](https://github.com/x10xchange/python_sdk)) — not generic SNIP-12 typed
data. It needs the account's internal position/vault id, the collateral asset's StarkEx id, and
the exchange's Starknet domain separator, signed with a Stark-curve ECDSA variant that has to
match StarkEx's verification exactly.

We evaluated the only JS/WASM implementation we could find, the community-maintained
[`extended-typescript-sdk`](https://www.npmjs.com/package/extended-typescript-sdk) (not published
by Extended/x10xchange). Its message-hash construction looks like a faithful port and ships with
hardcoded parity test vectors against the reference implementation. Its signing step does not: the
crate's own source says so directly —

```rust
// KNOWN ISSUE: ecdsa_sign from starknet crate uses modified ECDSA algorithm
// that produces different s values than standard ECDSA (starknet_crypto::sign)
// ...
// The signatures will have correct r but different s values.
// This is a known limitation until we can replicate ecdsa_sign's exact algorithm.
```
— `wasm-signer/src/lib.rs`, lines 15-18 and 154-155.

A signature built this way will not verify against Extended's backend. Rather than ship a
withdrawal flow that produces a plausible-looking but incorrect signature against a real-money
endpoint, `withdraw()` throws with an explanation instead.

**Phase 1 workaround:** withdraw manually from Extended's own dashboard
([app.extended.exchange](https://app.extended.exchange)) using the stealth account you funded
through Blindside. Re-shielding the withdrawn funds back into the pool is still something you do
yourself, on your own schedule, for the same amount/timing-correlation reasons noted above.

## Integration status

See [AGENT_SETUP.md](AGENT_SETUP.md) for the full integration roadmap and design-system rules.
Shield/unshield (`client/src/lib/privacy.ts`) and Extended account/balance/positions reads
(`client/src/lib/extended.ts`) are wired against the real wallet and REST APIs, cited inline in
each file. Withdrawal signing is the one open integration seam, documented above.
