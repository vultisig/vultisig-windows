/**
 * Vault Import Helper
 *
 * Imports vaults via the extension UI instead of trying to parse encrypted .vult files.
 * This is the recommended approach for E2E tests since it mimics real user behavior.
 *
 * UI Flow:
 * 1. Onboarding -> Skip -> NewVaultPage
 * 2. NewVaultPage -> Click "Import" -> ImportOptionsPage
 * 3. ImportOptionsPage -> Click "Import vault share" -> ImportVaultPage (file upload)
 * 4. ImportVaultPage -> Upload file -> Enter password -> Continue -> VaultPage
 */

import type { Page, BrowserContext } from '@playwright/test'
import { existsSync } from 'fs'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Load .env from e2e directory
const __edir = fileURLToPath(new URL('..', import.meta.url))
config({ path: resolve(__edir, '.env') })

export interface VaultImportConfig {
  vaultPath: string
  password: string
  extensionId: string
}

/**
 * Wait for the extension UI to be fully loaded
 */
async function waitForExtensionUI(page: Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(() => {
    // Wait for React to render and have visible buttons
    const buttons = document.querySelectorAll('button')
    const hasVisibleButtons = buttons.length > 0 && Array.from(buttons).some(b => b.offsetParent !== null)

    // Or wait for text content
    const hasContent = document.body.textContent && document.body.textContent.trim().length > 10

    return hasVisibleButtons || hasContent
  }, { timeout })
}

/**
 * Check if we're on the onboarding screen
 */
export async function isOnOnboarding(page: Page): Promise<boolean> {
  const vultisigText = page.getByText(/vultisig/i).first()
  const skipButton = page.getByRole('button', { name: /skip/i })
  const nextButton = page.getByRole('button', { name: /next/i })

  const hasVultisig = await vultisigText.isVisible().catch(() => false)
  const hasSkip = await skipButton.isVisible().catch(() => false)
  const hasNext = await nextButton.isVisible().catch(() => false)

  return hasVultisig || hasSkip || hasNext
}

/**
 * Check if we're on the vault page (has vault loaded)
 */
export async function isOnVaultPage(page: Page): Promise<boolean> {
  // Check for vault page indicators
  const vaultPage = page.locator('[data-testid="vault-page"]')
  const hasVaultPage = await vaultPage.isVisible().catch(() => false)

  // Also check for balance or chain list which indicate vault is loaded
  const hasBalance = await page.locator('text=/\\$|USD|Balance/i').isVisible().catch(() => false)
  const hasChains = await page.locator('[data-testid="chain-list"]').isVisible().catch(() => false)

  return hasVaultPage || hasBalance || hasChains
}

/**
 * Check if we're on the file upload import page (has file dropzone)
 */
export async function isOnFileUploadPage(page: Page): Promise<boolean> {
  // Check for import form with file upload
  const importForm = page.locator('[data-testid="import-vault-form"]')
  const hasImportForm = await importForm.isVisible().catch(() => false)

  // Check for file input
  const fileInputCount = await page.locator('input[type="file"]').count().catch(() => 0)
  const hasFileInput = fileInputCount > 0

  // Check for dropzone text
  const hasDropzoneText = await page.getByText(/select.*backup.*file|click.*browse|drop.*file/i).isVisible().catch(() => false)

  return hasImportForm || hasFileInput || hasDropzoneText
}

/**
 * Check if we're on the import options page (shows "Import Seedphrase" and "Import vault share")
 */
export async function isOnImportOptionsPage(page: Page): Promise<boolean> {
  const hasImportShare = await page.getByText(/import.*vault.*share/i).isVisible().catch(() => false)
  const hasImportSeedphrase = await page.getByText(/import.*seedphrase/i).isVisible().catch(() => false)

  return hasImportShare || hasImportSeedphrase
}

/**
 * Navigate through onboarding to the file upload import page
 */
export async function navigateToFileImport(page: Page, extensionId: string): Promise<boolean> {
  try {
    // Go to extension
    await page.goto(`chrome-extension://${extensionId}/index.html`)

    // Wait for UI to fully load
    await waitForExtensionUI(page)

    // Check if we're already on vault page
    if (await isOnVaultPage(page)) {
      console.log('✅ Already on vault page, vault exists')
      return true
    }

    // Check if we're already on file upload page
    if (await isOnFileUploadPage(page)) {
      console.log('✅ Already on file upload page')
      return true
    }

    // Skip onboarding if on onboarding screen (Skip button)
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found Skip button, skipping onboarding...')
      await skipButton.click()
      await page.waitForTimeout(1000)
      await waitForExtensionUI(page)
    }

    // Now we should be on NewVaultPage - look for Import button
    const importButton = page.locator('button:has-text("Import")').first()
    if (await importButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Found Import button on NewVaultPage, clicking...')
      await importButton.click()
      await page.waitForTimeout(1000)
      await waitForExtensionUI(page)
    }

    // Now we should be on ImportOptionsPage - look for "Import vault share"
    if (await isOnImportOptionsPage(page)) {
      console.log('✅ On Import Options page')

      // Click "Import vault share" option
      const importShareButton = page.getByText(/import.*vault.*share/i).first()
      if (await importShareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found "Import vault share" option, clicking...')
        await importShareButton.click()
        await page.waitForTimeout(1000)
        await waitForExtensionUI(page)

        // Now we should be on the file upload page
        if (await isOnFileUploadPage(page)) {
          console.log('✅ On file upload page')
          return true
        }
      }
    }

    // Final check - are we on the file upload page?
    if (await isOnFileUploadPage(page)) {
      console.log('✅ On file upload page')
      return true
    }

    console.log('⚠️ Could not navigate to file upload page')
    const pageText = await page.locator('body').textContent().catch(() => '')
    console.log('Final page content:', pageText?.substring(0, 500))
    return false
  } catch (error) {
    console.error('Failed to navigate to file import:', error)
    return false
  }
}

