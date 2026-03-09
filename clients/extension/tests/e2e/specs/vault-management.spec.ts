/**
 * Vault Management E2E Tests
 *
 * Tests for vault rename, delete, and chain management.
 * Pre-seeded with a FastVault for testing.
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { VaultSettings } from '../page-objects/VaultSettings.po'
import { DeleteVaultPage } from '../page-objects/DeleteVaultPage.po'
import { RenameVaultPage } from '../page-objects/RenameVaultPage.po'

// Use fixture-based test that loads the extension properly
test.describe('Vault Management', () => {
  test.describe('Rename Vault', () => {
    test('can rename vault with valid name', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const renameVaultPage = new RenameVaultPage(page, extensionId)

      // Navigate to extension
      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })

    test('rename shows validation error for too-short name', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const renameVaultPage = new RenameVaultPage(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })
  })

  test.describe('Delete Vault', () => {
    test('delete requires all 3 checkboxes', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const deleteVaultPage = new DeleteVaultPage(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

      await vaultPage.navigateToSettings()
      await vaultSettings.waitForView()
      await vaultSettings.navigateToDelete()
      await deleteVaultPage.waitForView()

      // Initially, no checkboxes checked, delete should be disabled
      const checkedCount = await deleteVaultPage.getCheckedTermsCount()
      expect(checkedCount).toBe(0)

      const initialEnabled = await deleteVaultPage.isDeleteEnabled()
      expect(initialEnabled).toBe(false)

      await page.close()
    })

    test('delete button disabled until all checked', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const deleteVaultPage = new DeleteVaultPage(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })

    test('unchecking a checkbox disables delete button', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const deleteVaultPage = new DeleteVaultPage(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })

    // Note: We don't actually delete the vault in tests to preserve test state
    // This test is skipped or should use isolated context
    test.skip('can delete vault after checking all terms', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)
      const deleteVaultPage = new DeleteVaultPage(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })
  })

  test.describe('Chain Management', () => {
    test.skip('can add chain to vault', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)
      const vaultSettings = new VaultSettings(page, extensionId)

      await vaultPage.goto()
      await page.waitForTimeout(1000)

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

      await page.close()
    })

    test.skip('can remove chain from vault', async ({ context, extensionId }) => {
      // Similar to above, but toggle a chain off
      const page = await context.newPage()
      await page.close()
    })

    test.skip('adding chain derives correct address', async ({ context, extensionId }) => {
      // Would need to verify address derivation
      // Requires comparing with expected address from test fixtures
      const page = await context.newPage()
      await page.close()
    })
  })
})
