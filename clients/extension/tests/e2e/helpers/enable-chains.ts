import type { Page } from '@playwright/test'

// Maps user-friendly keys to the Chain enum value rendered into the
// `chain-item-${coin.chain}` testid by ChainItem.
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

async function openChainManagement(page: Page): Promise<void> {
  const button = page.getByTestId('manage-chains-button')
  await button.waitFor({ state: 'visible', timeout: 10_000 })
  await button.click()
  await page.getByTestId('manage-chains-done').waitFor({ state: 'visible', timeout: 10_000 })
}

export async function enableChains(
  page: Page,
  chains: string[]
): Promise<{ enabled: string[]; skipped: string[]; missing: string[] }> {
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
    const item = page.getByTestId(`chain-item-${enumValue}`).first()
    if ((await item.count()) === 0) {
      missing.push(chain)
      continue
    }

    const selected = await item.getAttribute('data-selected')
    if (selected === 'true') {
      skipped.push(chain)
      continue
    }
    await item.scrollIntoViewIfNeeded()
    await item.click()
    enabled.push(chain)
  }

  await page.getByTestId('manage-chains-done').click({ timeout: 5_000 })
  await page.waitForTimeout(2_000)

  return { enabled, skipped, missing }
}
