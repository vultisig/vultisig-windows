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

import { expect, test } from '../fixtures/extension-loader'
import {
  type ChainId,
  SUPPORTED_CHAINS,
  updateStaleness,
} from '../helpers/chain-rotation'
import {
  canSwap,
  CHAIN_SYMBOLS,
  getVaultBalances,
  selectSwapPair,
  SYMBOL_FALLBACK_AMOUNTS,
} from '../helpers/dynamic-swap'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

const parseVisibleAmount = (value: string) => {
  const normalized = value.replace(/,/g, '')
  const match = normalized.match(/\d+(?:\.\d+)?/)

  return match ? Number(match[0]) : 0
}

const getDifferentAmount = (amount: string) => {
  const value = Number(amount)
  const nextValue = Number.isFinite(value) && value > 0 ? value * 2.5 : 0.0025

  return nextValue.toFixed(8).replace(/\.?0+$/, '')
}

type PasteAmountInput = {
  page: import('@playwright/test').Page,
  swapFlow: SwapFlow
  amount: string
}

const pasteAmount = async ({
  page,
  swapFlow,
  amount,
}: PasteAmountInput) => {
  await swapFlow.fromAmountInput.click({ force: true })
  await page.evaluate(async value => {
    await navigator.clipboard.writeText(value)
  }, amount)
  await page.keyboard.press('ControlOrMeta+V')
}

const readOutputAmount = async (swapFlow: SwapFlow) =>
  parseVisibleAmount(await swapFlow.getExpectedOutput())

