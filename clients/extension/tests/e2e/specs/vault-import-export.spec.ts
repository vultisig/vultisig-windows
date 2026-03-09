/**
 * Vault Import/Export E2E Tests
 *
 * Tests for vault backup export and import functionality.
 */

import { test, expect } from '@playwright/test'
import { VaultPage } from '../page-objects/VaultPage.po'
import { VaultSettings } from '../page-objects/VaultSettings.po'
import { VaultBackupFlow } from '../page-objects/VaultBackupFlow.po'
import { ImportVaultPage } from '../page-objects/ImportVaultPage.po'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'
import * as fs from 'fs'
import * as path from 'path'

// Test vault files location
const TEST_VAULTS_PATH = '/Users/crusty/vultisig-sdk-bot/credentials/test-vaults'

test.describe('Vault Import/Export', () => {
  let extensionId: string
  let vaultPage: VaultPage
  let vaultSettings: VaultSettings
  let backupFlow: VaultBackupFlow
  let importVaultPage: ImportVaultPage

  test.beforeEach(async ({ page, context }) => {
    // Get extension ID
    const serviceWorkers = context.serviceWorkers()
    if (serviceWorkers.length > 0) {
      extensionId = serviceWorkers[0].url().split('/')[2]
    } else {
      const sw = await context.waitForEvent('serviceworker')
      extensionId = sw.url().split('/')[2]
    }

    vaultPage = new VaultPage(page, extensionId)
    vaultSettings = new VaultSettings(page, extensionId)
    backupFlow = new VaultBackupFlow(page, extensionId)
    importVaultPage = new ImportVaultPage(page, extensionId)
  })

  test.describe('Export Vault', () => {
    test.skip('export vault without password downloads .vult file', async ({ page }) => {
      await vaultPage.goto()
      await vaultPage.waitForView()

      // Navigate to backup
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToBackup()
      await backupFlow.waitForView()

      // Select device backup
      await backupFlow.selectDeviceBackup()

      // Download without password
      const download = await backupFlow.downloadBackup()
      const filename = await backupFlow.getDownloadFilename(download)

      // Verify it's a .vult file
      expect(filename).toMatch(/\.vult$/)

      // Save to temp location for verification
      const tempPath = path.join('/tmp', filename)
      await backupFlow.saveDownload(download, tempPath)

      // Verify file exists and has content
      expect(fs.existsSync(tempPath)).toBe(true)
      const stats = fs.statSync(tempPath)
      expect(stats.size).toBeGreaterThan(0)

      // Cleanup
      fs.unlinkSync(tempPath)
    })

    test.skip('export vault with password downloads encrypted .vult', async ({ page }) => {
      await vaultPage.goto()
      await vaultPage.waitForView()

      // Navigate to backup
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToBackup()
      await backupFlow.waitForView()

      // Select device backup
      await backupFlow.selectDeviceBackup()

      // Download with password
      const testPassword = 'TestPassword123!'
      const download = await backupFlow.downloadWithPassword(testPassword)
      const filename = await backupFlow.getDownloadFilename(download)

      // Verify it's a .vult file
      expect(filename).toMatch(/\.vult$/)

      // Save and verify
      const tempPath = path.join('/tmp', filename)
      await backupFlow.saveDownload(download, tempPath)
      expect(fs.existsSync(tempPath)).toBe(true)

      // Cleanup
      fs.unlinkSync(tempPath)
    })
  })

  test.describe('Import Vault', () => {
    test.skip('import .vult file without password - vault appears', async ({ page }) => {
      // Start from fresh state (onboarding)
      const onboardingPage = new OnboardingPage(page, extensionId)
      await onboardingPage.goto()

      // Skip onboarding
      const skipButton = page.getByRole('button', { name: /skip/i })
      if (await skipButton.isVisible()) {
        await skipButton.click()
      }

      // Look for import option
      const importButton = page.getByText(/import.*vault|vault.*import/i).first()
      if (await importButton.isVisible()) {
        await importButton.click()
        await page.waitForTimeout(300)
      }

      await importVaultPage.waitForView()

      // Find test vault file (unencrypted)
      const testVaultFile = path.join(TEST_VAULTS_PATH, 'test-vault-unencrypted.vult')

      // Skip if test file doesn't exist
      if (!fs.existsSync(testVaultFile)) {
        test.skip()
        return
      }

      await importVaultPage.uploadFile(testVaultFile)
      await importVaultPage.import()

      // Wait for import to complete
      await page.waitForTimeout(2000)

      // Should now see vault page
      const isSuccess = await importVaultPage.isImportSuccessful()
      expect(isSuccess).toBe(true)
    })

    test.skip('import encrypted .vult with wrong password shows error', async ({ page }) => {
      const onboardingPage = new OnboardingPage(page, extensionId)
      await onboardingPage.goto()

      // Skip onboarding
      const skipButton = page.getByRole('button', { name: /skip/i })
      if (await skipButton.isVisible()) {
        await skipButton.click()
      }

      // Navigate to import
      const importButton = page.getByText(/import.*vault|vault.*import/i).first()
      if (await importButton.isVisible()) {
        await importButton.click()
      }

      await importVaultPage.waitForView()

      // Find encrypted test vault file
      const encryptedVaultFile = path.join(TEST_VAULTS_PATH, 'test-vault-encrypted.vult')

      // Skip if test file doesn't exist
      if (!fs.existsSync(encryptedVaultFile)) {
        test.skip()
        return
      }

      await importVaultPage.uploadFile(encryptedVaultFile)

      // Wait for password prompt
      await page.waitForTimeout(500)

      // Enter wrong password
      if (await importVaultPage.isPasswordRequired()) {
        await importVaultPage.fillPassword('WrongPassword123!')
        await importVaultPage.import()
      }

      // Should show error
      await page.waitForTimeout(1000)
      const hasError = await importVaultPage.hasImportError()
      expect(hasError).toBe(true)
    })

    test.skip('import encrypted .vult with correct password succeeds', async ({ page }) => {
      const onboardingPage = new OnboardingPage(page, extensionId)
      await onboardingPage.goto()

      // Skip onboarding
      const skipButton = page.getByRole('button', { name: /skip/i })
      if (await skipButton.isVisible()) {
        await skipButton.click()
      }

      // Navigate to import
      const importButton = page.getByText(/import.*vault|vault.*import/i).first()
      if (await importButton.isVisible()) {
        await importButton.click()
      }

      await importVaultPage.waitForView()

      const encryptedVaultFile = path.join(TEST_VAULTS_PATH, 'test-vault-encrypted.vult')
      const correctPassword = 'TestPassword123!' // Same password used in export test

      if (!fs.existsSync(encryptedVaultFile)) {
        test.skip()
        return
      }

      await importVaultPage.importVaultFile(encryptedVaultFile, correctPassword)

      await page.waitForTimeout(2000)

      const isSuccess = await importVaultPage.isImportSuccessful()
      expect(isSuccess).toBe(true)
    })
  })
})
