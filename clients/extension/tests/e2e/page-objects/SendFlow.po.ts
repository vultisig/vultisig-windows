/**
 * Send Flow Page Object Model
 *
 * Handles the complete send transaction flow.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class SendFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get sendForm(): Locator {
    return this.page.locator('[data-testid="send-form"]')
  }

  get coinSelector(): Locator {
    return (
      this.page.locator('[data-testid="send-coin-selector"]') ||
      this.page.locator('[data-testid="coin-select"]')
    )
  }

  get addressInput(): Locator {
    return this.page.locator('[data-testid="send-address-input"]')
  }

  get amountInput(): Locator {
    return this.page.locator('[data-testid="send-amount-input"]')
  }

  get continueButton(): Locator {
    return this.page.locator('[data-testid="send-continue"]')
  }

  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="send-terms-checkbox"], input[type="checkbox"]')
  }

  get signButton(): Locator {
    return (
      this.page.locator('[data-testid="sign-button"]') ||
      this.page.getByRole('button', { name: /sign|confirm/i })
    )
  }

  get successScreen(): Locator {
    return (
      this.page.locator('[data-testid="send-success"]') ||
      this.page.locator('text=/success|sent|complete/i')
    )
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]')
  }

  get maxButton(): Locator {
    return (
      this.page.locator('[data-testid="max-amount"]') ||
      this.page.getByRole('button', { name: /max/i })
    )
  }

  get feeDisplay(): Locator {
    return this.page.locator('[data-testid="network-fee"]')
  }

  /**
   * Wait for send form to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await this.sendForm.waitFor({ state: 'visible', timeout })
  }

  /**
   * Select coin to send
   */
  async selectCoin(coin: string): Promise<void> {
    await this.coinSelector.click()
    await this.page.waitForTimeout(300)

    // Find and click the coin option
    const coinOption = this.page.getByText(new RegExp(coin, 'i')).first()
    await coinOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Fill recipient address
   */
  async fillAddress(address: string): Promise<void> {
    await this.addressInput.clear()
    await this.addressInput.fill(address)
  }

  /**
   * Fill amount to send
   */
  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.clear()
    await this.amountInput.fill(amount)
  }

  /**
   * Click max amount button
   */
  async clickMax(): Promise<void> {
    await this.maxButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click continue to proceed to confirmation
   */
  async continue(): Promise<void> {
    await expect(this.continueButton).toBeEnabled()
    await this.continueButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Accept terms if shown
   */
  async acceptTerms(): Promise<void> {
    if (await this.termsCheckbox.isVisible()) {
      const isChecked = await this.termsCheckbox.isChecked()
      if (!isChecked) {
        await this.termsCheckbox.click()
      }
    }
  }

  /**
   * Initiate signing
   */
  async sign(): Promise<void> {
    await this.signButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Wait for transaction success screen
   */
  async waitForSuccess(timeout = 60_000): Promise<void> {
    await this.successScreen.waitFor({ state: 'visible', timeout })
  }

  /**
   * Get transaction hash from success screen
   */
  async getTxHash(): Promise<string> {
    await this.txHashDisplay.waitFor({ state: 'visible' })
    return (await this.txHashDisplay.textContent()) || ''
  }

  /**
   * Get displayed network fee
   */
  async getNetworkFee(): Promise<string> {
    if (await this.feeDisplay.isVisible()) {
      return (await this.feeDisplay.textContent()) || ''
    }
    return ''
  }

  /**
   * Check if continue button is enabled
   */
  async isContinueEnabled(): Promise<boolean> {
    return this.continueButton.isEnabled()
  }

  /**
   * Perform complete send operation (fills form and submits)
   * Note: Does NOT sign - use for UI testing only
   */
  async prepareSend(coin: string, address: string, amount: string): Promise<void> {
    await this.selectCoin(coin)
    await this.fillAddress(address)
    await this.fillAmount(amount)
  }

  /**
   * Complete the entire send flow
   * Warning: This will actually send tokens if signing succeeds
   */
  async completeSend(
    coin: string,
    address: string,
    amount: string
  ): Promise<string> {
    await this.prepareSend(coin, address, amount)
    await this.continue()
    await this.acceptTerms()
    await this.sign()
    await this.waitForSuccess()
    return this.getTxHash()
  }
}
