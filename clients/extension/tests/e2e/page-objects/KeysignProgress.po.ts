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
    return (
      this.page.locator('[data-testid="signing-phase"]') ||
      this.page.locator('text=/signing|processing|creating.*transaction/i')
    )
  }

  get broadcastingPhase(): Locator {
    return (
      this.page.locator('[data-testid="broadcasting-phase"]') ||
      this.page.locator('text=/broadcasting|sending|submitting/i')
    )
  }

  get waitingForDevices(): Locator {
    return (
      this.page.locator('[data-testid="waiting-for-devices"]') ||
      this.page.locator('text=/waiting.*device|scan.*qr|other.*device/i')
    )
  }

  get qrCode(): Locator {
    return (
      this.page.locator('[data-testid="keysign-qr"]') ||
      this.page.locator('canvas') ||
      this.page.locator('svg[data-qr="true"]') ||
      this.page.locator('.qr-code')
    )
  }

  get successScreen(): Locator {
    return (
      this.page.locator('[data-testid="keysign-success"]') ||
      this.page.locator('[data-testid="tx-success"]') ||
      this.page.locator('text=/success|complete|sent|confirmed/i')
    )
  }

  get errorScreen(): Locator {
    return (
      this.page.locator('[data-testid="keysign-error"]') ||
      this.page.locator('[data-testid="tx-error"]') ||
      this.page.locator('[role="alert"]') ||
      this.page.locator('text=/error|failed|rejected/i')
    )
  }

  get txHashDisplay(): Locator {
    return (
      this.page.locator('[data-testid="tx-hash"]') ||
      this.page.locator('[data-testid="transaction-hash"]') ||
      this.page.locator('text=/0x[a-fA-F0-9]{64}/').first()
    )
  }

  get txLink(): Locator {
    return (
      this.page.locator('[data-testid="tx-link"]') ||
      this.page.locator('a[href*="explorer"]') ||
      this.page.locator('a[href*="etherscan"]') ||
      this.page.locator('a[href*="mempool"]')
    )
  }

  get errorMessage(): Locator {
    return (
      this.page.locator('[data-testid="error-message"]') ||
      this.page.locator('[role="alert"]')
    )
  }

  get retryButton(): Locator {
    return (
      this.page.locator('[data-testid="retry-button"]') ||
      this.page.getByRole('button', { name: /retry|try again/i })
    )
  }

  get doneButton(): Locator {
    return (
      this.page.locator('[data-testid="done-button"]') ||
      this.page.getByRole('button', { name: /done|close|finish/i })
    )
  }

  get progressIndicator(): Locator {
    return (
      this.page.locator('[data-testid="progress-indicator"]') ||
      this.page.locator('[role="progressbar"]') ||
      this.page.locator('.spinner')
    )
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
   */
  async getTxHash(): Promise<string | null> {
    // Try explicit tx hash display first
    if (await this.txHashDisplay.isVisible()) {
      const text = await this.txHashDisplay.textContent()
      if (text) {
        // Extract hash from text (might be prefixed or formatted)
        const hashMatch = text.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/)
        if (hashMatch) {
          return hashMatch[0]
        }
        return text.trim()
      }
    }

    // Try to get from link
    if (await this.txLink.isVisible()) {
      const href = await this.txLink.getAttribute('href')
      if (href) {
        // Extract hash from explorer URL
        const hashMatch = href.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/)
        if (hashMatch) {
          return hashMatch[0]
        }
      }
    }

    // Try to find any hash on the page
    const pageText = await this.page.textContent('body')
    if (pageText) {
      const hashMatch = pageText.match(/0x[a-fA-F0-9]{64}/)
      if (hashMatch) {
        return hashMatch[0]
      }
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
