/**
 * Vault Backup Flow Page Object Model
 *
 * Handles vault export/backup operations.
 */

import { type Page, type Locator, expect, Download } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class VaultBackupFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get backupModal(): Locator {
    return this.page.locator('[role="dialog"], [data-testid="backup-modal"]')
  }

  get deviceBackupOption(): Locator {
    return this.page.locator('[data-testid="backup-option-device"]')
  }

  get serverBackupOption(): Locator {
    return this.page.locator('[data-testid="backup-option-server"]')
  }

  get downloadButton(): Locator {
    return (
      this.page.locator('[data-testid="download-backup"]') ||
      this.page.getByRole('button', { name: /download|save|export/i })
    )
  }

  get passwordInput(): Locator {
    return this.page.locator('[data-testid="backup-password"], input[type="password"]')
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator('[data-testid="backup-password-confirm"], input[type="password"]').nth(1)
  }

  get continueButton(): Locator {
    return (
      this.page.locator('[data-testid="backup-continue"]') ||
      this.page.getByRole('button', { name: /continue|next/i })
    )
  }

  /**
   * Wait for backup options to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await Promise.race([
      this.deviceBackupOption.waitFor({ state: 'visible', timeout }),
      this.downloadButton.waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Select device backup option (local download)
   */
  async selectDeviceBackup(): Promise<void> {
    await this.deviceBackupOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Select server backup option (cloud)
   */
  async selectServerBackup(): Promise<void> {
    await this.serverBackupOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Download backup without password encryption
   * Returns the download object for verification
   */
  async downloadBackup(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.downloadButton.click()
    return downloadPromise
  }

  /**
   * Download backup with password encryption
   */
  async downloadWithPassword(password: string): Promise<Download> {
    // Fill password if input is visible
    if (await this.passwordInput.isVisible()) {
      await this.passwordInput.fill(password)
      if (await this.confirmPasswordInput.isVisible()) {
        await this.confirmPasswordInput.fill(password)
      }
      await this.continueButton.click()
    }

    const downloadPromise = this.page.waitForEvent('download')
    await this.downloadButton.click()
    return downloadPromise
  }

  /**
   * Check if password encryption option is available
   */
  async hasPasswordOption(): Promise<boolean> {
    return this.passwordInput.isVisible()
  }

  /**
   * Get downloaded file path
   */
  async saveDownload(download: Download, path: string): Promise<void> {
    await download.saveAs(path)
  }

  /**
   * Get download suggested filename
   */
  async getDownloadFilename(download: Download): Promise<string> {
    return download.suggestedFilename()
  }
}
