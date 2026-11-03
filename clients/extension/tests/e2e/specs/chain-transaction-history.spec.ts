/**
 * History opened from a chain's page lists that chain's records, and a swap
 * is listed on the chain of either of its coins (#5239).
 *
 * Seeds one native ETH to BTC swap, filed under THORChain the way the app
 * files every native swap, and one plain BTC send. Both are already settled,
 * so the status poll never asks a chain about their made-up hashes.
 */

import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'
import { VaultPage } from '../page-objects/VaultPage.po'

const ethereumAddress = '0x0000000000000000000000000000000000000001'
const bitcoinAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
const thorchainAddress = 'thor1dheycdevq39qlkxs2a6wuuzyn4aqxhve4qxtxt'

const coins = [
  {
    address: ethereumAddress,
    chain: 'Ethereum',
    decimals: 18,
    isNativeToken: true,
    logo: 'eth',
    priceProviderId: 'ethereum',
    ticker: 'ETH',
  },
  {
    address: bitcoinAddress,
    chain: 'Bitcoin',
    decimals: 8,
    isNativeToken: true,
    logo: 'btc',
    priceProviderId: 'bitcoin',
    ticker: 'BTC',
  },
  {
    address: thorchainAddress,
    chain: 'THORChain',
    decimals: 8,
    isNativeToken: true,
    logo: 'rune',
    priceProviderId: 'thorchain',
    ticker: 'RUNE',
  },
]

const hour = 60 * 60 * 1000

const createRecords = (vaultId: string) => [
  {
    id: 'e2e-5239-swap',
    vaultId,
    type: 'swap',
    status: 'confirmed',
    chain: 'THORChain',
    timestamp: new Date(Date.now() - hour).toISOString(),
    txHash: `0x${'ab'.repeat(32)}`,
    explorerUrl: '',
    fiatValue: '',
    data: JSON.stringify({
      fromToken: 'ETH',
      fromAmount: '1500000000000000000',
      fromChain: 'Ethereum',
      fromTokenLogo: 'eth',
      fromDecimals: 18,
      toToken: 'BTC',
      toAmount: '0.0512',
      toChain: 'Bitcoin',
      toTokenLogo: 'btc',
      toDecimals: 8,
      provider: 'THORChain',
      route: 'ETH → BTC',
      networkFee: { amount: '420000000000000', decimals: 18, ticker: 'ETH' },
    }),
  },
  {
    id: 'e2e-5239-send',
    vaultId,
    type: 'send',
    status: 'confirmed',
    chain: 'Bitcoin',
    timestamp: new Date(Date.now() - 2 * hour).toISOString(),
    txHash: 'cd'.repeat(32),
    explorerUrl: '',
    fiatValue: '',
    data: JSON.stringify({
      fromAddress: bitcoinAddress,
      toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      amount: '420000',
      token: 'BTC',
      tokenLogo: 'btc',
      decimals: 8,
      networkFee: { amount: '1200', decimals: 8, ticker: 'BTC' },
    }),
  },
]

const seed = async (context: BrowserContext) => {
  const { vaultId, vault } = await createSeededVault({
    name: 'Chain History QA',
  })

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    hasSeenNotificationPrompt: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [vault],
    vaultsCoins: { [vaultId]: coins },
    [`transactionHistory:${vaultId}`]: createRecords(vaultId),
  })
}

const openVault = async ({
  context,
  extensionId,
}: {
  context: BrowserContext
  extensionId: string
}) => {
  await seed(context)
  const page = await context.newPage()
  const vaultPage = new VaultPage(page, extensionId)
  await vaultPage.goto()
  await vaultPage.waitForView(30_000)

  return { page, vaultPage }
}

const rows = (page: Page) => page.getByTestId('transaction-record-row')
const swapRow = (page: Page) => rows(page).filter({ hasText: '1.5 ETH' })
const sendRow = (page: Page) => rows(page).filter({ hasText: '0.0042' })

const chainCases = [
  { chain: 'Bitcoin', swap: 1, send: 1 },
  { chain: 'Ethereum', swap: 1, send: 0 },
  // The swap is filed under THORChain, but neither of its coins is RUNE.
  { chain: 'THORChain', swap: 0, send: 0 },
]

test.describe('Chain transaction history', () => {
  for (const { chain, swap, send } of chainCases) {
    test(`${chain} history lists the records it should`, async ({
      context,
      extensionId,
    }, testInfo) => {
      const { page, vaultPage } = await openVault({ context, extensionId })

      await vaultPage.navigateToChain(chain)
      await page.getByTestId('chain-transaction-history-button').click()

      if (swap + send === 0) {
        await expect(page.getByText('No transactions yet')).toBeVisible()
      } else {
        await expect(rows(page)).toHaveCount(swap + send)
      }
      await expect(swapRow(page)).toHaveCount(swap)
      await expect(sendRow(page)).toHaveCount(send)

      await page.screenshot({
        path: testInfo.outputPath(`${chain.toLowerCase()}-history.png`),
      })
    })
  }

  test('vault history lists the swap once', async ({
    context,
    extensionId,
  }) => {
    const { page } = await openVault({ context, extensionId })

    await page.getByTestId('transaction-history-button').click()

    await expect(rows(page)).toHaveCount(2)
    await expect(swapRow(page)).toHaveCount(1)
    await expect(sendRow(page)).toHaveCount(1)
  })
})
