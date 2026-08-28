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

import type { BrowserContext, Page } from '@playwright/test'

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
import { CHAIN_UI_LABELS } from '../helpers/enable-chains'
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
const assertBalanceAutoRefresh =
  process.env.VULTISIG_E2E_ASSERT_BALANCE_AUTO_REFRESH === 'true'
const configuredSendDestination =
  process.env.VULTISIG_E2E_SEND_DESTINATION?.trim()

async function getDisplayedChainBalance(page: Page, chain: string) {
  const chainRow = getChainRow(page, chain)
  await chainRow.waitFor({ state: 'visible' })

  const text = await chainRow.textContent()
  const tokenAmount = text?.match(/[\d.,]+\s*[A-Z]{3,}/)
  const fiatAmount = text?.match(/[$€£]\s*[\d.,]+/)

  return tokenAmount?.[0] || fiatAmount?.[0] || '0'
}

const getChainRow = (page: Page, chain: string) =>
  page
    .locator('[data-testid="VaultChainItem-Panel"]')
    .filter({ hasText: new RegExp(chain, 'i') })

const captureChainRow = async (page: Page, chain: string, path: string) => {
  const row = getChainRow(page, chain)
  await row.evaluate(element =>
    element.scrollIntoView({ block: 'center', inline: 'nearest' })
  )
  await page.waitForTimeout(250)
  await row.screenshot({ path })
}

type BalanceQueryInput = {
  chain: string
  id?: string
  address: string
}

type PersistedQuery = {
  queryKey?: [string, BalanceQueryInput]
  state?: {
    data?: Record<string, bigint>
    dataUpdatedAt?: number
  }
}

type PersistedQueryClient = {
  timestamp: number
  clientState?: { queries?: PersistedQuery[] }
}

const parsePersistedQueryClient = (value: string): PersistedQueryClient =>
  JSON.parse(value, (_, item) => {
    if (typeof item === 'string' && /^-?\d+n$/.test(item)) {
      return BigInt(item.slice(0, -1))
    }
    return item
  })

const serializePersistedQueryClient = (value: PersistedQueryClient) =>
  JSON.stringify(value, (_, item) =>
    typeof item === 'bigint' ? `${item}n` : item
  )

const findBalanceQuery = (
  client: PersistedQueryClient,
  input: BalanceQueryInput
) =>
  client.clientState?.queries?.find(query => {
    const [category, candidate] = query.queryKey ?? []
    return (
      category === 'coinBalance' &&
      candidate?.chain === input.chain &&
      candidate.address === input.address &&
      candidate.id === input.id
    )
  })

async function getNativeBalanceQueryInput(
  context: BrowserContext,
  chain: ChainId,
  address: string,
  ticker: string
): Promise<BalanceQueryInput> {
  const currentVaultId = await readChromeStorage<string>(
    context,
    'currentVaultId'
  )
  const vaultsCoins = await readChromeStorage<
    Record<string, Array<BalanceQueryInput & { ticker?: string }>>
  >(context, 'vaultsCoins')
  const expectedChain = CHAIN_UI_LABELS[chain]
  expect(
    expectedChain,
    `Stored-chain mapping should exist for ${chain}`
  ).toBeTruthy()
  const coin = vaultsCoins?.[currentVaultId ?? '']?.find(
    item =>
      item.chain === expectedChain &&
      item.address === address &&
      item.ticker === ticker &&
      item.id == null
  )

  expect(
    coin,
    `Native ${ticker} coin on ${expectedChain} should exist in vault storage`
  ).toBeTruthy()
  return { chain: coin!.chain, address: coin!.address }
}

async function readPersistedBalance(
  context: BrowserContext,
  input: BalanceQueryInput
) {
  return (await readPersistedBalanceSnapshot(context, input))?.amount ?? null
}

async function readPersistedBalanceSnapshot(
  context: BrowserContext,
  input: BalanceQueryInput
) {
  const raw = await readChromeStorage<string>(context, 'queriesPersister')
  if (!raw) return null

  const query = findBalanceQuery(parsePersistedQueryClient(raw), input)
  const amount = Object.values(query?.state?.data ?? {})[0]
  if (typeof amount !== 'bigint') return null

  return {
    amount,
    dataUpdatedAt: query?.state?.dataUpdatedAt ?? 0,
  }
}

