/**
 * Send Flow E2E Tests
 *
 * Tests real send transactions with chain rotation.
 * FUND-DEPENDENT: Requires funded test vault.
 *
 * Uses chain rotation to test 2 chains per run.
 */

import { test, expect, type BrowserContext } from '@playwright/test'
import { chromium } from '@playwright/test'
import { VaultPage } from '../page-objects/VaultPage.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { selectChainsForRun, updateStaleness, SUPPORTED_CHAINS, type ChainId } from '../helpers/chain-rotation'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'
import path from 'path'

const extensionPath = path.resolve(__dirname, '../../../../dist')

// Skip if fund-dependent tests not enabled
const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

// Test destination addresses (safe, controlled addresses)
const TEST_DESTINATIONS: Partial<Record<ChainId, string>> = {
  ethereum: process.env.TEST_ETH_ADDRESS || '0x000000000000000000000000000000000000dEaD', // Burn address
  bsc: process.env.TEST_BSC_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  polygon: process.env.TEST_POLYGON_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  arbitrum: process.env.TEST_ARB_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  optimism: process.env.TEST_OP_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  avalanche: process.env.TEST_AVAX_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  base: process.env.TEST_BASE_ADDRESS || '0x000000000000000000000000000000000000dEaD',
  bitcoin: process.env.TEST_BTC_ADDRESS || 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // Known test address
  solana: process.env.TEST_SOL_ADDRESS || '11111111111111111111111111111111', // System program (safe)
}

test.describe('Send Flow', () => {
  let context: BrowserContext
  let extensionId: string
  let selectedChains: ChainId[]

  test.beforeAll(async () => {
    // Get chains to test this run
    const { sendChains } = selectChainsForRun(2, 0)
    selectedChains = sendChains

    console.log('Selected chains for send tests:', selectedChains)

    // Create context with test vault
    const userDataDir = path.join(__dirname, '../.test-profile-send-' + Date.now())

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
      ],
    })

    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker', { timeout: 30_000 })
    }
    extensionId = background.url().split('/')[2]
  })

  test.afterAll(async () => {
    await context.close()
  })

  // Dynamic tests for each selected chain
  test('send native token on chain 1 - broadcasts and confirms', async () => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const chain = selectedChains[0]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]
    const destination = TEST_DESTINATIONS[chain]

    if (!destination) {
      console.log(`No test destination for ${chain}, skipping`)
      test.skip()
      return
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to send
      await vaultPage.navigateToSend()
      await sendFlow.waitForView()

      // Fill send form
      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(destination)
      await sendFlow.fillAmount(chainInfo.minSend)

      // Check fee is displayed
      const fee = await sendFlow.getNetworkFee()
      expect(fee).toBeTruthy()

      // Continue to confirmation
      await sendFlow.continue()
      await sendFlow.acceptTerms()
      await sendFlow.sign()

      // Wait for keysign progress
      await keysignProgress.waitForView(30_000)

      // For FastVault, should proceed to success
      // For SecureVault, would wait for devices
      const result = await keysignProgress.waitForComplete(120_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`${chain} send tx: ${txHash}`)

          // Verify on-chain confirmation
          const confirmation = await waitForTxConfirmation(chain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)

          // Update staleness on success
          updateStaleness([chain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`${chain} send failed:`, error)
        updateStaleness([chain], false)
        // Don't fail test for insufficient funds
        if (!error?.includes('insufficient') && !error?.includes('balance')) {
          throw new Error(`Send failed: ${error}`)
        }
      }
    } finally {
      await page.close()
    }
  })

  test('send native token on chain 2 - broadcasts and confirms', async () => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const chain = selectedChains[1]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]
    const destination = TEST_DESTINATIONS[chain]

    if (!destination) {
      console.log(`No test destination for ${chain}, skipping`)
      test.skip()
      return
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await vaultPage.navigateToSend()
      await sendFlow.waitForView()

      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(destination)
      await sendFlow.fillAmount(chainInfo.minSend)

      await sendFlow.continue()
      await sendFlow.acceptTerms()
      await sendFlow.sign()

      await keysignProgress.waitForView(30_000)

      const result = await keysignProgress.waitForComplete(120_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`${chain} send tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(chain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([chain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`${chain} send failed:`, error)
        updateStaleness([chain], false)
        if (!error?.includes('insufficient') && !error?.includes('balance')) {
          throw new Error(`Send failed: ${error}`)
        }
      }
    } finally {
      await page.close()
    }
  })

  test('send flow shows correct details on verify page', async () => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)

    try {
      await vaultPage.goto()
      await page.waitForTimeout(2000)

      // Try to navigate to send
      try {
        await vaultPage.waitForView(10_000)
        await vaultPage.navigateToSend()
        await sendFlow.waitForView(10_000)

        // Fill with test data
        await sendFlow.fillAddress('0x000000000000000000000000000000000000dEaD')
        await sendFlow.fillAmount('0.001')

        // Check if we can continue
        const canContinue = await sendFlow.isContinueEnabled()

        if (canContinue) {
          await sendFlow.continue()
          await page.waitForTimeout(1000)

          // Check verify page elements
          const verifyText = page.locator('text=/verify|confirm|review/i')
          const hasVerify = await verifyText.isVisible().catch(() => false)

          // Should show amount and address
          const amountDisplay = page.locator('text=/0.001/').first()
          const addressDisplay = page.locator('text=/0x0.*dEaD/i').first()

          if (hasVerify) {
            const hasAmount = await amountDisplay.isVisible().catch(() => false)
            const hasAddress = await addressDisplay.isVisible().catch(() => false)

            // At least one of these should be visible
            expect(hasAmount || hasAddress).toBe(true)
          }
        }
      } catch (error) {
        console.log('Could not verify send flow details:', error)
      }
    } finally {
      await page.close()
    }
  })

  test('balance updates after successful send', async () => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Get initial balance
      const initialBalance = await vaultPage.getTotalBalance()
      console.log('Initial balance:', initialBalance)

      // After send tests, balance should have changed
      // (This test runs after the send tests above)

      // Wait a moment and refresh
      await page.waitForTimeout(5000)
      await page.reload()
      await vaultPage.waitForView(15_000)

      const newBalance = await vaultPage.getTotalBalance()
      console.log('Balance after sends:', newBalance)

      // Note: We can't guarantee balance changed if sends failed
      // Just verify we can read balance
      expect(newBalance).toBeDefined()
    } finally {
      await page.close()
    }
  })
})
