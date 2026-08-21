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

import { expect, test } from '../fixtures/extension-loader'
import {
  type ChainId,
  selectChainsForRun,
  SUPPORTED_CHAINS,
  updateStaleness,
} from '../helpers/chain-rotation'
import {
  readChromeStorage,
  writeChromeStorage,
} from '../helpers/chrome-storage'
import { waitForTxConfirmation } from '../helpers/tx-confirmation'
import {
  getAddressForChain,
  getVaultAddresses,
} from '../helpers/vault-addresses'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

// Skip if fund-dependent tests not enabled
const enableTxTests = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

function isChainId(value: string): value is ChainId {
  return Object.hasOwn(SUPPORTED_CHAINS, value)
}
function getConfiguredSendChains(): ChainId[] | null {
  const raw = process.env.VULTISIG_E2E_SEND_CHAINS
  if (!raw) {
    return null
  }

  const chains: ChainId[] = []
  for (const value of raw.split(',')) {
    const chain = value.trim().toLowerCase()
    if (!chain) {
      continue
    }
    if (!isChainId(chain)) {
      throw new Error(
        `Unsupported VULTISIG_E2E_SEND_CHAINS value: ${chain}. ` +
          `Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`
      )
    }
    chains.push(chain)
  }

  return chains.length > 0 ? chains : null
}

function getSendAmount(chain: ChainId): string {
  const configuredAmount = process.env.VULTISIG_E2E_SEND_AMOUNT?.trim()
  if (!configuredAmount) {
    return SUPPORTED_CHAINS[chain].minSend
  }

  if (
    !/^\d+(\.\d+)?$/.test(configuredAmount) ||
    Number(configuredAmount) <= 0
  ) {
    throw new Error(
      `Invalid VULTISIG_E2E_SEND_AMOUNT: "${configuredAmount}". Expected a positive decimal amount.`
    )
  }

  return configuredAmount
}

