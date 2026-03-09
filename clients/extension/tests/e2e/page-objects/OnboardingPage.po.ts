/**
 * Onboarding Page Object Model
 *
 * Handles the initial onboarding/welcome screen:
 * - getStarted() - Click the get started button
 * - isVisible() - Check if onboarding screen is visible
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class OnboardingPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators for onboarding page elements
   */

  get welcomeText(): Locator {
    return this.page.getByText(/welcome|get started|vultisig/i).first()
  }

  get getStartedButton(): Locator {
    // Try multiple selectors in order of specificity
    return (
      this.page.locator('[data-testid="get-started-button"]') ||
      this.page.getByRole('button', { name: /get started/i }) ||
      this.page.locator('button:has-text("Get Started")') ||
      this.page.getByRole('button').first()
    )
  }

  get importVaultButton(): Locator {
    return (
      this.page.locator('[data-testid="import-vault-button"]') ||
      this.page.getByRole('button', { name: /import/i }) ||
      this.page.locator('button:has-text("Import")')
    )
  }

  get vaultTypeOptions(): Locator {
    return this.page.locator('[data-testid^="vault-type-"]')
  }

  /**
   * Wait for the onboarding view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    // Wait for either welcome text or get started button
    await Promise.race([
      this.welcomeText.waitFor({ state: 'visible', timeout }),
      this.getStartedButton.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Check if the onboarding screen is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      // Check for common onboarding indicators
      const hasWelcome = await this.welcomeText.isVisible()
      const hasGetStarted = await this.getStartedButton.isVisible()
      return hasWelcome || hasGetStarted
    } catch {
      return false
    }
  }

  /**
   * Click "Get Started" to proceed from onboarding
   */
  async getStarted(): Promise<void> {
    await this.getStartedButton.click()
    // Wait for navigation
    await this.page.waitForTimeout(300)
  }

  /**
   * Click "Import Vault" if available
   */
  async importVault(): Promise<void> {
    await this.importVaultButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if vault type selection is visible (after Get Started)
   */
  async isVaultTypeSelectionVisible(): Promise<boolean> {
    // Look for vault type options
    const fastVault = this.page.getByText(/fast vault/i)
    const secureVault = this.page.getByText(/secure vault/i)
    const importOption = this.page.getByText(/import.*seedphrase|seedphrase.*import/i)

    return (
      (await fastVault.isVisible()) ||
      (await secureVault.isVisible()) ||
      (await importOption.isVisible())
    )
  }

  /**
   * Select Fast Vault option
   */
  async selectFastVault(): Promise<void> {
    const fastVaultOption =
      this.page.locator('[data-testid="vault-type-fast"]') ||
      this.page.getByText(/fast vault/i).first()
    await fastVaultOption.click()
  }

  /**
   * Select Secure Vault option
   */
  async selectSecureVault(): Promise<void> {
    const secureVaultOption =
      this.page.locator('[data-testid="vault-type-secure"]') ||
      this.page.getByText(/secure vault/i).first()
    await secureVaultOption.click()
  }

  /**
   * Select Import Seedphrase option
   */
  async selectImportSeedphrase(): Promise<void> {
    const importOption =
      this.page.locator('[data-testid="vault-type-import"]') ||
      this.page.getByText(/import.*seedphrase|seedphrase.*import/i).first()
    await importOption.click()
  }

  /**
   * Get all visible vault type options
   */
  async getVaultTypeOptions(): Promise<string[]> {
    const options: string[] = []

    const fastVault = this.page.getByText(/fast vault/i).first()
    const secureVault = this.page.getByText(/secure vault/i).first()
    const importOption = this.page.getByText(/import/i).first()

    if (await fastVault.isVisible()) options.push('fast')
    if (await secureVault.isVisible()) options.push('secure')
    if (await importOption.isVisible()) options.push('import')

    return options
  }
}
