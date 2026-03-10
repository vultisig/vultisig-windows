/**
 * Keysign Progress Page Object Model
 *
 * Handles the signing progress screens:
 * - waitForSigning() - wait for signing phase
 * - waitForSuccess() - wait for success screen
 * - getError() - get error message if failed
 * - getTxHash() - extract tx hash from success
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class KeysignProgress extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get progressContainer(): Locator {
    return this.page.locator('[data-testid="keysign-progress"]')
  }

  get signingPhase(): Locator {
    return this.page.locator('[data-testid="signing-phase"]').or(this.page.locator('text=/signing|processing|creating.*transaction/i')).first()
  }

  get broadcastingPhase(): Locator {
    return this.page.locator('[data-testid="broadcasting-phase"]').or(this.page.locator('text=/broadcasting|sending|submitting/i')).first()
  }

  get waitingForDevices(): Locator {
    return this.page.locator('[data-testid="waiting-for-devices"]').or(this.page.locator('text=/waiting.*device|scan.*qr|other.*device/i')).first()
  }

  get qrCode(): Locator {
    return this.page.locator('[data-testid="keysign-qr"], canvas, svg[data-qr="true"], .qr-code').first()
  }

  get successScreen(): Locator {
    return this.page.locator('[data-testid="keysign-success"], [data-testid="tx-success"]').or(this.page.locator('text=/success|complete|sent|confirmed/i')).first()
  }

  get errorScreen(): Locator {
    return this.page.locator('[data-testid="keysign-error"], [data-testid="tx-error"], [role="alert"]').or(this.page.locator('text=/error|failed|rejected/i')).first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"], [data-testid="transaction-hash"]').first()
  }

  get txLink(): Locator {
    return this.page.locator('[data-testid="tx-link"], a[href*="explorer"], a[href*="etherscan"], a[href*="mempool"]').first()
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], [role="alert"]').first()
  }

  get retryButton(): Locator {
    return this.page.locator('[data-testid="retry-button"]').or(this.page.getByRole('button', { name: /retry|try again/i })).first()
  }

  get doneButton(): Locator {
    return this.page.locator('[data-testid="done-button"]').or(this.page.getByRole('button', { name: /done|close|finish/i })).first()
  }

  get progressIndicator(): Locator {
    return this.page.locator('[data-testid="progress-indicator"], [role="progressbar"], .spinner').first()
  }

  get progressSteps(): Locator {
    return this.page.locator('[data-testid^="progress-step-"]')
  }

  /**
   * Wait for keysign progress view
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await Promise.race([
      this.progressContainer.waitFor({ state: 'visible', timeout }),
      this.signingPhase.waitFor({ state: 'visible', timeout }),
      this.waitingForDevices.waitFor({ state: 'visible', timeout }),
      this.qrCode.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Wait for signing phase to start
   */
  async waitForSigning(timeout = 30_000): Promise<void> {
    await this.signingPhase.waitFor({ state: 'visible', timeout })
  }

  /**
   * Wait for "waiting for devices" state (SecureVault)
   */
  async waitForWaitingForDevices(timeout = 30_000): Promise<void> {
    await this.waitingForDevices.waitFor({ state: 'visible', timeout })
  }

  /**
   * Check if QR code is displayed
   */
  async isQrCodeVisible(): Promise<boolean> {
    return this.qrCode.isVisible()
  }

  /**
   * Wait for transaction success
   */
  async waitForSuccess(timeout = 120_000): Promise<void> {
    await this.successScreen.waitFor({ state: 'visible', timeout })
  }

  /**
   * Wait for error state
   */
  async waitForError(timeout = 60_000): Promise<void> {
    await this.errorScreen.waitFor({ state: 'visible', timeout })
  }

  /**
   * Check if transaction succeeded
   */
  async isSuccess(): Promise<boolean> {
    return this.successScreen.isVisible()
  }

  /**
   * Check if transaction failed
   */
  async isError(): Promise<boolean> {
    return this.errorScreen.isVisible()
  }

  /**
   * Get error message
   */
  async getError(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return (await this.errorMessage.textContent()) || null
    }

    if (await this.errorScreen.isVisible()) {
      return (await this.errorScreen.textContent()) || 'Unknown error'
    }

    return null
  }

  /**
   * Get transaction hash from success screen
   * 
   * The Vultisig UI displays a truncated hash (e.g., "0x04...b3e9") via MiddleTruncate
   * component, and provides a copy button that copies the FULL explorer URL 
   * (e.g., "https://etherscan.io/tx/0x..."). We click the copy button and extract 
   * the hash from the clipboard URL.
   */
  async getTxHash(): Promise<string | null> {
    // Strategy 1: Click the copy button next to the tx hash and read from clipboard
    // This is the most reliable method as the copy button copies the explorer URL
    // which contains the full tx hash
    const txHashRow = this.page.locator('text=/transaction.?hash|tx.?hash/i').first()
    
    if (await txHashRow.isVisible().catch(() => false)) {
      try {
        // Grant clipboard permissions
        await this.page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
        
        // Find the copy button - it's in the parent container of the tx hash label
        const txHashParent = txHashRow.locator('..').locator('..')
        const buttonsInRow = txHashParent.locator('[role="button"]')
        
        if (await buttonsInRow.count() > 0) {
          // First button is the copy button (ClipboardCopyIcon)
          await buttonsInRow.first().click()
          await this.page.waitForTimeout(300)
          
          // Read clipboard
          const clipboardText = await this.page.evaluate(async () => {
            try {
              return await navigator.clipboard.readText()
            } catch {
              return null
            }
          })
          
          if (clipboardText) {
            // Extract hash from explorer URL (e.g., https://etherscan.io/tx/0x123...)
            // Supports EVM (0x...), Bitcoin, and other hash formats
            const hashMatch = clipboardText.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/)
            if (hashMatch) {
              return hashMatch[0]
            }
          }
        }
      } catch {
        // Clipboard approach failed, try fallbacks
      }
    }
    
    // Strategy 2: Try to extract from React component props
    // The MiddleTruncate component receives the full hash as a 'text' prop
    const hashFromReact = await this.page.evaluate(() => {
      const findReactFiber = (el: Element): any => {
        for (const key of Object.keys(el)) {
          if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
            return (el as any)[key]
          }
        }
        return null
      }
      
      // Find truncated hash spans and extract full value from React props
      const spans = document.querySelectorAll('span')
      for (const span of spans) {
        const text = span.textContent || ''
        if (text.match(/0x[a-fA-F0-9]{2,8}\.{3}[a-fA-F0-9]{2,8}/)) {
          let current: Element | null = span
          for (let i = 0; i < 10 && current; i++) {
            const fiber = findReactFiber(current)
            if (fiber) {
              let node = fiber
              for (let j = 0; j < 20 && node; j++) {
                const props = node.memoizedProps || node.pendingProps || {}
                if (props.text?.match?.(/^0x[a-fA-F0-9]{64}$/)) return props.text
                if (props.hash?.match?.(/^0x[a-fA-F0-9]{64}$/)) return props.hash
                if (props.txHash?.match?.(/^0x[a-fA-F0-9]{64}$/)) return props.txHash
                node = node.return
              }
            }
            current = current.parentElement
          }
        }
      }
      
      // Check data attributes
      for (const el of document.querySelectorAll('*')) {
        for (const attr of el.attributes) {
          const match = attr.value.match(/0x[a-fA-F0-9]{64}/)
          if (match) return match[0]
        }
      }
      
      return null
    })
    
    if (hashFromReact) return hashFromReact
    
    // Fallback: Try explicit test-id locators
    if (await this.txHashDisplay.isVisible()) {
      const text = await this.txHashDisplay.textContent()
      const match = text?.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/)
      if (match) return match[0]
    }

    if (await this.txLink.isVisible()) {
      const href = await this.txLink.getAttribute('href')
      const match = href?.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/)
      if (match) return match[0]
    }

    return null
  }

  /**
   * Get explorer link for transaction
   */
  async getExplorerLink(): Promise<string | null> {
    if (await this.txLink.isVisible()) {
      return this.txLink.getAttribute('href')
    }
    return null
  }

  /**
   * Click retry button
   */
  async retry(): Promise<void> {
    await this.retryButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Click done button to close
   */
  async done(): Promise<void> {
    await this.doneButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Get current progress step
   */
  async getCurrentStep(): Promise<string | null> {
    const steps = await this.progressSteps.all()

    for (const step of steps) {
      const isActive = await step.getAttribute('data-active')
      if (isActive === 'true') {
        return step.textContent()
      }
    }

    return null
  }

  /**
   * Wait for final state (success or error)
   */
  async waitForComplete(timeout = 120_000): Promise<'success' | 'error'> {
    await Promise.race([
      this.successScreen.waitFor({ state: 'visible', timeout }),
      this.errorScreen.waitFor({ state: 'visible', timeout }),
    ])

    if (await this.isSuccess()) {
      return 'success'
    }

    return 'error'
  }
}
