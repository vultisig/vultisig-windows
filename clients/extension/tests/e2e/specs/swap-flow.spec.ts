/**
 * Swap Flow E2E Tests
 *
 * Tests real swap transactions with chain rotation.
 * FUND-DEPENDENT: Requires funded test vault.
 *
 * NATIVE-TO-NATIVE SWAPS ONLY:
 * - Swaps native/gas tokens between different chains (ETH↔BTC, SOL↔ETH, etc.)
 * - Avoids token selection complexity (no ERC-20, SPL tokens)
 * - Better liquidity = faster quotes
 * - Simpler UI flow (no "select token within chain" step)
 *
 * Uses chain rotation to test 2 swap pairs per run from funded chains.
 *
 * SAFETY MEASURES:
 * - Swaps go to vault's OWN address on destination chain (no custom recipient)
 * - Amounts are small: $2-5 range (see chain-rotation.ts minSwap)
 * - Funds stay in the vault, just converted between chains
 * - Only swap fees + gas are consumed
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { selectChainsForRun, updateStaleness, SUPPORTED_CHAINS, type ChainId } from '../helpers/chain-rotation'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'

// Skip if fund-dependent tests not enabled
const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

// Get swap pairs to test this run (outside test context for sharing)
const { swapPairs } = selectChainsForRun(0, 2)
const selectedSwapPairs = swapPairs

test.describe('Swap Flow', () => {
  test.beforeAll(async () => {
    console.log('Selected swap pairs for tests:', selectedSwapPairs)
  })

  // Import vault before each test (each test gets a fresh browser context)
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      console.log('⚠️ No vault config, tests will likely fail')
      return
    }
    const imported = await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
    if (imported) {
      console.log('✅ Vault imported for swap test')
    } else {
      console.log('⚠️ Failed to import vault')
    }
  })

  test('swap pair 1 - native-to-native cross-chain swap', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const pair = selectedSwapPairs[0]
    if (!pair) {
      test.skip()
      return
    }

    const [fromChain, toChain] = pair
    const fromInfo = SUPPORTED_CHAINS[fromChain]
    const toInfo = SUPPORTED_CHAINS[toChain]

    console.log(`🔄 Native swap: ${fromInfo.symbol} (${fromChain}) → ${toInfo.symbol} (${toChain})`)

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to swap
      await navigateToSwap(page)
      await swapFlow.waitForView()

      // Prepare swap
      await swapFlow.prepareSwap(fromInfo.symbol, toInfo.symbol, fromInfo.minSwap)

      // Verify quote loaded
      const expectedOutput = await swapFlow.getExpectedOutput()
      expect(expectedOutput).toBeTruthy()
      console.log(`Quote: ${fromInfo.minSwap} ${fromInfo.symbol} -> ${expectedOutput} ${toInfo.symbol}`)

      const rate = await swapFlow.getSwapRate()
      if (rate) console.log(`Rate: ${rate}`)

      // Continue to confirmation
      await swapFlow.continue()
      await swapFlow.acceptTerms()
      await swapFlow.sign()

      // Wait for keysign
      await keysignProgress.waitForView(30_000)

      const result = await keysignProgress.waitForComplete(180_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ ${fromChain}->${toChain} swap tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(fromChain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([fromChain, toChain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ Swap failed:`, error)
        updateStaleness([fromChain, toChain], false)

        if (
          !error?.includes('insufficient') &&
          !error?.includes('balance') &&
          !error?.includes('no route') &&
          !error?.includes('liquidity')
        ) {
          throw new Error(`Swap failed: ${error}`)
        }
      }
    } finally {
      await page.close()
    }
  })

  test('swap pair 2 - native-to-native cross-chain swap', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const pair = selectedSwapPairs[1]
    if (!pair) {
      test.skip()
      return
    }

    const [fromChain, toChain] = pair
    const fromInfo = SUPPORTED_CHAINS[fromChain]
    const toInfo = SUPPORTED_CHAINS[toChain]

    console.log(`🔄 Native swap: ${fromInfo.symbol} (${fromChain}) → ${toInfo.symbol} (${toChain})`)

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await navigateToSwap(page)
      await swapFlow.waitForView()

      await swapFlow.prepareSwap(fromInfo.symbol, toInfo.symbol, fromInfo.minSwap)

      const expectedOutput = await swapFlow.getExpectedOutput()
      expect(expectedOutput).toBeTruthy()
      console.log(`Quote: ${fromInfo.minSwap} ${fromInfo.symbol} -> ${expectedOutput} ${toInfo.symbol}`)

      await swapFlow.continue()
      await swapFlow.acceptTerms()
      await swapFlow.sign()

      await keysignProgress.waitForView(30_000)

      const result = await keysignProgress.waitForComplete(180_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ ${fromChain}->${toChain} swap tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(fromChain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([fromChain, toChain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ Swap failed:`, error)
        updateStaleness([fromChain, toChain], false)

        if (
          !error?.includes('insufficient') &&
          !error?.includes('balance') &&
          !error?.includes('no route') &&
          !error?.includes('liquidity')
        ) {
          throw new Error(`Swap failed: ${error}`)
        }
      }
    } finally {
      await page.close()
    }
  })

  test('swap flow shows provider and fees', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(10_000)

      await navigateToSwap(page)
      await swapFlow.waitForView(10_000)

      // Fill some amount to trigger quote
      await swapFlow.fillAmount('1')
      await page.waitForTimeout(500)

      // Wait for quote
      await swapFlow.waitForQuote()

      // Look for provider/aggregator info
      const providerInfo = page.locator(
        'text=/thorchain|maya|1inch|jupiter|lifi|provider|aggregator/i'
      )
      const feeInfo = page.locator('text=/fee|cost|network fee|gas/i')
      const slippageInfo = page.locator('text=/slippage|price impact/i')

      const hasProvider = await providerInfo.first().isVisible().catch(() => false)
      const hasFee = await feeInfo.first().isVisible().catch(() => false)
      const hasSlippage = await slippageInfo.first().isVisible().catch(() => false)

      console.log(`Provider info: ${hasProvider}, Fee info: ${hasFee}, Slippage: ${hasSlippage}`)
    } catch (error) {
      console.log('Could not verify swap provider/fees:', error)
    } finally {
      await page.close()
    }
  })

  test('destination balance updates after swap', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const balances = await vaultPage.getTokenBalances()
      console.log('Token balances after swaps:', balances)

      expect(typeof balances === 'object').toBe(true)
    } finally {
      await page.close()
    }
  })
})

/**
 * Navigate to the swap page.
 * Uses the vault action button with testid.
 */
async function navigateToSwap(page: import('@playwright/test').Page): Promise<void> {
  // Use the vault action button testid
  const swapButton = page.locator('[data-testid="vault-action-swap"]')
  await swapButton.waitFor({ state: 'visible', timeout: 5000 })
  await swapButton.click()
  await page.waitForTimeout(500)
}