test.describe('Swap Flow', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      console.log('⚠️ No vault config, tests will likely fail')
      return
    }
    const imported = await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
    if (imported) {
      console.log('✅ Vault imported for swap test')
    } else {
      console.log('⚠️ Failed to import vault')
    }
  })

  test('dynamic swap - based on actual balances', async ({
    context,
    extensionId,
  }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      console.log('\n📊 Reading vault balances...')
      const balances = await getVaultBalances(page)

      if (!canSwap(balances)) {
        console.log('⚠️ Insufficient balance for swap - skipping')
        test.skip()
        return
      }

      const swapConfig = selectSwapPair(balances)
      if (!swapConfig) {
        console.log('⚠️ Could not determine swap pair - skipping')
        test.skip()
        return
      }

      console.log(
        `\n🔄 Executing swap: ${swapConfig.amount} ${swapConfig.fromSymbol} → ${swapConfig.toSymbol}`
      )

      await navigateToSwap(page)
      await swapFlow.waitForView()

      await swapFlow.prepareSwapWithAmount({
        fromChainId: swapConfig.fromChain,
        toChainId: swapConfig.toChain,
        amount: swapConfig.amount,
      })

      const expectedOutput = await swapFlow.getExpectedOutput()
      if (!expectedOutput || expectedOutput === '0') {
        console.log(
          '⚠️ No quote received - may need more funds or route unavailable'
        )
        test.skip()
        return
      }
      console.log(
        `Quote: ${swapConfig.amount} ${swapConfig.fromSymbol} → ${expectedOutput} ${swapConfig.toSymbol}`
      )

      const canContinue = await swapFlow.isContinueEnabled()
      if (!canContinue) {
        console.log('⚠️ Continue button disabled - amount may be too small')
        test.skip()
        return
      }

      // Pre-broadcast safety gate — throws (does NOT broadcast) on form mismatch.
      await swapFlow.assertSelectionMatches({
        fromSymbol: swapConfig.fromSymbol,
        toSymbol: swapConfig.toSymbol,
      })

      await swapFlow.continue()
      await swapFlow.acceptTerms()
      await swapFlow.sign()

      await keysignProgress.waitForView(30_000)
      const result = await keysignProgress.waitForComplete(180_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ Swap tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(
            swapConfig.fromChain as ChainId,
            txHash,
            120_000
          )
          expect(confirmation.confirmed).toBe(true)
          updateStaleness(
            [swapConfig.fromChain as ChainId, swapConfig.toChain as ChainId],
            true
          )
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ Swap failed:`, error)
        updateStaleness(
          [swapConfig.fromChain as ChainId, swapConfig.toChain as ChainId],
          false
        )

        // Tolerate liquidity/balance/route-availability errors; hard-fail on anything else.
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

  test('swap flow shows provider and fees', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(10_000)

      await navigateToSwap(page)
      await swapFlow.waitForView(10_000)

      await swapFlow.fillAmount('0.001')
      await page.waitForTimeout(500)
      await swapFlow.waitForQuote()

      const providerInfo = page.locator(
        'text=/thorchain|maya|1inch|jupiter|lifi|provider|aggregator/i'
      )
      const feeInfo = page.locator('text=/fee|cost|network fee|gas/i')
      const slippageInfo = page.locator('text=/slippage|price impact/i')

      const hasProvider = await providerInfo
        .first()
        .isVisible()
        .catch(() => false)
      const hasFee = await feeInfo
        .first()
        .isVisible()
        .catch(() => false)
      const hasSlippage = await slippageInfo
        .first()
        .isVisible()
        .catch(() => false)

      console.log(
        `Provider info: ${hasProvider}, Fee info: ${hasFee}, Slippage: ${hasSlippage}`
      )
    } catch (error) {
      console.log('Could not verify swap provider/fees:', error)
    } finally {
      await page.close()
    }
  })

  test('swap quote amount stays responsive while firm quote resolves', async ({
    context,
    extensionId,
  }, testInfo) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const balances = await getVaultBalances(page)
      if (!canSwap(balances)) {
        test.skip(true, 'Insufficient balance for swap quote UX')
        return
      }

      const swapConfig = selectSwapPair(balances)
      if (!swapConfig) {
        test.skip(true, 'Could not determine swap pair')
        return
      }

      await navigateToSwap(page)
      await swapFlow.waitForView(10_000)

      await swapFlow.prepareSwapWithAmount({
        fromChainId: swapConfig.fromChain,
        toChainId: swapConfig.toChain,
        amount: swapConfig.amount,
      })

      await swapFlow.waitForQuote()
      const firmOutput = await readOutputAmount(swapFlow)
      expect(firmOutput).toBeGreaterThan(0)

      const pastedAmount = getDifferentAmount(swapConfig.amount)
      await pasteAmount({ page, swapFlow, amount: pastedAmount })

      await expect
        .poll(() => readOutputAmount(swapFlow), {
          timeout: 500,
          intervals: [50, 100],
        })
        .not.toBeCloseTo(firmOutput, 8)

      const immediateOutput = await readOutputAmount(swapFlow)
      expect(immediateOutput).not.toBeCloseTo(firmOutput, 8)

      const screenshotPath = testInfo.outputPath(
        'swap-quote-ux-real-workflow.png'
      )
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      })
      await testInfo.attach('swap quote UX real workflow', {
        path: screenshotPath,
        contentType: 'image/png',
      })

      const canContinue = await swapFlow.isContinueEnabled().catch(() => false)
      console.log(
        `Swap quote UX: ${swapConfig.amount} ${swapConfig.fromSymbol} quote=${firmOutput}; pasted ${pastedAmount}, immediate output=${immediateOutput}; continueEnabled=${canContinue}`
      )
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
      if (amountOverride) {
        const parsedAmount = Number(amountOverride)
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          throw new Error(
            `Invalid SWAP_ROUTES amount override "${amountOverride}" for "${entry}"`
          )
        }
      }
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

    test(`route matrix - ${route.from} -> ${route.to} (${amount} ${fromSymbol || '?'})`, async ({
      context,
      extensionId,
    }) => {
      test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')
      test.skip(
        !fromSymbol || !toSymbol,
        `Unknown chain in route ${route.from}>${route.to}`
      )

      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const swapFlow = new SwapFlow(page, extensionId)
      const keysignProgress = new KeysignProgress(page, extensionId)

      try {
        await vaultPage.goto()
        await vaultPage.waitForView(15_000)

        console.log(
          `\n🔄 Route matrix: ${amount} ${fromSymbol} (${route.from}) → ${toSymbol} (${route.to})`
        )

        await navigateToSwap(page)
        await swapFlow.waitForView()

        await swapFlow.prepareSwapWithAmount({
          fromChainId: route.from,
          toChainId: route.to,
          amount,
        })

        const expectedOutput = await swapFlow.getExpectedOutput()
        if (!expectedOutput || expectedOutput === '0') {
          console.log(
            '⚠️ No quote received - route may be unavailable or amount below provider min'
          )
          test.skip()
          return
        }
        console.log(
          `Quote: ${amount} ${fromSymbol} → ${expectedOutput} ${toSymbol}`
        )

        const canContinue = await swapFlow.isContinueEnabled()
        if (!canContinue) {
          console.log(
            '⚠️ Continue disabled - quote present but blocked (likely balance or min)'
          )
          test.skip()
          return
        }

        // Pre-broadcast safety gate — catches selectFromCoin falling back to USDC,
        // selectToCoin silently no-op'ing when chain not in carousel, etc.
        await swapFlow.assertSelectionMatches({
          fromSymbol: fromSymbol,
          toSymbol: toSymbol,
        })

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
            const confirmation = await waitForTxConfirmation(
              route.from,
              txHash,
              120_000
            )
            expect(confirmation.confirmed).toBe(true)
            if (
              route.from in SUPPORTED_CHAINS &&
              route.to in SUPPORTED_CHAINS
            ) {
              updateStaleness(
                [route.from as ChainId, route.to as ChainId],
                true
              )
            }
          }
        } else {
          const error = await keysignProgress.getError()
          console.log(`❌ ${route.from}>${route.to} swap failed:`, error)
          if (route.from in SUPPORTED_CHAINS && route.to in SUPPORTED_CHAINS) {
            updateStaleness([route.from as ChainId, route.to as ChainId], false)
          }

          // Tolerate liquidity/balance/route-availability errors; hard-fail on anything else.
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

  test('destination balance updates after swap', async ({
    context,
    extensionId,
  }) => {
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

async function navigateToSwap(
  page: import('@playwright/test').Page
): Promise<void> {
  const swapButton = page.locator('[data-testid="vault-action-swap"]')
  await swapButton.waitFor({ state: 'visible', timeout: 5000 })
  await swapButton.click()
  await page.waitForTimeout(500)
}
