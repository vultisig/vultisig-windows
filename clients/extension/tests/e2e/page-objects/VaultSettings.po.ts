/**
 * Vault Settings Page Object Model
 *
 * Settings menu for vault management (rename, delete, backup, etc.)
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class VaultSettings extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get settingsContainer(): Locator {
    return this.page.locator('[data-testid="vault-settings-page"]')
  }

  get renameOption(): Locator {
    return this.page.getByText(/rename/i).first()
  }

  get deleteOption(): Locator {
    return this.page.getByText(/delete/i).first()
  }

  get backupOption(): Locator {
    return this.page.getByText(/backup/i).first()
  }

  get manageChains(): Locator {
    return (
      this.page.locator('[data-testid="manage-chains"]') ||
      this.page.getByText(/manage.*chains|chains/i).first()
    )
  }

  get detailsOption(): Locator {
    return this.page.getByText(/details/i).first()
  }

  get reshareOption(): Locator {
    return this.page.getByText(/reshare/i).first()
  }

  /**
   * Wait for the settings view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    // Wait for rename option or settings container to be visible
    await Promise.race([
      this.renameOption.waitFor({ state: 'visible', timeout }),
      this.deleteOption.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Navigate to rename vault page
   */
  async navigateToRename(): Promise<void> {
    await this.renameOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to delete vault page
   */
  async navigateToDelete(): Promise<void> {
    await this.deleteOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to backup options
   */
  async navigateToBackup(): Promise<void> {
    await this.backupOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to manage chains
   */
  async navigateToChains(): Promise<void> {
    await this.manageChains.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to vault details
   */
  async navigateToDetails(): Promise<void> {
    await this.detailsOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to reshare vault (for secure vaults only)
   */
  async navigateToReshare(): Promise<void> {
    await this.reshareOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if a specific option is visible
   */
  async isOptionVisible(option: 'rename' | 'delete' | 'backup' | 'reshare' | 'details'): Promise<boolean> {
    const optionMap = {
      rename: this.renameOption,
      delete: this.deleteOption,
      backup: this.backupOption,
      reshare: this.reshareOption,
      details: this.detailsOption,
    }
    return optionMap[option].isVisible()
  }
}
