/**
 * Fast Vault Form Page Object Model
 *
 * Handles the fast vault creation form:
 * - fillName(name) - fill vault name input
 * - fillEmail(email) - fill email input
 * - fillPassword(password) - fill password input
 * - submit() - click create button
 * - waitForCreation() - wait for vault creation to complete
 * - getValidationError() - get validation error if present
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class FastVaultForm extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get form(): Locator {
    return this.page.locator('[data-testid="fast-vault-form"]')
  }

  get vaultNameInput(): Locator {
    return (
      this.page.locator('[data-testid="vault-name-input"]') ||
      this.page.getByPlaceholder(/vault name/i)
    )
  }

  get emailInput(): Locator {
    return (
      this.page.locator('[data-testid="vault-email-input"]') ||
      this.page.getByPlaceholder(/email/i) ||
      this.page.locator('input[type="email"]')
    )
  }

  get passwordInput(): Locator {
    return (
      this.page.locator('[data-testid="vault-password-input"]') ||
      this.page.getByPlaceholder(/password/i) ||
      this.page.locator('input[type="password"]').first()
    )
  }

  get confirmPasswordInput(): Locator {
    return (
      this.page.locator('[data-testid="vault-confirm-password-input"]') ||
      this.page.getByPlaceholder(/confirm.*password/i) ||
      this.page.locator('input[type="password"]').nth(1)
    )
  }

  get createButton(): Locator {
    return (
      this.page.locator('[data-testid="create-vault-button"]') ||
      this.page.getByRole('button', { name: /create|continue/i })
    )
  }

  get validationError(): Locator {
    return (
      this.page.locator('[data-testid="validation-error"]') ||
      this.page.locator('[role="alert"]') ||
      this.page.locator('.error-message')
    )
  }

  get emailVerificationStep(): Locator {
    return (
      this.page.locator('[data-testid="email-verification"]') ||
      this.page.locator('text=/verify.*email|email.*verification|check.*inbox/i')
    )
  }

  get creationProgress(): Locator {
    return (
      this.page.locator('[data-testid="creation-progress"]') ||
      this.page.locator('[role="progressbar"]') ||
      this.page.locator('.spinner')
    )
  }

  get creationSuccess(): Locator {
    return (
      this.page.locator('[data-testid="vault-created"]') ||
      this.page.locator('text=/vault.*created|success|ready/i')
    )
  }

  /**
   * Wait for the fast vault form to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    // Wait for either the form or name input to be visible
    await Promise.race([
      this.form.waitFor({ state: 'visible', timeout }),
      this.vaultNameInput.waitFor({ state: 'visible', timeout }),
      this.emailInput.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Fill vault name
   */
  async fillName(name: string): Promise<void> {
    await this.vaultNameInput.waitFor({ state: 'visible' })
    await this.vaultNameInput.clear()
    await this.vaultNameInput.fill(name)
  }

  /**
   * Fill email address
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' })
    await this.emailInput.clear()
    await this.emailInput.fill(email)
  }

  /**
   * Fill password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' })
    await this.passwordInput.clear()
    await this.passwordInput.fill(password)
  }

  /**
   * Fill confirm password (if separate field exists)
   */
  async fillConfirmPassword(password: string): Promise<void> {
    if (await this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.clear()
      await this.confirmPasswordInput.fill(password)
    }
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await expect(this.createButton).toBeEnabled()
    await this.createButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Wait for vault creation to complete
   */
  async waitForCreation(timeout = 60_000): Promise<void> {
    // First wait for progress indicator (if any)
    try {
      await this.creationProgress.waitFor({ state: 'visible', timeout: 5000 })
      await this.creationProgress.waitFor({ state: 'hidden', timeout })
    } catch {
      // Progress indicator might be too fast to catch
    }

    // Wait for success indication
    await this.creationSuccess.waitFor({ state: 'visible', timeout })
  }

  /**
   * Wait for email verification step
   */
  async waitForEmailVerification(timeout = 30_000): Promise<void> {
    await this.emailVerificationStep.waitFor({ state: 'visible', timeout })
  }

  /**
   * Check if email verification step is visible
   */
  async isEmailVerificationVisible(): Promise<boolean> {
    return this.emailVerificationStep.isVisible()
  }

  /**
   * Get validation error text
   */
  async getValidationError(): Promise<string | null> {
    if (await this.validationError.isVisible()) {
      return (await this.validationError.textContent()) || null
    }
    return null
  }

  /**
   * Check if form has validation error
   */
  async hasValidationError(): Promise<boolean> {
    return this.validationError.isVisible()
  }

  /**
   * Check if create button is enabled
   */
  async isCreateEnabled(): Promise<boolean> {
    return this.createButton.isEnabled()
  }

  /**
   * Fill entire form
   */
  async fillForm(name: string, email: string, password: string): Promise<void> {
    await this.fillName(name)
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.fillConfirmPassword(password)
  }

  /**
   * Complete fast vault creation
   */
  async createFastVault(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.fillForm(name, email, password)
    await this.submit()
  }
}
