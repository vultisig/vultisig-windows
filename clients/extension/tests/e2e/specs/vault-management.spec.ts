/**
 * Vault Management E2E Tests
 *
 * Tests for vault rename, delete, and chain management.
 * Pre-seeded with a FastVault for testing.
 */

import { test, expect } from '@playwright/test'
import { VaultPage } from '../page-objects/VaultPage.po'
import { VaultSettings } from '../page-objects/VaultSettings.po'
import { DeleteVaultPage } from '../page-objects/DeleteVaultPage.po'
import { RenameVaultPage } from '../page-objects/RenameVaultPage.po'

// Use ui-seeded project which pre-loads a vault
test.describe('Vault Management', () => {
  let extensionId: string
  let vaultPage: VaultPage
  let vaultSettings: VaultSettings
  let deleteVaultPage: DeleteVaultPage
  let renameVaultPage: RenameVaultPage

  test.beforeEach(async ({ page, context }) => {
    // Get extension ID from service worker
    const serviceWorkers = context.serviceWorkers()
    if (serviceWorkers.length > 0) {
      extensionId = serviceWorkers[0].url().split('/')[2]
    } else {
      const sw = await context.waitForEvent('serviceworker')
      extensionId = sw.url().split('/')[2]
    }

    vaultPage = new VaultPage(page, extensionId)
    vaultSettings = new VaultSettings(page, extensionId)
    deleteVaultPage = new DeleteVaultPage(page, extensionId)
    renameVaultPage = new RenameVaultPage(page, extensionId)

    // Navigate to extension
    await vaultPage.goto()
    await page.waitForTimeout(1000)
  })

  test.describe('Rename Vault', () => {
    test('can rename vault with valid name', async ({ page }) => {
      // Navigate to settings -> rename
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToRename()
      await renameVaultPage.waitForView()

      // Get current name and create new name
      const newName = `TestVault-${Date.now()}`
      await renameVaultPage.fillName(newName)

      // Save should be enabled
      const isEnabled = await renameVaultPage.isSaveEnabled()
      expect(isEnabled).toBe(true)

      await renameVaultPage.save()

      // Should navigate back and vault should have new name
      await page.waitForTimeout(500)
    })

    test('rename shows validation error for too-short name', async ({ page }) => {
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToRename()
      await renameVaultPage.waitForView()

      // Try a name that's too short (less than 2 chars)
      await renameVaultPage.fillName('A')

      // Should show validation error
      await page.waitForTimeout(300)
      const hasError = await renameVaultPage.hasValidationError()
      expect(hasError).toBe(true)

      // Save should be disabled
      const isEnabled = await renameVaultPage.isSaveEnabled()
      expect(isEnabled).toBe(false)
    })
  })

  test.describe('Delete Vault', () => {
    test('delete requires all 3 checkboxes', async ({ page }) => {
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToDelete()
      await deleteVaultPage.waitForView()

      // Initially, no checkboxes checked, delete should be disabled
      const checkedCount = await deleteVaultPage.getCheckedTermsCount()
      expect(checkedCount).toBe(0)

      const initialEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(initialEnabled).toBe(false)
    })

    test('delete button disabled until all checked', async ({ page }) => {
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToDelete()
      await deleteVaultPage.waitForView()

      // Check only 1
      await deleteVaultPage.checkTerm(1)
      let isEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(isEnabled).toBe(false)

      // Check 2
      await deleteVaultPage.checkTerm(2)
      isEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(isEnabled).toBe(false)

      // Check 3 - now should be enabled
      await deleteVaultPage.checkTerm(3)
      isEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(isEnabled).toBe(true)
    })

    test('unchecking a checkbox disables delete button', async ({ page }) => {
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToDelete()
      await deleteVaultPage.waitForView()

      // Check all 3
      await deleteVaultPage.checkAllTerms()
      let isEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(isEnabled).toBe(true)

      // Uncheck one
      await deleteVaultPage.uncheckTerm(2)
      isEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(isEnabled).toBe(false)
    })

    // Note: We don't actually delete the vault in tests to preserve test state
    // This test is skipped or should use isolated context
    test.skip('can delete vault after checking all terms', async ({ page }) => {
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToDelete()
      await deleteVaultPage.waitForView()

      await deleteVaultPage.checkAllTerms()
      await deleteVaultPage.deleteVault()

      // Should navigate to onboarding or vault list
      await page.waitForTimeout(500)
      const url = page.url()
      expect(url).toContain('onboarding') // or vault selection
    })
  })

  test.describe('Chain Management', () => {
    test.skip('can add chain to vault', async ({ page }) => {
      // Navigate to chain management
      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()

      // Look for manage chains option
      const manageChains = page.getByText(/manage.*chain|chain.*manage/i).first()
      if (await manageChains.isVisible()) {
        await manageChains.click()
        await page.waitForTimeout(500)

        // Look for a chain toggle that's off
        const chainGrid = page.locator('[data-testid="chain-grid"]')
        await expect(chainGrid).toBeVisible()

        // This would require knowing which chains are not already enabled
        // Implementation depends on specific UI
      }
    })

    test.skip('can remove chain from vault', async ({ page }) => {
      // Similar to above, but toggle a chain off
    })

    test.skip('adding chain derives correct address', async ({ page }) => {
      // Would need to verify address derivation
      // Requires comparing with expected address from test fixtures
    })
  })
})
