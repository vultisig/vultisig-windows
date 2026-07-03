/**
 * Vault Import/Export E2E Tests
 *
 * Tests for vault backup import functionality.
 * Uses the actual UI flow via importVaultViaUI helper.
 */

import type { Locator } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  getSecureVaultConfigFromEnv,
  getVaultConfigFromEnv,
  importVaultViaUI,
} from '../helpers/vault-import'
import { VaultPage } from '../page-objects/VaultPage.po'

const getWrongPassword = (password: string) => `${password}-wrong-password`

const isVisibleWithin = async (locator: Locator, timeout = 3_000) => {
  try {
    await locator.waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

const clickFirstVisible = async (...locators: Locator[]) => {
  for (const locator of locators) {
    if (await isVisibleWithin(locator)) {
      await locator.click()
      return true
    }
  }

  return false
}

test.describe('Vault Import', () => {
  test('import FastVault .vult file with password succeeds', async ({
    context,
    extensionId,
  }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      test.skip(true, 'No FastVault config')
      return
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      // Import via UI
      const result = await importVaultViaUI(page, {
        extensionId,
        vaultPath: config.vaultPath,
        password: config.password,
      })

      expect(result).toBe(true)

      // Verify vault page loads (waitForView confirms we're on vault page, not onboarding)
      await vaultPage.waitForView(15_000)

      // Verify balance area is visible (confirms vault loaded)
      const balanceText = await vaultPage.getTotalBalance()
      console.log('Vault balance:', balanceText)

      // Verify we can see portfolio/chains (vault is functional)
      const hasChains = await vaultPage.page
        .locator('text=/ethereum|bitcoin|solana|portfolio/i')
        .first()
        .isVisible()
        .catch(() => false)
      console.log('Has chain indicators:', hasChains)
      expect(hasChains).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('import SecureVault .vult file with password succeeds', async ({
    context,
    extensionId,
  }) => {
    const [config] = getSecureVaultConfigFromEnv()
    if (!config) {
      test.skip(true, 'No SecureVault config')
      return
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      // Import via UI
      const result = await importVaultViaUI(page, {
        extensionId,
        vaultPath: config.vaultPath,
        password: config.password,
      })

      expect(result).toBe(true)

      // Verify vault page loads
      await vaultPage.waitForView(15_000)

      // Verify we can see portfolio/chains (vault is functional)
      const hasChains = await vaultPage.page
        .locator('text=/ethereum|bitcoin|solana|portfolio/i')
        .first()
        .isVisible()
        .catch(() => false)
      console.log('SecureVault has chain indicators:', hasChains)
      expect(hasChains).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('import with wrong password shows error or stays on password page', async ({
    context,
    extensionId,
  }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      test.skip(true, 'No FastVault config')
      return
    }

    const page = await context.newPage()

    try {
      // Navigate to extension
      await page.goto(`chrome-extension://${extensionId}/popup.html`)
      await page.waitForTimeout(2000)

      // Check if we're on new vault page or existing vault
      const pageText = (await page.locator('body').textContent()) || ''

      // If extension already has a vault from prior test, skip
      if (
        !pageText.toLowerCase().includes('import') &&
        !pageText.toLowerCase().includes('create')
      ) {
        console.log('Extension already has vault, skipping wrong password test')
        test.skip()
        return
      }

      // Find Import button
      const importBtn = page.getByText(/import/i).first()
      if (!(await isVisibleWithin(importBtn, 5_000))) {
        console.log('Import button not visible, skipping')
        test.skip()
        return
      }

      await importBtn.click()
      await page.waitForTimeout(500)

      // Find "Import vault share" option
      const importShareOption = page
        .getByText(/import.*vault.*share|vault.*share/i)
        .first()
      if (await isVisibleWithin(importShareOption)) {
        await importShareOption.click()
        await page.waitForTimeout(500)
      }

      // Upload file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.waitFor({ state: 'attached', timeout: 5000 })
      await fileInput.setInputFiles(config.vaultPath)
      await page.waitForTimeout(500)

      // Click Continue
      const continueBtn = page.getByRole('button', { name: /continue/i })
      if (await isVisibleWithin(continueBtn)) {
        await continueBtn.click()
        await page.waitForTimeout(500)
      }

      // Enter WRONG password
      const passwordInput = page.locator('input[type="password"]')
      if (await isVisibleWithin(passwordInput)) {
        await passwordInput.fill(getWrongPassword(config.password))
        await page.waitForTimeout(300)

        // Submit
        const submitted = await clickFirstVisible(
          page.locator('[data-testid="fast-vault-submit"]').first(),
          page
            .getByRole('button', {
              name: /submit|confirm|continue|unlock/i,
            })
            .first()
        )
        expect(submitted).toBe(true)
        await page.waitForTimeout(1500)

        // Should show error or stay on password page (not navigate to vault)
        const stillOnPassword = await passwordInput
          .isVisible()
          .catch(() => false)
        const bodyText = (await page.locator('body').textContent()) || ''
        const hasErrorText =
          bodyText.toLowerCase().includes('invalid') ||
          bodyText.toLowerCase().includes('wrong') ||
          bodyText.toLowerCase().includes('incorrect')

        console.log('Still on password page:', stillOnPassword)
        console.log('Has error text:', hasErrorText)

        // Either error shown OR still on password page = test passes
        expect(stillOnPassword || hasErrorText).toBe(true)
      } else {
        console.log('Vault does not require password, skipping')
        test.skip()
      }
    } finally {
      await page.close()
    }
  })

  test('imported vault persists across page reloads', async ({
    context,
    extensionId,
  }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      test.skip(true, 'No vault config')
      return
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      // Import vault
      const result = await importVaultViaUI(page, {
        extensionId,
        vaultPath: config.vaultPath,
        password: config.password,
      })
      expect(result).toBe(true)

      // Verify vault page loads
      await vaultPage.waitForView(15_000)

      // Check for chains before reload
      const hasChainsBefore = await page
        .locator('text=/ethereum|bitcoin|solana|portfolio/i')
        .first()
        .isVisible()
        .catch(() => false)
      console.log('Has chains before reload:', hasChainsBefore)

      // Reload page
      await page.reload()
      await page.waitForTimeout(2000)

      // Vault should still be there (not show onboarding)
      await vaultPage.waitForView(15_000)

      // Check for chains after reload
      const hasChainsAfter = await page
        .locator('text=/ethereum|bitcoin|solana|portfolio/i')
        .first()
        .isVisible()
        .catch(() => false)
      console.log('Has chains after reload:', hasChainsAfter)

      expect(hasChainsAfter).toBe(true)
    } finally {
      await page.close()
    }
  })
})

test.describe('Vault Export', () => {
  // Export tests need more UI exploration - keeping as stubs for now
  test.skip('export vault without password downloads .vult file', async () => {
    // TODO: Navigate to Settings > Backup > Device Backup
    // Download backup without password
    // Verify .vult file downloaded
  })

  test.skip('export vault with password downloads encrypted .vult', async () => {
    // TODO: Navigate to Settings > Backup
    // Enter password for encrypted backup
    // Download and verify
  })
})