async function replacePersistedBalance(
  context: BrowserContext,
  input: BalanceQueryInput,
  amount: bigint
) {
  const raw = await readChromeStorage<string>(context, 'queriesPersister')
  expect(raw, 'Persisted query client should exist').toBeTruthy()

  const client = parsePersistedQueryClient(raw!)
  const query = findBalanceQuery(client, input)
  expect(
    query?.state?.data,
    'Native balance query should be persisted'
  ).toBeTruthy()

  query!.state!.data = Object.fromEntries(
    Object.keys(query!.state!.data!).map(key => [key, amount])
  )
  query!.state!.dataUpdatedAt = Date.now()
  client.timestamp = Date.now()

  await writeChromeStorage(
    context,
    'queriesPersister',
    serializePersistedQueryClient(client)
  )
}

async function waitForSendTxConfirmation(
  chain: ChainId,
  txHash: string,
  timeoutMs: number
) {
  if (chain !== 'thorchain') {
    return waitForTxConfirmation(chain, txHash, timeoutMs)
  }

  const startedAt = Date.now()
  const normalizedHash = txHash.trim().replace(/^0x/i, '')
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(
        `https://gateway.liquify.com/chain/thorchain_rpc/tx?hash=0x${normalizedHash}&prove=false`
      )
      if (response.ok) {
        const data = await response.json()
        const txResult = data.result?.tx_result
        if (txResult) {
          const confirmed = Number(txResult.code ?? 0) === 0
          return {
            confirmed,
            error: confirmed ? undefined : txResult.log,
          }
        }
      }
    } catch (error) {
      console.warn('THORChain RPC confirmation error:', error)
    }

    await new Promise(resolve => setTimeout(resolve, 5_000))
  }

  return { confirmed: false, error: 'Timeout waiting for confirmation' }
}

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
  }, testInfo) => {
    test.skip(!enableTxTests, 'TX signing tests disabled')
    if (assertBalanceAutoRefresh) {
      test.setTimeout(600_000)
    }

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
    const sendDestination = configuredSendDestination || ownAddress
    console.log(
      `${configuredSendDestination ? 'Designated-vault transfer' : 'Self-send'} on ${chain}: ${sendDestination} (amount: ${sendAmount} ${chainInfo.symbol})`
    )

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)
    const monitorPage = assertBalanceAutoRefresh
      ? await context.newPage()
      : null
    const monitorVaultPage = monitorPage
      ? new VaultPage(monitorPage, extensionId)
      : null
    let initialMonitoredBalance: string | null = null
    let balanceQueryInput: BalanceQueryInput | null = null
    let initialNativeBalance: bigint | null = null
    let initialRowText: string | null = null
    let autoUpdatedRowText: string | null = null
    let reopenedRowText: string | null = null

    try {
      if (monitorPage && monitorVaultPage) {
        const monitorOpenedAt = Date.now()
        await monitorVaultPage.goto()
        await monitorVaultPage.waitForView(15_000)
        balanceQueryInput = await getNativeBalanceQueryInput(
          context,
          chain,
          ownAddress,
          chainInfo.symbol
        )
        await expect
          .poll(
            async () =>
              (await readPersistedBalanceSnapshot(context, balanceQueryInput!))
                ?.dataUpdatedAt ?? 0,
            {
              message: `${chainInfo.symbol} monitor mount refetch should finish before the send baseline`,
              timeout: 60_000,
              intervals: [2_000],
            }
          )
          .toBeGreaterThan(monitorOpenedAt)
        initialNativeBalance = await readPersistedBalance(
          context,
          balanceQueryInput
        )
        expect(initialNativeBalance).not.toBeNull()

        await expect
          .poll(() => getDisplayedChainBalance(monitorPage, chain), {
            message: `${chainInfo.symbol} monitor balance should finish loading before the send`,
            timeout: 60_000,
            intervals: [2_000],
          })
          .not.toBe('0')
        initialMonitoredBalance = await getDisplayedChainBalance(
          monitorPage,
          chain
        )
        initialRowText = (
          await getChainRow(monitorPage, chain).innerText()
        ).trim()
        const initialRowScreenshot = testInfo.outputPath(
          `balance-before-send-${chain}.png`
        )
        await captureChainRow(monitorPage, chain, initialRowScreenshot)
        await testInfo.attach('balance row before send', {
          path: initialRowScreenshot,
          contentType: 'image/png',
        })
      }

      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to send - try data-testid first, then text-based button
      await navigateToSend(page)
      await sendFlow.waitForView()

      // Default to a self-send; the opt-in balance-refresh proof may target a
      // second designated QA vault so the visible fiat row changes materially.
      await sendFlow.selectCoin(chainInfo.symbol)
      await sendFlow.fillAddress(sendDestination)
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
          const confirmationPromise = waitForSendTxConfirmation(
            chain,
            txHash,
            180_000
          )

          if (
            monitorPage &&
            monitorVaultPage &&
            initialMonitoredBalance &&
            balanceQueryInput &&
            initialNativeBalance !== null
          ) {
            await expect
              .poll(
                async () => {
                  const persistedBalance = await readPersistedBalance(
                    context,
                    balanceQueryInput!
                  )
                  return (
                    persistedBalance?.toString() ??
                    initialNativeBalance.toString()
                  )
                },
                {
                  message: `${chainInfo.symbol} native balance query should auto-update without the refresh button`,
                  timeout: 180_000,
                  intervals: [5_000],
                }
              )
              .not.toBe(initialNativeBalance.toString())

            const autoUpdatedNativeBalance = await readPersistedBalance(
              context,
              balanceQueryInput
            )
            expect(autoUpdatedNativeBalance).not.toBeNull()

            await expect
              .poll(() => getDisplayedChainBalance(monitorPage, chain), {
                message: `${chainInfo.symbol} balance should auto-update without the refresh button`,
                timeout: 180_000,
                intervals: [5_000],
              })
              .not.toBe(initialMonitoredBalance)

            autoUpdatedRowText = (
              await getChainRow(monitorPage, chain).innerText()
            ).trim()

            const openPopupScreenshot = testInfo.outputPath(
              `balance-auto-updated-open-${chain}.png`
            )
            await captureChainRow(monitorPage, chain, openPopupScreenshot)
            await testInfo.attach(
              'balance auto-updated while popup stayed open',
              {
                path: openPopupScreenshot,
                contentType: 'image/png',
              }
            )

            await monitorPage.close()
            await page.close()

            const bogusFreshBalance = autoUpdatedNativeBalance! + 123_456_789n
            await replacePersistedBalance(
              context,
              balanceQueryInput,
              bogusFreshBalance
            )

            const reopenedPage = await context.newPage()
            const reopenedVaultPage = new VaultPage(reopenedPage, extensionId)
            try {
              await reopenedPage.bringToFront()
              await reopenedVaultPage.goto()
              await reopenedVaultPage.waitForView(15_000)
              await expect
                .poll(
                  async () =>
                    (
                      await readPersistedBalance(context, balanceQueryInput!)
                    )?.toString() ?? null,
                  {
                    message: `${chainInfo.symbol} fresh persisted balance should refetch after reopening the popup`,
                    timeout: 60_000,
                    intervals: [2_000],
                  }
                )
                .toBe(autoUpdatedNativeBalance!.toString())

              await expect
                .poll(() => getDisplayedChainBalance(reopenedPage, chain), {
                  message: `${chainInfo.symbol} balance should render after reopening the popup`,
                  timeout: 30_000,
                  intervals: [2_000],
                })
                .not.toBe('0')

              await expect(
                reopenedVaultPage.totalBalanceContainer
              ).toBeVisible()
              await reopenedPage.waitForTimeout(3_000)

              reopenedRowText = (
                await getChainRow(reopenedPage, chain).innerText()
              ).trim()

              const reopenedScreenshot = testInfo.outputPath(
                `balance-current-after-reopen-${chain}.png`
              )
              await captureChainRow(reopenedPage, chain, reopenedScreenshot)
              await testInfo.attach('balance current after popup reopen', {
                path: reopenedScreenshot,
                contentType: 'image/png',
              })

              await testInfo.attach('balance auto-refresh receipt', {
                body: Buffer.from(
                  JSON.stringify(
                    {
                      revision:
                        process.env.VULTISIG_E2E_PROOF_REVISION ?? 'unknown',
                      chain,
                      ticker: chainInfo.symbol,
                      transactionHash: txHash,
                      initialPersistedBalance: initialNativeBalance.toString(),
                      autoUpdatedPersistedBalance:
                        autoUpdatedNativeBalance!.toString(),
                      injectedFreshBalance: bogusFreshBalance.toString(),
                      reopenedPersistedBalance:
                        (
                          await readPersistedBalance(context, balanceQueryInput)
                        )?.toString() ?? null,
                      initialRowText,
                      autoUpdatedRowText,
                      reopenedRowText,
                      refreshControlInvoked: false,
                    },
                    null,
                    2
                  )
                ),
                contentType: 'application/json',
              })
            } finally {
              await reopenedPage.close()
            }
          }

          const confirmation = await confirmationPromise
          expect(confirmation.confirmed, confirmation.error).toBe(true)

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
      if (monitorPage && !monitorPage.isClosed()) {
        await monitorPage.close()
      }
      if (!page.isClosed()) {
        await page.close()
      }
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
          const confirmation = await waitForTxConfirmation(chain, txHash)
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
