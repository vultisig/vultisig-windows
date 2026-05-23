/**
 * Enable Chains Helper
 *
 * Drives the Vultisig extension's chain-management UI to toggle on a list of
 * chains in the current vault. Used by `dump-vault-addresses.spec.ts` and any
 * future test that needs broader-than-default chain coverage.
 *
 * NOTE: This helper depends on UI selectors that are not yet testid-tagged in
 * source. If selectors break, dump the UI tree and adjust — see fallback chain
 * in `openChainManagement`. A clean fix is to add `data-testid="manage-chains-button"`
 * to the IconButton in `core/ui/vault/page/components/VaultTabs/VaultTabsHeader.tsx`.
 */

import type { Page } from '@playwright/test'

/**
 * Map of user-friendly chain keys to the actual `Chain` enum values from
 * @vultisig/core-chain. ChainItem renders `data-testid="chain-item-${coin.chain}"`
 * so the testid uses the enum value, NOT the user-friendly key.
 */
export const CHAIN_UI_LABELS: Record<string, string> = {
  ethereum: 'Ethereum',
  bsc: 'BSC',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  avalanche: 'Avalanche',
  base: 'Base',
  blast: 'Blast',
  zksync: 'Zksync',
  mantle: 'Mantle',
  cronos: 'CronosChain',
  hyperliquid: 'Hyperliquid',
  sei: 'Sei',
  bitcoin: 'Bitcoin',
  litecoin: 'Litecoin',
  dogecoin: 'Dogecoin',
  bitcoincash: 'Bitcoin-Cash',
  zcash: 'Zcash',
  dash: 'Dash',
  solana: 'Solana',
  thorchain: 'THORChain',
  mayachain: 'MayaChain',
  cosmos: 'Cosmos',
  osmosis: 'Osmosis',
  dydx: 'Dydx',
  kujira: 'Kujira',
  terra: 'Terra',
  terraclassic: 'TerraClassic',
  noble: 'Noble',
  akash: 'Akash',
  sui: 'Sui',
  ton: 'Ton',
  tron: 'Tron',
  ripple: 'Ripple',
  polkadot: 'Polkadot',
  cardano: 'Cardano',
  bittensor: 'Bittensor',
}

/**
 * Opens the manage-chains screen from the vault page via the manage-chains-button testid.
 */
async function openChainManagement(page: Page): Promise<void> {
  const button = page.getByTestId('manage-chains-button')
  await button.waitFor({ state: 'visible', timeout: 10_000 })
  await button.click()
  await page.getByTestId('manage-chains-done').waitFor({ state: 'visible', timeout: 10_000 })
}

/**
 * Toggles each chain ON in the manage-chains screen, then taps Done.
 *
 * Idempotent: chains that are already enabled are detected via the
 * checkmark indicator and skipped.
 *
 * @param page    Playwright Page already at the Portfolio view
 * @param chains  Chain keys matching CHAIN_UI_LABELS (e.g. 'arbitrum', 'dash')
 */
export async function enableChains(page: Page, chains: string[]): Promise<{ enabled: string[]; skipped: string[]; missing: string[] }> {
  await openChainManagement(page)

  const enabled: string[] = []
  const skipped: string[] = []
  const missing: string[] = []

  for (const chain of chains) {
    const enumValue = CHAIN_UI_LABELS[chain]
    if (!enumValue) {
      missing.push(chain)
      continue
    }
    const item = page.getByTestId(`chain-item-${enumValue}`)
    const itemCount = await item.count()
    if (itemCount === 0) {
      missing.push(chain)
      continue
    }

    const selected = await item.first().getAttribute('data-selected').catch(() => null)
    if (selected === 'true') {
      skipped.push(chain)
      continue
    }
    await item.first().scrollIntoViewIfNeeded()
    await item.first().click()
    enabled.push(chain)
  }

  // Tap Done to commit
  await page.getByTestId('manage-chains-done').click({ timeout: 5_000 })

  // Wait for navigation back to vault page
  await page.waitForTimeout(2_000)

  return { enabled, skipped, missing }
}
