# Blindside UI — Design Direction

## Three stylistic approaches

### Approach 1

**Theme Name:** Liquid Obsidian  
**Very Brief Intro:** An Apple-inspired dark material system where translucent controls float over a precise graphite transaction surface. The feeling is composed, private, and tactile—not flashy.  
**Probability:** 0.037

### Approach 2

**Theme Name:** Signal Chamber  
**Very Brief Intro:** A bright mineral-white finance interface with one high-voltage green route signal and deep black technical insets. It treats privacy as a calm, institutional capability rather than a dark mystery.  
**Probability:** 0.082

### Approach 3

**Theme Name:** Quiet Terminal  
**Very Brief Intro:** A near-monochrome editorial shell that uses condensed typography, strict alignment, and terminal-like technical cards to make the product feel selective and engineering-led.  
**Probability:** 0.054

---

# Selected direction: Liquid Obsidian

## Design movement

**Liquid Obsidian** combines Apple Liquid Glass principles with high-end financial instrument design. It uses glass only as a functional overlay for navigation, route state, and contextual controls. Amounts, addresses, network, fees, and transaction review remain on stable graphite surfaces.

## Core principles

1. **A clear boundary between control and content.** Glass floats above the route; the route itself stays crisp.
2. **One active financial decision at a time.** The central panel always expresses the next action in precise language.
3. **Privacy is demonstrated through state, not spectacle.** The route, fresh-address marker, handoff, and receipts do the explaining.
4. **Motion shows responsibility moving between systems.** The Blindside-to-Extended handoff is a deliberate, legible transition.

## Color philosophy

The canvas is ink-black and graphite so the interface feels private, grounded, and low-noise. Glass is almost colorless by default, picking up the atmosphere behind it. A single acid-lime signal identifies active route state, decisive action, and verified completion; it is never used as decoration. Warm off-white prevents the experience from becoming cold or cyberpunk.

## Layout paradigm

The desktop interface uses a **route field** rather than a centered card stack. A translucent top control layer floats above a split main field: the left side is a quiet narrative and route visual, while the right side is a stable transaction console. A detached status island bridges the two surfaces. On mobile, the status island becomes a persistent top strip and the route visual collapses into an expandable path.

## Signature elements

1. **The privacy lens:** a translucent oval/capsule that occludes one segment of the route before revealing a fresh destination.
2. **The status island:** a small floating glass control that remains spatially consistent through every route state.
3. **The handoff line:** a thin signal path that exits Blindside and terminates in an Extended badge once funding completes.

## Interaction philosophy

Interaction is direct, predictable, and lightly physical. A control brightens and settles; it does not bounce. The most important visual state appears before a user acts, not after. Clicking a flow step updates the workspace but leaves the route and prior confirmed states visible.

## Animation

The hero route makes one 700ms reveal on first load: the line enters the privacy lens, disappears briefly, then emerges at a fresh-address marker. Step changes take 220–360ms with opacity and transform only. A current state has a quiet pulse, but no infinite decorative movement occurs during a pending transaction. Reduced-motion users receive instant state changes.

## Typography system

**Instrument Sans** supplies the display and interface voice: broad, contemporary, and controlled. **Geist Mono** handles addresses, labels, timestamp-like details, and the architecture card. Hero display uses large, tight tracking; technical labels use tiny uppercase mono with generous letter spacing; body copy remains warm white with softened gray support text.

## Brand essence

**Blindside is the private funding route for traders who want their Extended perps activity separated from the rest of their on-chain life.**

Personality: **Composed, lucid, exact.**

## Brand voice

Headlines are declarative and spare. Calls to action name the real operation. Microcopy explains the system boundary without making exaggerated privacy claims.

Example headline: **Trade on Extended. Keep the rest separate.**

Example CTA: **Shield 500 USDC**

## Wordmark and logo

The mark is an abstract offset aperture: two stacked rounded rectangles with a narrow occluded passage through the center. It suggests a blind spot, routing, and controlled separation without relying on shields, masks, locks, or crypto iconography. The wordmark is set in a custom-looking wide grotesk with close tracking, while the mark remains usable alone as a favicon.

## Signature brand color

**Blindside Signal — #D8FF3E.** A sharp acid-lime used only when the route is active, ready, or confirmed.

## Style Decisions

- The route field is visible in every primary application state: a Blindside Signal path, privacy lens, fresh-address marker, or Extended handoff occupies the main composition beside the current task.
- Glass is reserved for navigation, status, and contextual controls. Amounts, addresses, balances, credentials, and signing actions live on solid graphite instrument surfaces.
- The privacy lens is Blindside’s primary signature motif. It recurs when the product explains concealment, fresh destination generation, route handoff, and withdrawal separation.
