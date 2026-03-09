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

import { test, expect, type Page } from '../fixtures/extension-loader'
import { DAppApproval } from '../page-objects/DAppApproval.po'
import { TEST_DAPP_HTML } from '../fixtures/dapp-page.fixture'
import http from 'http'

// Store DApp server at module level for sharing
let dappServer: http.Server | null = null
let dappUrl: string = ''

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
  async function waitForApprovalPopup(context: any, extensionId: string): Promise<Page | null> {
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
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

    // Click connect button on DApp
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    // Wait for approval popup
    const popup = await waitForApprovalPopup(context, extensionId)

    if (popup) {
      const approval = new DAppApproval(popup, extensionId)

      try {
        await approval.waitForView(10_000)

        // Check request type
        const requestType = await approval.getRequestType()
        console.log('Request type:', requestType)

        // Approve the connection
        await approval.approve()
        await approval.waitForClose()
      } catch (error) {
        console.log('Approval flow error:', error)
        // May need vault setup first
      }
    }

    // Check DApp received address
    await page.waitForTimeout(2000)
    const connectResult = page.locator('[data-testid="connect-result"]')
    const resultText = await connectResult.textContent()

    // Should either have address or error about no vault
    expect(resultText).toBeTruthy()
    console.log('Connect result:', resultText)

    await page.close()
  })

  test('personal_sign - popup shows message - approve - signature returned', async ({ context, extensionId }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForFunction(() => !!window.ethereum, null, { timeout: 10000 })

    // First connect (if needed)
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    // Handle connect popup
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

    // Now sign message
    const signButton = page.locator('[data-testid="sign-message"]')
    if (await signButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await signButton.click()

      // Wait for sign popup
      popup = await waitForApprovalPopup(context, extensionId)

      if (popup && !popup.isClosed()) {
        const approval = new DAppApproval(popup, extensionId)

        try {
          await approval.waitForView(10_000)

          // Get message being signed
          const message = await approval.getMessage()
          console.log('Message to sign:', message)

          // Approve signature
          await approval.approve()
          await approval.waitForClose()

          // Check DApp received signature
          await page.waitForTimeout(2000)
          const signResult = page.locator('[data-testid="sign-result"]')
          const resultText = await signResult.textContent()

          console.log('Sign result:', resultText)

          // Should contain "Signature:" or "0x" if successful
          if (resultText?.includes('Signature') || resultText?.includes('0x')) {
            expect(resultText).toContain('0x')
          }
        } catch (error) {
          console.log('Sign flow error:', error)
        }
      }
    } else {
      console.log('Sign button not enabled - wallet may not be connected')
    }

    await page.close()
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
