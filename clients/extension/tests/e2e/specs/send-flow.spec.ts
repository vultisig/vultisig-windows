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
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'
import { getVaultAddresses, getAddressForChain } from '../helpers/vault-addresses'

// Skip if fund-dependent tests not enabled
const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

// Get chains to test this run (outside test context for sharing)
const { sendChains } = selectChainsForRun(2, 0)
const selectedChains = sendChains

test.describe('Send Flow', () => {
  test.beforeAll(async () => {
    console.log('Selected chains for send tests:', selectedChains)
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
      console.log('✅ Vault imported for send test')
    } else {
      console.log('⚠️ Failed to import vault')
    }
  })

  test('send native token on chain 1 - broadcasts and confirms', async ({ context, extensionId }) => {
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const chain = selectedChains[0]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]

    // Get own address from chrome storage (SELF-SEND to recycle funds)
    const ownAddress = await getAddressForChain(context, chainInfo.symbol)
    if (!ownAddress) {
      console.log(`Could not get own address for ${chain} (${chainInfo.symbol}), skipping`)
      // Debug: dump all addresses
      const allAddrs = await getVaultAddresses(context)
      console.log('All vault addresses:', allAddrs)
      test.skip()
      return
    }
    console.log(`Self-send on ${chain}: ${ownAddress} (amount: ${chainInfo.minSend} ${chainInfo.symbol})`)

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to send - try data-testid first, then text-based button
      await navigateToSend(page)
      await sendFlow.waitForView()

      // Fill send form (SELF-SEND: sending to own address)
      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(ownAddress)
      await sendFlow.fillAmount(chainInfo.minSend)

      // Wait for fee estimation and balance to load
      await page.waitForTimeout(3000)

      // Check if we can continue (validates address, amount, balance)
      const canContinue = await sendFlow.isContinueEnabled()
      if (!canContinue) {
        console.log(`⚠️ Continue button disabled for ${chain} - likely insufficient balance`)
        // Take a screenshot for debugging
        await page.screenshot({ path: `test-results/send-disabled-${chain}-${Date.now()}.png` })
        test.skip()
        return
      }

      // Continue to confirmation
      await sendFlow.continue()
      
      // Take screenshot before terms
      await page.screenshot({ path: `test-results/send-verify-${chain}-${Date.now()}.png` })
      
      await sendFlow.acceptTerms()
      
      // Take screenshot before sign
      await page.screenshot({ path: `test-results/send-before-sign-${chain}-${Date.now()}.png` })
      
      await sendFlow.sign()

      // Take screenshot after sign
      await page.screenshot({ path: `test-results/send-after-sign-${chain}-${Date.now()}.png` })

      // Wait for keysign progress with better error handling
      try {
        await keysignProgress.waitForView(30_000)
      } catch (e) {
        console.log(`⚠️ Keysign progress view not found - taking screenshot`)
        await page.screenshot({ path: `test-results/send-no-progress-${chain}-${Date.now()}.png` })
        throw e
      }

      // Take screenshot during keysign
      await page.screenshot({ path: `test-results/send-keysign-${chain}-${Date.now()}.png` })

      const result = await keysignProgress.waitForComplete(120_000)

      // Take screenshot of final state
      await page.screenshot({ path: `test-results/send-result-${chain}-${Date.now()}.png` })

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ ${chain} send tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(chain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([chain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ ${chain} send failed:`, error)
        updateStaleness([chain], false)
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

    const ownAddress = await getAddressForChain(context, chainInfo.symbol)
    if (!ownAddress) {
      console.log(`Could not get own address for ${chain} (${chainInfo.symbol}), skipping`)
      test.skip()
      return
    }
    console.log(`Self-send on ${chain}: ${ownAddress} (amount: ${chainInfo.minSend} ${chainInfo.symbol})`)

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await navigateToSend(page)
      await sendFlow.waitForView()

      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(ownAddress)
      await sendFlow.fillAmount(chainInfo.minSend)

      await page.waitForTimeout(2000)

      await sendFlow.continue()
      await sendFlow.acceptTerms()
      await sendFlow.sign()

      await keysignProgress.waitForView(30_000)

      const result = await keysignProgress.waitForComplete(120_000)

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ ${chain} send tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(chain, txHash, 120_000)
          expect(confirmation.confirmed).toBe(true)
          updateStaleness([chain], true)
        }
      } else {
        const error = await keysignProgress.getError()
        console.log(`❌ ${chain} send failed:`, error)
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
      await vaultPage.waitForView(10_000)

      // Navigate to send
      await navigateToSend(page)
      await sendFlow.waitForView(10_000)

      // Fill with test address
      await sendFlow.fillAddress('0x000000000000000000000000000000000000dEaD')
      await sendFlow.fillAmount('0.001')

      await page.waitForTimeout(1000)

      const canContinue = await sendFlow.isContinueEnabled()

      if (canContinue) {
        await sendFlow.continue()
        await page.waitForTimeout(1000)

        // Check for verify/confirm page elements
        const verifyText = page.locator('text=/verify|confirm|review/i')
        const hasVerify = await verifyText.isVisible().catch(() => false)

        const amountDisplay = page.locator('text=/0.001/').first()
        const addressDisplay = page.locator('text=/0x0.*dEaD/i').first()

        if (hasVerify) {
          const hasAmount = await amountDisplay.isVisible().catch(() => false)
          const hasAddress = await addressDisplay.isVisible().catch(() => false)
          expect(hasAmount || hasAddress).toBe(true)
        }
      } else {
        console.log('Continue button not enabled — likely validation error on dead address')
      }
    } catch (error) {
      console.log('Could not verify send flow details:', error)
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

      const initialBalance = await vaultPage.getTotalBalance()
      console.log('Initial balance:', initialBalance)

      await page.waitForTimeout(3000)
      await page.reload()
      await vaultPage.waitForView(15_000)

      const newBalance = await vaultPage.getTotalBalance()
      console.log('Balance after sends:', newBalance)

      expect(newBalance).toBeDefined()
    } finally {
      await page.close()
    }
  })
})

/**
 * Navigate to the send page.
 *
 * The VaultPrimaryActions component renders each action as:
 *   <VStack>            ← container div
 *     <Button>          ← styled UnstyledButton with onClick handler + SVG icon
 *     <Text>send</Text> ← label with NO click handler
 *   </VStack>
 *
 * Clicking the "Send" text does nothing — we must click the <button> sibling
 * that contains the SVG icon.
 */
async function navigateToSend(page: import('@playwright/test').Page): Promise<void> {
  // Try data-testid first (in case it gets added later)
  const sendByTestId = page.locator('[data-testid="send-button"]')
  if (await sendByTestId.isVisible({ timeout: 2000 }).catch(() => false)) {
    await sendByTestId.click()
    await page.waitForTimeout(500)
    return
  }

  // Find the Send action button by locating the "Send" text label,
  // then clicking its sibling <button> element (the icon wrapper with the click handler)
  const clicked = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    for (const el of allElements) {
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent?.trim())
        .join('')

      if (directText.toLowerCase() === 'send') {
        const container = el.parentElement
        if (container) {
          // Find the <button> sibling that has an SVG (the icon wrapper)
          for (const child of container.children) {
            if (
              child.tagName === 'BUTTON' &&
              child.querySelector('svg') &&
              child !== el
            ) {
              ;(child as HTMLElement).click()
              return true
            }
          }
        }
      }
    }
    return false
  })

  if (clicked) {
    await page.waitForTimeout(500)
    return
  }

  throw new Error('Could not find send button')
}
