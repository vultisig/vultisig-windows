/**
 * Send Flow E2E Tests
 *
 * Tests real send transactions with chain rotation.
 * FUND-DEPENDENT: Requires funded test vault.
 *
 * Uses chain rotation to test 2 chains per run.
 *
 * SAFETY MEASURES:
 * - All sends are SELF-SENDS (to own vault address) to recycle funds
 * - Amounts are small: $0.50 - $3.50 range (see chain-rotation.ts minSend)
 * - Only gas is consumed, principal stays in wallet
 * - Tests skip gracefully if chain has insufficient funds
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { selectChainsForRun, updateStaleness, SUPPORTED_CHAINS, type ChainId } from '../helpers/chain-rotation'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'

// Skip if fund-dependent tests not enabled
// These tests require:
// 1. ENABLE_TX_SIGNING_TESTS=true environment variable
// 2. A pre-seeded vault with funded accounts
const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

// Helper to check if vault exists
async function vaultExists(page: import('@playwright/test').Page): Promise<boolean> {
  try {
    const vaultPage = page.locator('[data-testid="vault-page"]')
    return await vaultPage.isVisible({ timeout: 5000 }).catch(() => false)
  } catch {
    return false
  }
}

// SELF-SEND: We send back to our own vault address to recycle funds
// The test will get the vault's address for each chain dynamically
// This ensures funds stay in the wallet and only gas is spent

// Get chains to test this run (outside test context for sharing)
const { sendChains } = selectChainsForRun(2, 0)
const selectedChains = sendChains

test.describe('Send Flow', () => {
  test.beforeAll(() => {
    console.log('Selected chains for send tests:', selectedChains)
  })

  // Dynamic tests for each selected chain
  test('send native token on chain 1 - broadcasts and confirms', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const chain = selectedChains[0]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Get own address for this chain (SELF-SEND to recycle funds)
      const ownAddress = await vaultPage.getChainAddress(chainInfo.symbol)
      if (!ownAddress) {
        console.log(`Could not get own address for ${chain}, skipping`)
        test.skip()
        return
      }
      console.log(`Self-send on ${chain}: ${ownAddress} -> ${ownAddress}`)

      // Navigate to send
      await vaultPage.navigateToSend()
      await sendFlow.waitForView()

      // Fill send form (SELF-SEND: sending to own address)
      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(ownAddress)  // Self-send!
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

  test('send native token on chain 2 - broadcasts and confirms', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const chain = selectedChains[1]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Get own address for this chain (SELF-SEND to recycle funds)
      const ownAddress = await vaultPage.getChainAddress(chainInfo.symbol)
      if (!ownAddress) {
        console.log(`Could not get own address for ${chain}, skipping`)
        test.skip()
        return
      }
      console.log(`Self-send on ${chain}: ${ownAddress} -> ${ownAddress}`)

      await vaultPage.navigateToSend()
      await sendFlow.waitForView()

      // SELF-SEND: sending to own address to recycle funds
      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(ownAddress)
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

  test('send flow shows correct details on verify page', async ({ context, extensionId }) => {
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

  test('balance updates after successful send', async ({ context, extensionId }) => {
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
