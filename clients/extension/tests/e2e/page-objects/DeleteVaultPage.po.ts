/**
 * Delete Vault Page Object Model
 *
 * Handles vault deletion confirmation with 3 required checkboxes.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class DeleteVaultPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get termsContainer(): Locator {
    return this.page.locator('[data-testid="delete-vault-terms"]')
  }

  get term1Checkbox(): Locator {
    return this.page.locator('[data-testid="delete-confirm-1"]')
  }

  get term2Checkbox(): Locator {
    return this.page.locator('[data-testid="delete-confirm-2"]')
  }

  get term3Checkbox(): Locator {
    return this.page.locator('[data-testid="delete-confirm-3"]')
  }

  get deleteButton(): Locator {
    return this.page.locator('[data-testid="delete-vault-button"]')
  }

  get vaultNameDisplay(): Locator {
    return this.page.locator('[data-testid="vault-name-display"]')
  }

  get vaultValueDisplay(): Locator {
    return this.page.locator('[data-testid="vault-value-display"]')
  }

  /**
   * Wait for the delete vault view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await this.termsContainer.waitFor({ state: 'visible', timeout })
  }

  /**
   * Check all 3 confirmation checkboxes
   */
  async checkAllTerms(): Promise<void> {
    await this.checkTerm(1)
    await this.checkTerm(2)
    await this.checkTerm(3)
  }

  /**
   * Check a specific term checkbox (1, 2, or 3)
   */
  async checkTerm(n: 1 | 2 | 3): Promise<void> {
    const checkbox = this.page.locator(`[data-testid="delete-confirm-${n}"]`)
    const isChecked = await checkbox.isChecked().catch(() => false)
    if (!isChecked) {
      await checkbox.click()
    }
  }

  /**
   * Uncheck a specific term checkbox
   */
  async uncheckTerm(n: 1 | 2 | 3): Promise<void> {
    const checkbox = this.page.locator(`[data-testid="delete-confirm-${n}"]`)
    const isChecked = await checkbox.isChecked().catch(() => true)
    if (isChecked) {
      await checkbox.click()
    }
  }

  /**
   * Click the delete vault button
   */
  async deleteVault(): Promise<void> {
    await expect(this.deleteButton).toBeEnabled()
    await this.deleteButton.click()
    await this.page.waitForTimeout(500) // Wait for deletion to process
  }

  /**
   * Check if delete button is enabled
   */
  async isDeleteEnabled(): Promise<boolean> {
    return this.deleteButton.isEnabled()
  }

  /**
   * Check if a specific term is checked
   */
  async isTermChecked(n: 1 | 2 | 3): Promise<boolean> {
    const checkbox = this.page.locator(`[data-testid="delete-confirm-${n}"]`)
    return checkbox.isChecked()
  }

  /**
   * Get how many terms are checked
   */
  async getCheckedTermsCount(): Promise<number> {
    let count = 0
    if (await this.isTermChecked(1)) count++
    if (await this.isTermChecked(2)) count++
    if (await this.isTermChecked(3)) count++
    return count
  }

  /**
   * Get displayed vault name
   */
  async getVaultName(): Promise<string> {
    // Look for vault name in the display
    const nameElement = this.page.locator('text=/Vault.*Name/i').locator('..').locator('text').last()
    if (await nameElement.isVisible()) {
      return (await nameElement.textContent()) || ''
    }
    return ''
  }
}
