# Mobile delivery app design

_Started 2026-09-03 03:23 UTC_

---

## User

Design a mobile app for delivery service

## Assistant



## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: ask_user]_

Form's up — waiting on what you're delivering, whose app it is, and which screens to build.

## User

Answered — Asked Claude to decide; what_delivered: Parcels & packages (courier); who_uses: Both; screens: Onboarding / address setup, Home / browse, Search + filters, Item detail, Cart & checkout, Live tracking map, Order history, Courier job list, Courier delivery flow, Profile / settings, Support chat; code_source: Deeliva; platform: iOS; variations: Home / browse layout, Tracking screen treatment, Checkout flow, Navigation pattern (tabs vs. other); tone: Plain & friendly; depth: Full working state

## Assistant

_[tool: list_files]_

_[tool: copy_starter_component]_

_[tool: tool_search_tool_bm25]_

_[tool: tool_search_tool_bm25]_

_[tool: read_file]_

_[tool: grep]_

Codebase folder isn't reachable from my tools, so I'm building on the Industry system + your brief. Writing the prototype now.

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Built as one working prototype — iPhone frame, both roles, 11 screens, all state live (addresses, filters, cart, tracking clock that ticks, chat replies, courier accept→scan→proof flow). Screen index and role switch sit on the left; assumptions/reasoning on the right.

Two things:
- Your four variation axes are in the **Tweaks** panel (home layout, tracking treatment, checkout flow, nav pattern) rather than as separate mockups — flip them and the prototype stays working.
- I couldn't reach the attached **Deeliva** folder from here, so naming, tiers and pricing are invented. Paste a few key files or screenshots and I'll align them.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Fixed — courier profile now shows vehicle, payouts, documents, availability, and tax rows instead of the customer's.

