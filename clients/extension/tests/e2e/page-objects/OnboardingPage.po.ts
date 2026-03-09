/**
 * Onboarding Page Object Model
 *
 * Handles the initial onboarding/welcome screen:
 * - getStarted() - Click through onboarding or skip
 * - isVisible() - Check if onboarding screen is visible
 */

import { type Page, type Locator } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class OnboardingPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators for onboarding page elements
   * Actual UI has:
   * - "vultisig" text/logo
   * - "Next" button
   * - "Skip" button
   * - Onboarding description text
   */

  get welcomeText(): Locator {
    // Look for "vultisig" text (the actual brand name shown)
    return this.page.getByText(/vultisig/i).first()
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: /next/i }).first()
  }

  get skipButton(): Locator {
    return this.page.getByRole('button', { name: /skip/i }).first()
  }

  get getStartedButton(): Locator {
    // This is actually "Next" in the UI, but some screens have "Get Started"
    return this.page.getByRole('button', { name: /get.*started|next/i }).first()
  }

  get importVaultButton(): Locator {
    return this.page.getByRole('button', { name: /import/i }).first()
  }

  get vaultTypeOptions(): Locator {
    return this.page.locator('[data-testid^="vault-type-"]')
  }

  /**
   * Wait for the onboarding view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    // Wait for either vultisig text, next button, or skip button
    await Promise.race([
      this.welcomeText.waitFor({ state: 'visible', timeout }),
      this.nextButton.waitFor({ state: 'visible', timeout }),
      this.skipButton.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Check if the onboarding screen is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      // Check for onboarding indicators: vultisig text with next/skip buttons
      const hasVultisig = await this.welcomeText.isVisible()
      const hasNext = await this.nextButton.isVisible()
      const hasSkip = await this.skipButton.isVisible()
      return hasVultisig || (hasNext && hasSkip)
    } catch {
      return false
    }
  }

  /**
   * Click "Next" to proceed from onboarding
   */
  async getStarted(): Promise<void> {
    if (await this.nextButton.isVisible()) {
      await this.nextButton.click()
    } else if (await this.getStartedButton.isVisible()) {
      await this.getStartedButton.click()
    }
    await this.page.waitForTimeout(300)
  }

  /**
   * Click "Skip" to bypass onboarding
   */
  async skip(): Promise<void> {
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Click through all onboarding steps
   */
  async completeOnboarding(): Promise<void> {
    // Try skip first (faster)
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click()
      await this.page.waitForTimeout(500)
      return
    }

    // Otherwise click through next buttons
    let attempts = 0
    while (attempts < 10) {
      if (await this.nextButton.isVisible()) {
        await this.nextButton.click()
        await this.page.waitForTimeout(300)
        attempts++
      } else {
        break
      }
    }
  }

  /**
   * Click "Import Vault" if available
   */
  async importVault(): Promise<void> {
    await this.importVaultButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if vault type selection is visible (after onboarding)
   * The NewVaultPage shows: "vultisig", "Scan QR", "Import", "Next" buttons
   */
  async isVaultTypeSelectionVisible(): Promise<boolean> {
    // After onboarding, user sees NewVaultPage with these options
    const hasNext = await this.page.getByRole('button', { name: /next/i }).isVisible()
    const hasImport = await this.page.getByRole('button', { name: /import/i }).isVisible()
    const hasScanQr = await this.page.getByRole('button', { name: /scan.*qr/i }).isVisible()

    return hasNext || hasImport || hasScanQr
  }

  /**
   * Check if we're on the SetupVaultPage (after clicking Next from NewVaultPage)
   * SetupVaultPage shows device selection animation and "Get Started" button
   */
  async isSetupVaultVisible(): Promise<boolean> {
    const hasGetStarted = await this.page.getByRole('button', { name: /get.*started/i }).isVisible()
    return hasGetStarted
  }

  /**
   * Navigate through NewVaultPage to SetupVaultPage
   */
  async navigateToSetupVault(): Promise<void> {
    // From NewVaultPage, click Next to go to SetupVaultPage
    const nextButton = this.page.getByRole('button', { name: /next/i }).first()
    if (await nextButton.isVisible()) {
      await nextButton.click()
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * Select Fast Vault option (0 devices selected in animation)
   */
  async selectFastVault(): Promise<void> {
    // On SetupVaultPage, click "Get Started" with 0 devices selected = Fast Vault
    const getStartedButton = this.page.getByRole('button', { name: /get.*started/i }).first()
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Select Secure Vault option (requires selecting devices in animation first)
   */
  async selectSecureVault(): Promise<void> {
    // This requires interacting with the Rive animation to select devices
    // For now, just click get started (defaults to fast vault if no devices selected)
    const getStartedButton = this.page.getByRole('button', { name: /get.*started/i }).first()
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Select Import Seedphrase option
   */
  async selectImportSeedphrase(): Promise<void> {
    // From NewVaultPage, click Import button
    const importButton = this.page.getByRole('button', { name: /import/i }).first()
    if (await importButton.isVisible()) {
      await importButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Get all visible vault type options
   */
  async getVaultTypeOptions(): Promise<string[]> {
    const options: string[] = []

    // From NewVaultPage
    const nextButton = this.page.getByRole('button', { name: /next/i }).first()
    const importButton = this.page.getByRole('button', { name: /import/i }).first()
    const scanQrButton = this.page.getByRole('button', { name: /scan.*qr/i }).first()

    if (await nextButton.isVisible()) options.push('create')
    if (await importButton.isVisible()) options.push('import')
    if (await scanQrButton.isVisible()) options.push('scan')

    return options
  }
}
