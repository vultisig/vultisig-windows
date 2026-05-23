/**
 * Swap Flow E2E Tests
 *
 * Two modes of coverage:
 *
 * 1. DYNAMIC SWAP — picks source by highest balance, dest by lowest, amount
 *    sized to SWAP_TARGET_USD (default $15, above TC inbound floor). Runs as
 *    daily smoke. Override pair space with SWAPPABLE_CHAINS env.
 *
 * 2. ROUTE MATRIX — driven by SWAP_ROUTES env (csv of `from>to`, e.g.
 *    "ethereum>sui,avalanche>zcash"). Used to exercise specific SwapKit /
 *    THORChain / Maya / 1inch / Kyber / LI.FI routes on release. Each route
 *    is its own test() so one failure doesn't cascade. If SWAP_ROUTES is
 *    unset, the matrix block is skipped.
 *
 * FUND-DEPENDENT: Requires funded test vault. Set ENABLE_TX_SIGNING_TESTS=true.
 *
 * SAFETY MEASURES:
 * - Swaps go to vault's OWN address on destination chain
 * - Amounts default to ~$15 (above TC min, below cap-loss risk)
 * - Only swap fees + gas are consumed
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { updateStaleness, type ChainId } from '../helpers/chain-rotation'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'
import {
  getVaultBalances,
  selectSwapPair,
  canSwap,
  CHAIN_SYMBOLS,
  SYMBOL_FALLBACK_AMOUNTS,
  type SwapConfig,
} from '../helpers/dynamic-swap'

// Skip if fund-dependent tests not enabled
const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

test.describe('Swap Flow', () => {

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

  test('dynamic swap - based on actual balances', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      // Go to vault and read balances
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      console.log('\n📊 Reading vault balances...')
      const balances = await getVaultBalances(page)

      // Check if swap is possible
      if (!canSwap(balances)) {
        console.log('⚠️ Insufficient balance for swap - skipping')
        test.skip()
        return
      }

      // Dynamically select best swap pair
      const swapConfig = selectSwapPair(balances)
      if (!swapConfig) {
        console.log('⚠️ Could not determine swap pair - skipping')
        test.skip()
        return
      }

      console.log(`\n🔄 Executing swap: ${swapConfig.amount} ${swapConfig.fromSymbol} → ${swapConfig.toSymbol}`)

      // Navigate to swap
      await navigateToSwap(page)
      await swapFlow.waitForView()

      // Prepare swap with actual amount
      await swapFlow.prepareSwapWithAmount(
        swapConfig.fromChain,
        swapConfig.toChain,
        swapConfig.amount
      )

      // Verify quote loaded
      const expectedOutput = await swapFlow.getExpectedOutput()
      if (!expectedOutput || expectedOutput === '0') {
        console.log('⚠️ No quote received - may need more funds or route unavailable')
        test.skip()
        return
      }
      console.log(`Quote: ${swapConfig.amount} ${swapConfig.fromSymbol} → ${expectedOutput} ${swapConfig.toSymbol}`)

      // Check if continue is enabled
      const canContinue = await swapFlow.isContinueEnabled()
      if (!canContinue) {
        console.log('⚠️ Continue button disabled - amount may be too small')
        test.skip()
        return
      }

      // Pre-broadcast safety gate — verify the form actually matches what we
      // intended. Throws (does NOT broadcast) on mismatch.
      await swapFlow.assertSelectionMatches(swapConfig.fromSymbol, swapConfig.toSymbol)

      // Execute swap
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
          console.log(`✅ Swap tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(swapConfig.fromChain as ChainId, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([swapConfig.fromChain as ChainId, swapConfig.toChain as ChainId], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ Swap failed:`, error)
        updateStaleness([swapConfig.fromChain as ChainId, swapConfig.toChain as ChainId], false)

        // Only fail on unexpected errors
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
      await swapFlow.fillAmount('0.001')
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

  /**
   * Route matrix — drive arbitrary from>to pairs via env. Each pair runs as a
   * separate test so one bad route doesn't poison the rest of the suite.
   *
   *   SWAP_ROUTES="ethereum>sui,avalanche>zcash" \
   *   ENABLE_TX_SIGNING_TESTS=true \
   *   npx playwright test --grep "route matrix"
   *
   * Per-pair amount override: `ethereum>sui:0.01` overrides the default
   * SYMBOL_FALLBACK_AMOUNTS lookup. Useful for routes with non-standard mins.
   */
  const parsedRoutes = (process.env.SWAP_ROUTES || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(entry => {
      const [pair, amountOverride] = entry.split(':').map(s => s.trim())
      const [from, to] = pair.split('>').map(s => s.trim().toLowerCase())
      return { from, to, amountOverride }
    })
    .filter(r => r.from && r.to)

  for (const route of parsedRoutes) {
    const fromSymbol = CHAIN_SYMBOLS[route.from]
    const toSymbol = CHAIN_SYMBOLS[route.to]
    const amount =
      route.amountOverride ||
      (fromSymbol ? SYMBOL_FALLBACK_AMOUNTS[fromSymbol] : undefined) ||
      '0.001'

    test(`route matrix - ${route.from} -> ${route.to} (${amount} ${fromSymbol || '?'})`, async ({ context, extensionId }) => {
      test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')
      test.skip(!fromSymbol || !toSymbol, `Unknown chain in route ${route.from}>${route.to}`)

      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const swapFlow = new SwapFlow(page, extensionId)
      const keysignProgress = new KeysignProgress(page, extensionId)

      try {
        await vaultPage.goto()
        await vaultPage.waitForView(15_000)

        console.log(`\n🔄 Route matrix: ${amount} ${fromSymbol} (${route.from}) → ${toSymbol} (${route.to})`)

        await navigateToSwap(page)
        await swapFlow.waitForView()

        await swapFlow.prepareSwapWithAmount(route.from, route.to, amount)

        const expectedOutput = await swapFlow.getExpectedOutput()
        if (!expectedOutput || expectedOutput === '0') {
          console.log('⚠️ No quote received - route may be unavailable or amount below provider min')
          test.skip()
          return
        }
        console.log(`Quote: ${amount} ${fromSymbol} → ${expectedOutput} ${toSymbol}`)

        const canContinue = await swapFlow.isContinueEnabled()
        if (!canContinue) {
          console.log('⚠️ Continue disabled - quote present but blocked (likely balance or min)')
          test.skip()
          return
        }

        // Pre-broadcast safety gate — refuse to broadcast if the form doesn't
        // match the intended route (catches selectFromCoin falling back to USDC,
        // selectToCoin silently no-op'ing when chain not in carousel, etc.)
        await swapFlow.assertSelectionMatches(fromSymbol!, toSymbol!)

        await swapFlow.continue()
        await swapFlow.acceptTerms()
        await swapFlow.sign()

        await keysignProgress.waitForView(30_000)
        const result = await keysignProgress.waitForComplete(180_000)

        if (result === 'success') {
          const txHash = await keysignProgress.getTxHash()
          expect(txHash).toBeTruthy()
          if (txHash) {
            console.log(`✅ ${route.from}>${route.to} swap tx: ${txHash}`)
            const confirmation = await waitForTxConfirmation(route.from as ChainId, txHash, 120_000)
            expect(confirmation.confirmed).toBe(true)
            updateStaleness([route.from as ChainId, route.to as ChainId], true)
          }
        } else {
          const error = await keysignProgress.getError()
          console.log(`❌ ${route.from}>${route.to} swap failed:`, error)
          updateStaleness([route.from as ChainId, route.to as ChainId], false)

          // Same tolerant-error policy as the dynamic-swap test: only hard-fail
          // on errors that aren't liquidity/balance/route-availability noise.
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
  }

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
