# DeFi UI QA harness

Render DeFi screens with deterministic local fixture data instead of wiring a
temporary app by hand.

```bash
yarn qa:defi-ui-harness
```

Open `http://127.0.0.1:5177`. Pick a scenario with `?scenario=`:

| URL | Renders |
| --- | --- |
| `http://127.0.0.1:5177` | Circle with a funded protocol account (default) |
| `http://127.0.0.1:5177/?scenario=kamino` | Kamino Earn: one funded vault, two empty ones |

Use Playwright or the in-app browser to capture the important states.

**Circle**

1. Home state: the Circle deposited panel shows the funded USDC balance and no
   deposit action.
2. Withdraw path: click **Withdraw** and capture the withdraw form.

**Kamino Earn**

1. The first card carries a position: `Deposited` / `Earned` rows with fiat
   opposite, a divider, and the Withdraw + Deposit pair.
2. The other two are empty: identity, APY, and a full-width Deposit.

The fixture helpers in `fixture.tsx` seed React Query through production query
key helpers:

- `seedCircleAccount` uses `getCircleAccountQueryKey`.
- `seedCoinBalance` uses `getBalanceQueryKey`.
- `seedCoinPrices` uses `getCoinPricesQueryKeys`.
- `seedDefiPositions` writes the `defiPositions` storage key.
- `seedKaminoEarn` (in `kaminoFixture.ts`) uses `kaminoVaultsQueryKey` and
  `getKaminoPositionsQueryKey`.

`seedCoinPrices` keys on the whole coin list, so a scenario has to deduplicate
its coins exactly as the screen does — a list of a different length is a
different key, and the screen quietly falls through to a real request.

Keep this harness fake-data only. It is useful for layout, copy, visibility, and
navigation checks, but it does not replace real wallet QA for signing or
broadcast flows.
