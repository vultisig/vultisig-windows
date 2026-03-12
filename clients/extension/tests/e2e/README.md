# Extension E2E Tests

Playwright-based end-to-end tests for the VultiConnect Chrome extension.

## Quick Start

```bash
# From repo root
cd clients/extension

# Install dependencies
yarn install

# Build the extension (required before running tests)
yarn build

# Run all E2E tests
npx playwright test tests/e2e/specs/

# Run a specific test file
npx playwright test specs/swap-flow.spec.ts

# Run with visible browser (headed mode)
npx playwright test specs/swap-flow.spec.ts --headed
```

## Environment Setup

Create `tests/e2e/.env` with your vault credentials:

```env
# Fast Vault (required for most tests)
TEST_VAULT_PATH=/path/to/SdkFastVault1-extension-XXXX-share1of2.vult
TEST_VAULT_PASSWORD=your-vault-password

# Enable transaction signing tests (sends real funds!)
ENABLE_TX_SIGNING_TESTS=true
MAX_TEST_VAULT_BALANCE_USD=300

# Secure Vault shares (optional, for SecureVault tests)
SECURE_VAULT_SHARES=/path/to/share1.vult,/path/to/share2.vult
SECURE_VAULT_PASSWORD=your-secure-password

# Seedphrase for import testing (optional)
TEST_SEEDPHRASE=lobster convince mouse school cotton absorb trap blanket muscle sorry drive father
```

> ⚠️ Never commit `.env` files with real credentials.

## Test Suites

| Suite | File | Tests | Description |
|-------|------|-------|-------------|
| **Onboarding** | `onboarding.spec.ts` | UI-only | Extension loads, branding, navigation |
| **Vault Import** | `vault-import-export.spec.ts` | UI + vault | Import FastVault/SecureVault .vult files |
| **Vault Management** | `vault-management.spec.ts` | UI + vault | Vault page, chains, settings |
| **Seedphrase Import** | `seedphrase-import.spec.ts` | UI-only | 12-word mnemonic import and validation |
| **Send Flow** | `send-flow.spec.ts` | 💰 TX | Self-sends on rotated chains (~$0.50 each) |
| **Swap Flow** | `swap-flow.spec.ts` | 💰 TX | Dynamic swap based on actual balances (~$2) |
| **DApp Provider** | `dapp-provider.spec.ts` | UI-only | Ethereum provider injection, personal_sign |
| **SecureVault** | `secure-vault-flows.spec.ts` | UI + vault | SecureVault import, balance, QR display |
| **Address Book** | `address-book.spec.ts` | UI + vault | Settings → Address Book navigation |
| **Transaction History** | `transaction-history.spec.ts` | UI + vault | Feature-flagged (behind `transactionHistory`) |
| **Visual Regression** | `visual-regression.spec.ts` | Screenshots | Baseline screenshot comparison |
| **Fast Vault Creation** | `fast-vault-creation.spec.ts` | UI-only | Creation form flow (no email verification) |

💰 = Requires `ENABLE_TX_SIGNING_TESTS=true` and funded vault

## How Swap Tests Work

Swap tests are **dynamically driven** by actual vault balances:

1. Reads balances from the vault page at runtime
2. **Source**: chain with highest USD balance (must be > $2)
3. **Destination**: chain with lowest balance (self-balancing!)
4. **Amount**: actual token amount (~$2 worth), not percentage
5. Uses the reverse button if default swap direction is wrong

Over time, this naturally balances the vault between BTC and ETH.

## How Send Tests Work

Send tests use **chain rotation** with staleness tracking:

1. Selects 2 chains that haven't been tested recently
2. Sends to the vault's **own address** (self-send, only gas spent)
3. Small amounts: ~$0.50 per send
4. Tracks success/failure rate per chain

## Adding New Tests

### Test Structure
```
tests/e2e/
├── fixtures/          # Playwright fixtures (extension loader)
├── helpers/           # Shared utilities
│   ├── chain-rotation.ts   # Chain selection algorithm
│   ├── dynamic-swap.ts     # Dynamic swap pair selection
│   ├── tx-confirmation.ts  # TX confirmation helpers
│   ├── ui-waits.ts         # Robust click/wait helpers
│   └── vault-import.ts     # Vault import via UI
├── page-objects/      # Page Object Models
│   ├── VaultPage.po.ts
│   ├── SendFlow.po.ts
│   ├── SwapFlow.po.ts
│   └── ...
└── specs/             # Test files
```

### Writing a New Test

1. Create `specs/my-feature.spec.ts`
2. Use the extension fixture: `import { test } from '../fixtures/extension-loader'`
3. Import vault if needed: `import { ensureVaultExists } from '../helpers/vault-import'`
4. Add `data-testid` attributes to source components for reliable selectors

### data-testid Conventions

When adding testids to source files:
- Use kebab-case: `data-testid="vault-action-swap"`
- Be descriptive: `data-testid="swap-from-amount-input"`
- For dynamic content: `data-testid={`coin-option-${ticker}`}`
- Source files modified for testids:
  - `core/ui/vault/components/` — action buttons (send, swap, buy, receive)
  - `core/ui/vault/swap/form/` — swap form elements
  - `core/ui/mpc/keysign/` — keysign progress and success
  - `core/ui/mpc/fast/` — fast vault password modal
  - `core/ui/vault/page/components/` — header controls (settings, history)
  - `core/ui/settings/` — settings page links (address book)

## Rebuilding After Source Changes

If you modify source files (e.g., adding `data-testid`), rebuild before testing:

```bash
cd clients/extension
yarn build
npx playwright test specs/your-test.spec.ts
```

## Funded Chains

Current test vault balances (update when they change):

| Chain | Balance | Used For |
|-------|---------|----------|
| ETH | ~$38 | Swap source |
| BTC | ~$0.87 | Swap destination |
| THOR | ~$0.84 | Send tests |
| SOL | ~$2.88 | Send tests |

## Safety

- Self-sends only (funds stay in vault, only gas spent)
- Small amounts ($0.50 sends, $2 swaps)
- Max vault balance check: `MAX_TEST_VAULT_BALANCE_USD=300`
- Never commit .env files
- Never use mainnet production vaults