/**
 * Import a vault file via the extension UI
 *
 * @param page - Playwright page
 * @param config - Vault import configuration
 * @returns true if import succeeded, false otherwise
 */
export async function importVaultViaUI(
  page: Page,
  config: VaultImportConfig
): Promise<boolean> {
  const { vaultPath, password, extensionId } = config

  // Verify vault file exists
  if (!existsSync(vaultPath)) {
    console.error(`Vault file not found: ${vaultPath}`)
    return false
  }

  try {
    // Navigate to file upload page
    const navigated = await navigateToFileImport(page, extensionId)
    if (!navigated) {
      return false
    }

    // Check if we ended up on vault page (already imported)
    if (await isOnVaultPage(page)) {
      console.log('✅ Vault already imported')
      return true
    }

    // Wait for file input to be available
    const fileInput = page.locator('input[type="file"]')
    await fileInput.waitFor({ state: 'attached', timeout: 10_000 })
    console.log('✅ Found file input')

    // Upload the file
    await fileInput.setInputFiles(vaultPath)
    console.log('✅ File uploaded:', vaultPath)
    await page.waitForTimeout(1500)

    // Click Continue button
    const continueButton = page.locator('[data-testid="import-continue"]')
    if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Found Continue button, clicking...')
      await continueButton.click()
      await page.waitForTimeout(2000)
    } else {
      // Fallback to generic continue button
      const genericContinue = page.getByRole('button', { name: /continue/i }).first()
      if (await genericContinue.isEnabled({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found generic Continue button, clicking...')
        await genericContinue.click()
        await page.waitForTimeout(2000)
      }
    }

    // Check for password prompt (encrypted files need password)
    const passwordInput = page.locator('input[type="password"]')
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Password required, entering...')
      await passwordInput.fill(password)
      await page.waitForTimeout(500)

      // Click Continue again after password
      const continueAfterPassword = page.locator('[data-testid="import-continue"]')
      if (await continueAfterPassword.isVisible().catch(() => false)) {
        console.log('✅ Clicking Continue after password...')
        await continueAfterPassword.click()
      } else {
        const genericContinue = page.getByRole('button', { name: /continue|unlock|import/i }).first()
        if (await genericContinue.isEnabled().catch(() => false)) {
          await genericContinue.click()
        }
      }
      await page.waitForTimeout(3000)
    }

    // Wait for import to complete
    await page.waitForTimeout(2000)
    const success = await isOnVaultPage(page)

    if (success) {
      console.log('✅ Vault imported successfully')
    } else {
      // Check for error message
      const errorText = await page.locator('[role="alert"], text=/error|invalid|wrong|failed/i')
        .textContent()
        .catch(() => null)
      if (errorText) {
        console.error(`Import failed with error: ${errorText}`)
      } else {
        console.error('Import did not complete - not on vault page')
        console.log('Current URL:', page.url())
        const bodyText = await page.locator('body').textContent().catch(() => '')
        console.log('Page content:', bodyText?.substring(0, 500))
      }
    }

    return success
  } catch (error) {
    console.error('Vault import failed:', error)
    return false
  }
}

/**
 * Ensure a vault exists in the extension (import if needed)
 *
 * @param context - Browser context
 * @param extensionId - Extension ID
 * @param vaultPath - Path to .vult file
 * @param password - Password for encrypted vault
 * @returns true if vault exists/was imported, false otherwise
 */
export async function ensureVaultExists(
  context: BrowserContext,
  extensionId: string,
  vaultPath?: string,
  password?: string
): Promise<boolean> {
  const page = await context.newPage()

  try {
    // Check current state
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await waitForExtensionUI(page)

    // Already have a vault?
    if (await isOnVaultPage(page)) {
      console.log('✅ Vault already exists')
      return true
    }

    // Need to import
    if (!vaultPath || !password) {
      console.log('⚠️ No vault path/password provided, cannot import')
      return false
    }

    if (!existsSync(vaultPath)) {
      console.log(`⚠️ Vault file not found: ${vaultPath}`)
      return false
    }

    // Import via UI
    return await importVaultViaUI(page, {
      vaultPath,
      password,
      extensionId,
    })
  } finally {
    await page.close()
  }
}

/**
 * Get vault import config from environment variables
 */
export function getVaultConfigFromEnv(): { vaultPath: string; password: string } | null {
  const vaultPath = process.env.TEST_VAULT_PATH
  const password = process.env.TEST_VAULT_PASSWORD

  if (!vaultPath || !password) {
    return null
  }

  return { vaultPath, password }
}

/**
 * Get secure vault import config from environment variables
 */
export function getSecureVaultConfigFromEnv(): Array<{ vaultPath: string; password: string }> {
  const sharesEnv = process.env.SECURE_VAULT_SHARES
  const password = process.env.SECURE_VAULT_PASSWORD

  if (!sharesEnv || !password) {
    return []
  }

  return sharesEnv
    .split(',')
    .map(s => s.trim())
    .filter(s => existsSync(s))
    .map(vaultPath => ({ vaultPath, password }))
}