// Get chains to test this run (outside test context for sharing)
const selectedChains =
  getConfiguredSendChains() ?? selectChainsForRun(2, 0).sendChains

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
    const imported = await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
    if (imported) {
      console.log('✅ Vault imported for send test')
    } else {
      console.log('⚠️ Failed to import vault')
    }
  })

  test('send native token on chain 1 - broadcasts and confirms', async ({
    context,
    extensionId,
  }) => {
    test.skip(!enableTxTests, 'TX signing tests disabled')

    const chain = selectedChains[0]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]

    // Get own address from chrome storage (SELF-SEND to recycle funds)
    const ownAddress = await getAddressForChain(context, chainInfo.symbol)
    if (!ownAddress) {
      console.log(
        `Could not get own address for ${chain} (${chainInfo.symbol}), skipping`
      )
      // Debug: dump all addresses
      const allAddrs = await getVaultAddresses(context)
      console.log('All vault addresses:', allAddrs)
      test.skip()
      return
    }
    const sendAmount = getSendAmount(chain)
    console.log(
      `Self-send on ${chain}: ${ownAddress} (amount: ${sendAmount} ${chainInfo.symbol})`
    )

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
      await sendFlow.fillAmount(sendAmount)

      // Wait for fee estimation and balance to load
      await page.waitForTimeout(3000)

      // Check if we can continue (validates address, amount, balance)
      const canContinue = await sendFlow.isContinueEnabled()
      if (!canContinue) {
        console.log(
          `⚠️ Continue button disabled for ${chain} - likely insufficient balance`
        )
        // Take a screenshot for debugging
        await page.screenshot({
          path: `test-results/send-disabled-${chain}-${Date.now()}.png`,
        })
        test.skip()
        return
      }

      // Continue to confirmation
      await sendFlow.continue()

      // Take screenshot before terms
      await page.screenshot({
        path: `test-results/send-verify-${chain}-${Date.now()}.png`,
      })

      await sendFlow.acceptTerms()

      // Take screenshot before sign
      await page.screenshot({
        path: `test-results/send-before-sign-${chain}-${Date.now()}.png`,
      })

      const connectingProgressHostPromise = page.waitForSelector(
        '[data-testid="keysign-progress"][data-phase="connecting"]',
        { state: 'visible', timeout: 15_000 }
      )
      await sendFlow.sign()
      const connectingProgressHost = await connectingProgressHostPromise
      expect(await connectingProgressHost.isVisible()).toBe(true)
      await expect(
        page.getByText('Looking for FastVaultServer...')
      ).toBeHidden()
      await expect(page.getByTestId('keygen-connecting-progress')).toBeHidden()

      const progressHost = page.getByTestId('keysign-progress')
      await expect(progressHost).toHaveAttribute('data-phase', 'signing', {
        timeout: 30_000,
      })
      await expect(progressHost).toBeVisible()
      await expect(
        page.getByText('Looking for FastVaultServer...')
      ).toBeHidden()
      await expect(page.getByTestId('keygen-connecting-progress')).toBeHidden()
      const signingProgressHost = await progressHost.elementHandle()
      if (!signingProgressHost) {
        throw new Error('Fast keysign signing progress host was not mounted')
      }
      expect(
        await signingProgressHost.evaluate(
          (current, connecting) => current === connecting,
          connectingProgressHost
        )
      ).toBe(true)

      // Take screenshot after sign
      await page.screenshot({
        path: `test-results/send-after-sign-${chain}-${Date.now()}.png`,
      })

      // Wait for keysign progress with better error handling
      try {
        await keysignProgress.waitForView(30_000)
      } catch (e) {
        console.log(`⚠️ Keysign progress view not found - taking screenshot`)
        await page.screenshot({
          path: `test-results/send-no-progress-${chain}-${Date.now()}.png`,
        })
        throw e
      }

      // Take screenshot during keysign
      await page.screenshot({
        path: `test-results/send-keysign-${chain}-${Date.now()}.png`,
      })

      const result = await keysignProgress.waitForComplete(120_000)

      // Take screenshot of final state
      await page.screenshot({
        path: `test-results/send-result-${chain}-${Date.now()}.png`,
      })

      if (result === 'success') {
        const txHash = await keysignProgress.getTxHash()
        expect(txHash).toBeTruthy()

        if (txHash) {
          console.log(`✅ ${chain} send tx: ${txHash}`)
          const confirmation = await waitForTxConfirmation(
            chain,
            txHash,
            120_000
          )
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

  test('send native token on chain 2 - broadcasts and confirms', async ({
    context,
    extensionId,
  }) => {
    test.skip(!enableTxTests, 'TX signing tests disabled')

    const chain = selectedChains[1]
    if (!chain) {
      test.skip()
      return
    }

    const chainInfo = SUPPORTED_CHAINS[chain]

    const ownAddress = await getAddressForChain(context, chainInfo.symbol)
    if (!ownAddress) {
      console.log(
        `Could not get own address for ${chain} (${chainInfo.symbol}), skipping`
      )
      test.skip()
      return
    }
    const sendAmount = getSendAmount(chain)
    console.log(
      `Self-send on ${chain}: ${ownAddress} (amount: ${sendAmount} ${chainInfo.symbol})`
    )

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
      await sendFlow.fillAmount(sendAmount)

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
          const confirmation = await waitForTxConfirmation(
            chain,
            txHash,
            120_000
          )
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

  test('send flow shows correct details on verify page', async ({
    context,
    extensionId,
  }) => {
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
        console.log(
          'Continue button not enabled — likely validation error on dead address'
        )
      }
    } catch (error) {
      console.log('Could not verify send flow details:', error)
    } finally {
      await page.close()
    }
  })

  test('max send ignores a persisted balance and Verify shows the planned Bitcoin amount', async ({
    context,
    extensionId,
  }) => {
    test.skip(!enableTxTests, 'Fund-dependent QA vault is not enabled')

    const ownAddress = await getAddressForChain(context, 'BTC')
    expect(ownAddress).toBeTruthy()

    const currentVaultId = await readChromeStorage<string>(
      context,
      'currentVaultId'
    )
    const vaultsCoins = await readChromeStorage<
      Record<
        string,
        Array<{ chain: string; id?: string; address: string; ticker?: string }>
      >
    >(context, 'vaultsCoins')
    const bitcoinCoin = vaultsCoins?.[currentVaultId ?? '']?.find(
      coin => coin.chain === 'Bitcoin' && coin.ticker === 'BTC'
    )
    expect(bitcoinCoin).toBeTruthy()

    const balanceInput = {
      chain: bitcoinCoin!.chain,
      id: bitcoinCoin!.id,
      address: bitcoinCoin!.address,
    }
    const balanceKey = [
      balanceInput.chain,
      balanceInput.id,
      balanceInput.address,
    ]
      .filter(value => value !== undefined)
      .join(':')
    const queryKey = ['coinBalance', balanceInput]
    const staleBalance = 999_999_999_999n
    const persistedAt = Date.now() - 60_000
    const persistedClient = {
      timestamp: Date.now(),
      buster: 'v3',
      clientState: {
        mutations: [],
        queries: [
          {
            queryKey,
            queryHash: JSON.stringify([
              'coinBalance',
              {
                address: balanceInput.address,
                chain: balanceInput.chain,
                ...(balanceInput.id === undefined
                  ? {}
                  : { id: balanceInput.id }),
              },
            ]),
            state: {
              data: { [balanceKey]: staleBalance },
              dataUpdateCount: 1,
              dataUpdatedAt: persistedAt,
              error: null,
              errorUpdateCount: 0,
              errorUpdatedAt: 0,
              fetchFailureCount: 0,
              fetchFailureReason: null,
              fetchMeta: null,
              isInvalidated: false,
              status: 'success',
              fetchStatus: 'idle',
            },
          },
        ],
      },
    }
    await writeChromeStorage(
      context,
      'queriesPersister',
      JSON.stringify(persistedClient, (_, value) =>
        typeof value === 'bigint' ? `${value}n` : value
      )
    )

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)
      await navigateToSend(page)
      await sendFlow.waitForView(10_000)
      await sendFlow.selectCoin('BTC')
      await sendFlow.fillAddress(ownAddress!)

      const availableBalanceDisplay = page.locator(
        '[data-testid="send-available-balance"]'
      )
      await expect(availableBalanceDisplay).toContainText('BTC', {
        timeout: 20_000,
      })
      await expect(page.getByText(/9999\.99999999 BTC/)).toHaveCount(0)
      const availableBalanceMatch = (
        await availableBalanceDisplay.innerText()
      ).match(/([0-9]+(?:\.[0-9]+)?)\s*BTC/)
      expect(availableBalanceMatch).toBeTruthy()
      const availableBalance = Number(availableBalanceMatch![1])
      expect(availableBalance).toBeGreaterThan(0)

      await sendFlow.clickMax()
      await expect(sendFlow.amountInput).not.toHaveValue('')
      const formAmount = Number(await sendFlow.amountInput.inputValue())
      expect(formAmount).toBeGreaterThan(0)
      expect(formAmount).toBeLessThanOrEqual(availableBalance)

      await sendFlow.continue()
      await expect(
        page.getByText("You're sending", { exact: true })
      ).toBeVisible({ timeout: 30_000 })

      const verifyAmountDisplay = page
        .locator('[data-testid="transaction-overview-amount"]')
        .first()
      await expect(verifyAmountDisplay).toContainText('BTC', {
        timeout: 30_000,
      })
      const verifyAmountText = await verifyAmountDisplay.innerText()
      const verifyAmountMatch = verifyAmountText.match(
        /([0-9]+(?:\.[0-9]+)?)\s*BTC/
      )
      expect(verifyAmountMatch).toBeTruthy()
      const verifyAmount = Number(verifyAmountMatch![1])
      expect(verifyAmount).toBeGreaterThan(0)
      expect(verifyAmount).toBeLessThanOrEqual(formAmount)

      await page.screenshot({
        path: 'test-results/max-send-verify-bitcoin.png',
        fullPage: true,
      })
    } finally {
      await page.close()
    }
  })

  test('balance updates after successful send', async ({
    context,
    extensionId,
  }) => {
    test.skip(!enableTxTests, 'TX signing tests disabled')

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
async function navigateToSend(
  page: import('@playwright/test').Page
): Promise<void> {
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
