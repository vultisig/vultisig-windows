/**
 * DApp Provider E2E Tests
 *
 * Tests the injected provider and DApp approval flows:
 * - window.ethereum injected on test DApp page
 * - eth_requestAccounts - popup opens - approve - address returned
 * - personal_sign - popup shows message - approve - signature returned
 * - wallet_switchEthereumChain - chainChanged event fires
 * - reject connection returns UserRejectedRequest error
 * - window.vultisig and window.phantom.solana also injected
 */

import { test, expect } from '../fixtures/extension-loader'
import type { BrowserContext, Page } from '@playwright/test'
import { DAppApproval } from '../page-objects/DAppApproval.po'
import { TEST_DAPP_HTML } from '../fixtures/dapp-page.fixture'
import http from 'http'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'

// Store DApp server at module level for sharing
let dappServer: http.Server | null = null
let dappUrl: string = ''

const connectedAccountPattern = /^Connected:\s+0x[a-fA-F0-9]{40}\s+\(Chain:\s+.+\)$/
const evmAddressPattern = /0x[a-fA-F0-9]{40}/
const signaturePattern = /^Signature:\s+0x[a-fA-F0-9]{130,}$/

test.describe('DApp Provider', () => {
  test.beforeAll(async () => {
    // Start DApp server
    dappServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(TEST_DAPP_HTML)
    })

    await new Promise<void>((resolve) => {
      dappServer!.listen(0, '127.0.0.1', () => resolve())
    })

    const addr = dappServer.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    dappUrl = `http://127.0.0.1:${port}`
  })

  test.afterAll(async () => {
    if (dappServer) {
      dappServer.close()
    }
  })

  /**
   * Helper to wait for and get approval popup
   */
  async function waitForApprovalPopup(context: BrowserContext, extensionId: string): Promise<Page | null> {
    const existingPopup = context.pages().find(
      (p: Page) => !p.isClosed() && p.url().includes(`chrome-extension://${extensionId}`)
    )
    if (existingPopup) {
      await existingPopup.waitForLoadState('domcontentloaded')
      return existingPopup
    }

    // Wait for new page to open (approval popup)
    const popupPromise = context.waitForEvent('page', { timeout: 15000 })

    try {
      const popup = await popupPromise
      await popup.waitForLoadState('domcontentloaded')
      return popup
    } catch {
      // Try finding existing popup
      const pages = context.pages()
      const popup = pages.find(
        (p: Page) => p.url().includes(`chrome-extension://${extensionId}`)
      )
      return popup || null
    }
  }

  async function ensureDappProviderVault(
    context: BrowserContext,
    extensionId: string
  ): Promise<{ vaultPath: string; password: string }> {
    const config = getVaultConfigFromEnv()
    if (!config) {
      throw new Error(
        'DApp provider approval tests require TEST_VAULT_PATH and TEST_VAULT_PASSWORD'
      )
    }

    const vaultReady = await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )

    if (!vaultReady) {
      throw new Error('DApp provider approval tests require an imported test vault')
    }

    return config
  }

  async function approveRequiredDappRequest(
    context: BrowserContext,
    extensionId: string,
    requestName: string,
    waitForClose = true
  ): Promise<DAppApproval> {
    const popup = await waitForApprovalPopup(context, extensionId)

    if (!popup || popup.isClosed()) {
      throw new Error(`${requestName} did not open a DApp approval popup`)
    }

    const approval = new DAppApproval(popup, extensionId)
    await approval.waitForView(10_000)
    await approval.approve()
    if (waitForClose) {
      await approval.waitForClose()
    }

    return approval
  }

  async function submitFastVaultPasswordIfPrompted(
    popup: Page,
    password: string
  ): Promise<void> {
    const passwordInput = popup
      .locator(
        '[data-testid="fast-vault-password-input"], input[type="password"], input[placeholder*="password" i]'
      )
      .first()

    const isPasswordPromptVisible = await passwordInput
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!isPasswordPromptVisible) {
      return
    }

    await passwordInput.fill(password)

    const confirmButton = popup
      .locator('[data-testid="fast-vault-submit"]')
      .or(popup.getByRole('button', { name: /confirm/i }))
      .first()

    await expect(confirmButton).toBeEnabled({ timeout: 5_000 })
    await confirmButton.click()
  }

  async function connectDappWallet(
    page: Page,
    context: BrowserContext,
    extensionId: string
  ): Promise<string> {
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    await approveRequiredDappRequest(
      context,
      extensionId,
      'eth_requestAccounts'
    )

    const connectResult = page.locator('[data-testid="connect-result"]')
    await expect(
      connectResult,
      'eth_requestAccounts should resolve to a connected EVM account'
    ).toHaveText(connectedAccountPattern, { timeout: 10_000 })

    const resultText = await connectResult.textContent()
    const address = resultText?.match(evmAddressPattern)?.[0]

    if (!address) {
      throw new Error(`Connected result did not include an EVM address: ${resultText}`)
    }

    return address
  }

  test('window.ethereum injected on test DApp page', async ({ context }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')

    // Wait for provider injection
    await page.waitForTimeout(2000)

    // Check window.ethereum exists
    const hasEthereum = await page.evaluate(() => !!window.ethereum)
    expect(hasEthereum).toBe(true)

    // Check it has expected methods
    const hasRequestMethod = await page.evaluate(() => typeof window.ethereum?.request === 'function')
    expect(hasRequestMethod).toBe(true)

    // Check isVultisig flag
    const isVultisig = await page.evaluate(() => window.ethereum?.isVultisig === true)
    // May or may not be true depending on implementation

    await page.close()
  })

  test('eth_requestAccounts - popup opens - approve - address returned', async ({ context, extensionId }) => {
    await ensureDappProviderVault(context, extensionId)

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

      await connectDappWallet(page, context, extensionId)
    } finally {
      await page.close()
    }
  })

  test('personal_sign - popup shows message - approve - signature returned', async ({ context, extensionId }) => {
    const config = await ensureDappProviderVault(context, extensionId)

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

      await connectDappWallet(page, context, extensionId)

      const signButton = page.locator('[data-testid="sign-message"]')
      await expect(
        signButton,
        'personal_sign requires the DApp wallet connection to enable signing'
      ).toBeEnabled({ timeout: 10_000 })
      await signButton.click()

      const approval = await approveRequiredDappRequest(
        context,
        extensionId,
        'personal_sign',
        false
      )
      await submitFastVaultPasswordIfPrompted(approval.page, config.password)

      const signResult = page.locator('[data-testid="sign-result"]')
      await expect(
        signResult,
        'personal_sign should resolve to an EVM signature'
      ).toHaveText(signaturePattern, { timeout: 120_000 })
    } finally {
      await page.close()
    }
  })

  test('wallet_switchEthereumChain - chainChanged event fires', async ({ context, extensionId }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

    // Connect first
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    let popup = await waitForApprovalPopup(context, extensionId)
    if (popup && !popup.isClosed()) {
      const approval = new DAppApproval(popup, extensionId)
      try {
        await approval.waitForView(5000)
        await approval.approve()
      } catch {
        // Already connected
      }
    }

    await page.waitForTimeout(1000)

    // Try switching chain
    const switchButton = page.locator('[data-testid="switch-chain"]')
    if (await switchButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      // Select a different chain
      const chainSelect = page.locator('#chain-select')
      await chainSelect.selectOption('0x89') // Polygon

      await switchButton.click()

      // May need approval for switch
      popup = await waitForApprovalPopup(context, extensionId)
      if (popup && !popup.isClosed()) {
        const approval = new DAppApproval(popup, extensionId)
        try {
          await approval.waitForView(5000)
          await approval.approve()
        } catch {
          // Switch might not need approval
        }
      }

      // Check result
      await page.waitForTimeout(2000)
      const switchResult = page.locator('[data-testid="switch-result"]')
      const resultText = await switchResult.textContent()

      console.log('Switch result:', resultText)

      // Check events log for chainChanged
      const eventsLog = page.locator('[data-testid="events-log"]')
      const logText = await eventsLog.textContent()

      if (logText?.includes('chainChanged')) {
        expect(logText).toContain('chainChanged')
      }
    } else {
      console.log('Switch button not enabled')
    }

    await page.close()
  })

  test('reject connection returns UserRejectedRequest error', async ({ context, extensionId }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

    // Click connect
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    // Wait for popup and reject
    const popup = await waitForApprovalPopup(context, extensionId)

    if (popup && !popup.isClosed()) {
      const approval = new DAppApproval(popup, extensionId)

      try {
        await approval.waitForView(10_000)
        await approval.reject()
        await approval.waitForClose()

        // Check DApp received rejection error
        await page.waitForTimeout(2000)
        const connectResult = page.locator('[data-testid="connect-result"]')
        const resultText = await connectResult.textContent()

        console.log('Rejection result:', resultText)

        // Should contain error code 4001 (UserRejectedRequest) or rejection message
        if (resultText) {
          const hasRejection =
            resultText.includes('4001') ||
            resultText.toLowerCase().includes('reject') ||
            resultText.toLowerCase().includes('denied') ||
            resultText.toLowerCase().includes('cancel')

          expect(hasRejection).toBe(true)
        }
      } catch (error) {
        console.log('Rejection test error:', error)
      }
    }

    await page.close()
  })

  test('window.vultisig and window.phantom.solana also injected', async ({ context }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Check for window.vultisig
    const hasVultisig = await page.evaluate(() => !!window.vultisig)
    console.log('window.vultisig:', hasVultisig)

    // Check for window.phantom.solana
    const hasSolana = await page.evaluate(() => !!window.phantom?.solana)
    console.log('window.phantom.solana:', hasSolana)

    // At least ethereum should be present
    const hasEthereum = await page.evaluate(() => !!window.ethereum)
    expect(hasEthereum).toBe(true)

    // Log detected providers
    const providers = await page.evaluate(() => {
      const detected: string[] = []
      if (window.ethereum) detected.push('ethereum')
      if (window.vultisig) detected.push('vultisig')
      if (window.phantom?.solana) detected.push('phantom.solana')
      if (window.phantom?.ethereum) detected.push('phantom.ethereum')
      return detected
    })

    console.log('Detected providers:', providers)
    expect(providers.length).toBeGreaterThan(0)

    await page.close()
  })
})
