/**
 * Swap Flow Page Object Model
 *
 * Handles the complete swap transaction flow.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class SwapFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get swapForm(): Locator {
    return this.page.locator('[data-testid="swap-form"]')
  }

  get fromCoinSelector(): Locator {
    return this.page.locator('[data-testid="swap-from-coin"], [data-testid="from-coin-select"]').first()
  }

  get toCoinSelector(): Locator {
    return this.page.locator('[data-testid="swap-to-coin"], [data-testid="to-coin-select"]').first()
  }

  get fromAmountInput(): Locator {
    return this.page.locator('[data-testid="swap-from-amount-input"]')
  }

  get toAmountDisplay(): Locator {
    return this.page.locator('[data-testid="swap-to-amount"]')
  }

  get continueButton(): Locator {
    return this.page.locator('[data-testid="swap-continue"]')
  }

  get reverseButton(): Locator {
    return this.page.locator('[data-testid="swap-reverse"]').or(this.page.getByRole('button', { name: /reverse|switch/i })).first()
  }

  get quoteLoading(): Locator {
    return this.page.locator('[data-testid="quote-loading"], .spinner, [role="progressbar"]')
  }

  get quoteInfo(): Locator {
    return this.page.locator('[data-testid="swap-quote-info"]')
  }

  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="swap-terms-checkbox"], input[type="checkbox"]')
  }

  /**
   * The sign/keysign button on the verify page.
   * For fast vaults this shows "Fast Sign", for secure vaults "Sign".
   */
  get signButton(): Locator {
    return this.page.getByRole('button', { name: /fast.sign|sign|confirm/i }).first()
  }

  get successScreen(): Locator {
    return this.page.locator('[data-testid="swap-success"]').or(this.page.locator('text=/success|swapped|complete/i')).first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]')
  }

  get rateDisplay(): Locator {
    return this.page.locator('[data-testid="swap-rate"]')
  }

  get maxButton(): Locator {
    return this.page.locator('[data-testid="max-amount"]').or(this.page.getByRole('button', { name: /max/i })).first()
  }

  /**
   * Wait for swap form to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await this.swapForm.waitFor({ state: 'visible', timeout })
  }

  /**
   * Select source coin
   */
  async selectFromCoin(coin: string): Promise<void> {
    await this.fromCoinSelector.click()
    await this.page.waitForTimeout(300)

    const coinOption = this.page.getByText(new RegExp(coin, 'i')).first()
    await coinOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Select destination coin
   */
  async selectToCoin(coin: string): Promise<void> {
    await this.toCoinSelector.click()
    await this.page.waitForTimeout(300)

    const coinOption = this.page.getByText(new RegExp(coin, 'i')).first()
    await coinOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Fill swap amount
   */
  async fillAmount(amount: string): Promise<void> {
    await this.fromAmountInput.clear()
    await this.fromAmountInput.fill(amount)
  }

  /**
   * Click max button
   */
  async clickMax(): Promise<void> {
    await this.maxButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Reverse the swap direction (swap from/to coins)
   */
  async reverse(): Promise<void> {
    await this.reverseButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Wait for quote to load
   */
  async waitForQuote(timeout = 30_000): Promise<void> {
    try {
      // Wait for loading to appear then disappear
      await this.quoteLoading.waitFor({ state: 'visible', timeout: 5000 })
      await this.quoteLoading.waitFor({ state: 'hidden', timeout })
    } catch {
      // Loading might be too fast to catch, which is fine
    }

    // Wait a bit more for quote to fully render
    await this.page.waitForTimeout(500)
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
   * Accept terms if shown.
   * The verify page may show multiple checkboxes. Each checkbox is a custom component
   * with an invisible <input> inside a <label>. We click the <label> instead.
   */
  async acceptTerms(): Promise<void> {
    const checkboxes = this.page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i)
      const isChecked = await checkbox.isChecked().catch(() => false)
      if (!isChecked) {
        const label = checkbox.locator('xpath=ancestor::label')
        if (await label.count() > 0) {
          await label.first().click()
        } else {
          await checkbox.click({ force: true })
        }
        await this.page.waitForTimeout(200)
      }
    }
  }

  /**
   * Initiate signing.
   *
   * For fast vaults, clicking "Fast Sign" opens a password modal.
   */
  async sign(): Promise<void> {
    await this.signButton.click()
    await this.page.waitForTimeout(500)

    // Check if a password modal appeared (fast vault flow)
    const passwordInput = this.page.locator('input[type="password"], input[placeholder*="password" i]').first()
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const password = process.env.TEST_VAULT_PASSWORD || ''
      if (password) {
        await passwordInput.fill(password)
        await this.page.waitForTimeout(300)

        const confirmBtn = this.page.getByRole('button', { name: /confirm/i }).first()
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click()
          await this.page.waitForTimeout(500)
        }
      }
    }
  }

  /**
   * Wait for swap success screen
   */
  async waitForSuccess(timeout = 120_000): Promise<void> {
    // Swaps can take longer than sends
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
   * Get expected output amount
   */
  async getExpectedOutput(): Promise<string> {
    if (await this.toAmountDisplay.isVisible()) {
      return (await this.toAmountDisplay.textContent()) || ''
    }
    return ''
  }

  /**
   * Get swap rate
   */
  async getSwapRate(): Promise<string> {
    if (await this.rateDisplay.isVisible()) {
      return (await this.rateDisplay.textContent()) || ''
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
   * Prepare a swap (fills form but doesn't submit)
   */
  async prepareSwap(fromCoin: string, toCoin: string, amount: string): Promise<void> {
    await this.selectFromCoin(fromCoin)
    await this.selectToCoin(toCoin)
    await this.fillAmount(amount)
    await this.waitForQuote()
  }

  /**
   * Complete the entire swap flow
   * Warning: This will actually execute the swap if signing succeeds
   */
  async completeSwap(
    fromCoin: string,
    toCoin: string,
    amount: string
  ): Promise<string> {
    await this.prepareSwap(fromCoin, toCoin, amount)
    await this.continue()
    await this.acceptTerms()
    await this.sign()
    await this.waitForSuccess()
    return this.getTxHash()
  }
}
