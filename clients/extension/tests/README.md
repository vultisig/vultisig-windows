# VultiConnect Extension Test Suite

Regression tests for the VultiConnect Chrome extension. These tests target code on `main` and are designed to validate that the SDK migration branch doesn't break existing behavior.

## Running Tests

```bash
# From repo root:
yarn vitest run --config clients/extension/tests/unit/vitest.config.ts      # Unit tests
yarn vitest run --config clients/extension/tests/integration/vitest.config.ts # Integration tests

# From clients/extension (if scripts are wired):
yarn test:unit
yarn test:integration
yarn test:all
```

## Test Structure

```text
tests/
├── README.md
├── unit/
│   ├── vitest.config.ts           # Node environment, forks pool
│   ├── setup.ts                   # Chrome API mocks, window polyfill
│   ├── mocks/
│   │   ├── chrome.ts              # In-memory chrome.storage, runtime, tabs
│   │   └── bridge.ts              # Mock factories for callBackground/callPopup
│   ├── errorHandler.test.ts       # EIP1193Error code mapping (13 tests)
│   ├── injectHelpers.test.ts      # shouldInjectProvider() logic (11 tests)
│   ├── ethereum-provider.test.ts  # Ethereum class: singleton, defaults, request dispatch (23 tests)
│   ├── ethereum-handlers.test.ts  # Handler map completeness (32 tests)
│   ├── ethereum-resolvers.test.ts # eth_chainId, eth_accounts, requestAccounts, personal_sign (10 tests)
│   ├── requestAccount.test.ts     # Background→Popup fallback flow (7 tests)
│   └── solana-provider.test.ts    # Solana Wallet Standard provider (19 tests)
├── integration/
│   ├── vitest.config.ts           # happy-dom environment
│   ├── setup.ts                   # Chrome mocks for browser environment
│   └── navigation.test.ts         # Module structure verification (3 tests)
└── e2e/
    ├── playwright.config.ts       # Chromium with extension loading
    ├── fixtures/
    │   ├── extension-loader.ts    # Playwright fixture for unpacked extension
    │   └── test-dapp.html         # Minimal DApp for provider testing
    └── extension.spec.ts          # Provider injection, connect, chain switch
```

## What's Tested

### Unit Tests (115 tests)
- **EIP1193Error**: All 10 error types map to correct EIP-1193 codes
- **shouldInjectProvider()**: Doctype, suffix (.pdf/.xml), and documentElement checks
- **Ethereum Provider**: Constructor defaults, singleton pattern, request dispatch, event system
- **Ethereum Handlers Map**: All 29 methods registered, all are functions
- **Ethereum Resolvers**: eth_chainId, eth_accounts, eth_requestAccounts, personal_sign
- **requestAccount Flow**: Happy path, Unauthorized→Popup fallback, user rejection, error handling
- **Solana Provider**: Constructor, connect/disconnect, signMessage, features, event system

### Integration Tests (3 tests)
- Module import verification (ensures exports exist)

### What's NOT Tested (and why)
- **React components** (NavigationProvider, setup pages, keygen pages): These are tightly coupled to Chrome extension APIs and 20+ deep @core/ui dependencies. Mocking them would test mocks, not code. Better suited for E2E tests.
- **processSignature()**: Depends on ethers.js Signature internals. Tested implicitly through the personal_sign resolver mock.
- **switchChainHandler**: Depends on chain registry mapping. Would need the full chain config imported.
- **Transaction signing flows**: Require complex serialization/deserialization with @solana/web3.js and @trustwallet/wallet-core. Suitable for E2E testing.

### E2E Tests (infrastructure only)
- Provider injection verification
- Ethereum connect flow
- Chain switching

**Note**: E2E tests require a built extension (`yarn build:extension`). See the e2e/ directory README for setup.

## Mocking Strategy

Tests mock at module boundaries using `vi.mock()`:
- `@core/inpage-provider/background` → mocked `callBackground`
- `@core/inpage-provider/popup` → mocked `callPopup`
- `@core/inpage-provider/background/events/inpage` → mocked event listeners
- `@lib/utils/validation/url` → mocked URL validation

The `mocks/chrome.ts` provides an in-memory Map-backed `chrome.storage.local` and stubbed `chrome.runtime` for tests that interact with Chrome APIs.
