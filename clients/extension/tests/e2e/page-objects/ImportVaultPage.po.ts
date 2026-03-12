/**
 * Import Vault Page Object Model
 *
 * Handles vault import from .vult backup files.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'
import * as path from 'path'

export class ImportVaultPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get importForm(): Locator {
    return this.page.locator('[data-testid="import-vault-form"]')
  }

  get fileDropzone(): Locator {
    return (
      this.page.locator('[data-testid="file-dropzone"]') ||
      this.page.locator('input[type="file"]')
    )
  }

  get fileInput(): Locator {
    return this.page.locator('input[type="file"]')
  }

  get passwordInput(): Locator {
    return (
      this.page.locator('[data-testid="import-password"]') ||
      this.page.locator('input[type="password"]')
    )
  }

  get importButton(): Locator {
    return this.page.locator('[data-testid="import-continue"]')
  }

  get continueButton(): Locator {
    return (
      this.page.locator('[data-testid="import-continue"]') ||
      this.page.getByRole('button', { name: /continue|import|next/i })
    )
  }

  get errorMessage(): Locator {
    return (
      this.page.locator('[data-testid="import-error"]') ||
      this.page.locator('[role="alert"]') ||
      this.page.locator('text=/error|invalid|wrong/i')
    )
  }

  get successMessage(): Locator {
    return (
      this.page.locator('[data-testid="import-success"]') ||
      this.page.locator('text=/success|imported|complete/i')
    )
  }

  get uploadedFileName(): Locator {
    return this.page.locator('[data-testid="uploaded-file-name"]')
  }

  /**
   * Wait for import view to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await Promise.race([
      this.importForm.waitFor({ state: 'visible', timeout }),
      this.fileInput.waitFor({ state: 'attached', timeout }),
    ])
  }

  /**
   * Upload a .vult backup file
   */
  async uploadFile(filePath: string): Promise<void> {
    // Make path absolute if relative
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath)

    // Set file input
    await this.fileInput.setInputFiles(absolutePath)
    await this.page.waitForTimeout(500)
  }

  /**
   * Fill password for encrypted backup
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' })
    await this.passwordInput.fill(password)
  }

  /**
   * Click import/continue button
   */
  async import(): Promise<void> {
    await this.continueButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Perform complete import operation
   */
  async importVaultFile(filePath: string, password?: string): Promise<void> {
    await this.uploadFile(filePath)

    if (password) {
      // Wait for password prompt
      await this.page.waitForTimeout(500)
      if (await this.passwordInput.isVisible()) {
        await this.fillPassword(password)
      }
    }

    await this.import()
  }

  /**
   * Check if password is required
   */
  async isPasswordRequired(): Promise<boolean> {
    return this.passwordInput.isVisible()
  }

  /**
   * Check if import was successful
   */
  async isImportSuccessful(): Promise<boolean> {
    try {
      // Success might be indicated by navigation to vault page
      // or a success message
      const hasSuccess = await this.successMessage.isVisible()
      const hasVaultPage = await this.page.locator('[data-testid="vault-page"]').isVisible()
      return hasSuccess || hasVaultPage
    } catch {
      return false
    }
  }

  /**
   * Get error message if import failed
   */
  async getImportError(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return (await this.errorMessage.textContent())?.trim() || null
    }
    return null
  }

  /**
   * Check if there's an error displayed
   */
  async hasImportError(): Promise<boolean> {
    return this.errorMessage.isVisible()
  }

  /**
   * Check if continue/import button is enabled
   */
  async isImportEnabled(): Promise<boolean> {
    return this.continueButton.isEnabled()
  }
}
