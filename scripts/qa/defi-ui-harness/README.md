# DeFi UI QA harness

Render DeFi screens with deterministic local fixture data instead of wiring a
temporary app by hand.

```bash
yarn qa:defi-ui-harness
```

Open <http://127.0.0.1:5177>. The default scenario renders Circle with a funded
protocol account. Use Playwright or the in-app browser to capture the important
states:

1. Home state: the Circle deposited panel shows the funded USDC balance and no
   deposit action.
2. Withdraw path: click **Withdraw** and capture the withdraw form.

The fixture helpers in `fixture.tsx` seed React Query through production query
key helpers:

- `seedCircleAccount` uses `getCircleAccountQueryKey`.
- `seedCoinBalance` uses `getBalanceQueryKey`.
- `seedCoinPrices` uses `getCoinPricesQueryKeys`.

Keep this harness fake-data only. It is useful for layout, copy, visibility, and
navigation checks, but it does not replace real wallet QA for signing or
broadcast flows.
