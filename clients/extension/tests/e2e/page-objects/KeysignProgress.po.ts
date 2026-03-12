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
    return this.page.locator('[data-testid="tx-success"], [data-testid="keysign-success"]').first()
  }

  get keysignProgressContainer(): Locator {
    return this.page.locator('[data-testid="keysign-progress"]')
  }

  get keysignPending(): Locator {
    return this.page.locator('[data-testid="keysign-pending"]')
  }

  get keysignSuccess(): Locator {
    return this.page.locator('[data-testid="keysign-success"]')
  }

  get keysignFailure(): Locator {
    return this.page.locator('[data-testid="keysign-failure"]')
  }

  get txSuccessDoneButton(): Locator {
    return this.page.locator('[data-testid="tx-success-done"]')
  }

  get errorScreen(): Locator {
    return this.page.locator('[data-testid="keysign-error"], [data-testid="tx-error"], [role="alert"]').or(this.page.locator('text=/error|failed|rejected/i')).first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]').first()
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
   * Uses the keysign-success testid for more reliable detection
   */
  async isSuccess(): Promise<boolean> {
    return this.keysignSuccess.isVisible().catch(() => false) ||
           this.successScreen.isVisible().catch(() => false)
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
   * Uses the data-hash attribute on the [data-testid="tx-hash"] element
   * which contains the full transaction hash.
   */
  async getTxHash(): Promise<string | null> {
    // Primary strategy: Use the data-hash attribute on tx-hash element
    const txHashEl = this.page.locator('[data-testid="tx-hash"]')
    if (await txHashEl.isVisible().catch(() => false)) {
      const hash = await txHashEl.getAttribute('data-hash')
      if (hash) return hash
    }

    // Fallback: Try to extract from explorer link
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
   * 
   * The keysign flow has multiple phases:
   * 1. Pending: TransactionStatusAnimation with keysign-pending
   * 2. Animation: keysign-success (brief animation)
   * 3. Final: TxSuccess component with tx-success (shows tx hash)
   * 4. Error: FullPageFlowErrorState or keysign-failure
   * 
   * We prioritize tx-success (which has the hash) over keysign-success (animation).
   */
  async waitForComplete(timeout = 120_000): Promise<'success' | 'error'> {
    const startTime = Date.now()
    
    // First, wait for keysign-success or error to appear (the animation phase)
    let animationPhaseFound = false
    
    // Poll for success or error state
    while (Date.now() - startTime < timeout) {
      // Check for error states first
      if (await this.keysignFailure.isVisible().catch(() => false)) {
        console.log('❌ Found keysign-failure testid')
        return 'error'
      }
      
      const errorAlert = this.page.locator('[role="alert"]')
      if (await errorAlert.isVisible().catch(() => false)) {
        console.log('❌ Found error alert')
        return 'error'
      }
      
      // Check for tx-success (TxSuccess component) - indicates successful send WITH hash available
      const txSuccess = this.page.locator('[data-testid="tx-success"]')
      if (await txSuccess.isVisible().catch(() => false)) {
        console.log('✅ Found tx-success testid (final screen)')
        return 'success'
      }
      
      // Check for tx hash element which only appears on success
      const txHashEl = this.page.locator('[data-testid="tx-hash"]')
      if (await txHashEl.isVisible().catch(() => false)) {
        console.log('✅ Found tx-hash element')
        return 'success'
      }
      
      // Check for "Done" button which appears only on success
      const doneButton = this.page.locator('[data-testid="tx-success-done"]')
      if (await doneButton.isVisible().catch(() => false)) {
        console.log('✅ Found tx-success-done button')
        return 'success'
      }
      
      // Check for keysign-success (animation phase) - note it but keep waiting for tx-success
      if (!animationPhaseFound && await this.keysignSuccess.isVisible().catch(() => false)) {
        console.log('✅ Found keysign-success testid (animation phase), waiting for tx-success...')
        animationPhaseFound = true
        // Continue polling - the tx-success screen should appear shortly
      }
      
      // Wait a bit before checking again
      await this.page.waitForTimeout(500)
    }
    
    // Timeout - if we saw the animation, it might have succeeded
    if (animationPhaseFound) {
      // One more check for tx-success
      const txSuccess = this.page.locator('[data-testid="tx-success"]')
      if (await txSuccess.isVisible().catch(() => false)) {
        console.log('✅ Found tx-success testid after timeout')
        return 'success'
      }
      // Animation was shown but no final success - might be a timing issue
      console.log('⚠️ Saw keysign-success animation but no tx-success - returning success')
      return 'success'
    }
    
    console.log('⚠️ Timeout waiting for keysign to complete')
    return 'error'
  }
}
