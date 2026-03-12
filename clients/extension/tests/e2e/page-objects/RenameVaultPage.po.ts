/**
 * Rename Vault Page Object Model
 *
 * Handles vault renaming with validation.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class RenameVaultPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get nameInput(): Locator {
    return this.page.locator('[data-testid="rename-vault-input"]')
  }

  get saveButton(): Locator {
    return this.page.locator('[data-testid="rename-vault-save"]')
  }

  get validationError(): Locator {
    return this.page.locator('[data-testid="rename-validation-error"]')
  }

  get clearButton(): Locator {
    return this.page.locator('[aria-label="clear"], [data-testid="clear-input"]')
  }

  /**
   * Wait for the rename view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await this.nameInput.waitFor({ state: 'visible', timeout })
  }

  /**
   * Fill in the new vault name
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.clear()
    await this.nameInput.fill(name)
    // Trigger blur to validate
    await this.nameInput.blur()
  }

  /**
   * Clear the name input
   */
  async clearName(): Promise<void> {
    if (await this.clearButton.isVisible()) {
      await this.clearButton.click()
    } else {
      await this.nameInput.clear()
    }
  }

  /**
   * Click save button
   */
  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled()
    await this.saveButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Get validation error text (if any)
   */
  async getValidationError(): Promise<string | null> {
    if (await this.validationError.isVisible()) {
      return (await this.validationError.textContent())?.trim() || null
    }
    return null
  }

  /**
   * Check if there's a validation error
   */
  async hasValidationError(): Promise<boolean> {
    return this.validationError.isVisible()
  }

  /**
   * Check if save button is enabled
   */
  async isSaveEnabled(): Promise<boolean> {
    return this.saveButton.isEnabled()
  }

  /**
   * Get current value in the name input
   */
  async getCurrentName(): Promise<string> {
    return (await this.nameInput.inputValue()) || ''
  }

  /**
   * Perform a complete rename operation
   */
  async renameTo(newName: string): Promise<void> {
    await this.fillName(newName)
    await this.save()
  }
}
