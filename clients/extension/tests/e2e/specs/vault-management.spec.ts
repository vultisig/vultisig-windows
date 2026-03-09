/**
 * Vault Management E2E Tests
 *
 * Tests for vault rename, delete, and chain management.
 * These tests require a pre-seeded vault or will be skipped.
 * 
 * Note: Currently skipped because these tests require:
 * 1. A pre-seeded vault in the extension's IndexedDB
 * 2. Or a way to programmatically create a vault before tests
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'

// Helper to wait for extension UI to fully load (past splash screen)
async function waitForExtensionReady(page: import('@playwright/test').Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button')
    return buttons.length > 0 && Array.from(buttons).some(b => b.offsetParent !== null)
  }, { timeout })
}

// Skip these tests until we have vault seeding mechanism
test.describe('Vault Management', () => {
  // Helper to check if we have a vault loaded
  async function hasVaultLoaded(page: import('@playwright/test').Page): Promise<boolean> {
    // Check for vault page indicator
    const vaultPageIndicator = page.locator('[data-testid="vault-page"]')
    return vaultPageIndicator.isVisible().catch(() => false)
  }

  test.describe('Rename Vault', () => {
    test.skip('can rename vault with valid name', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('rename shows validation error for too-short name', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })
  })

  test.describe('Delete Vault', () => {
    test.skip('delete requires all 3 checkboxes', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('delete button disabled until all checked', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('unchecking a checkbox disables delete button', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('can delete vault after checking all terms', async ({ context, extensionId }) => {
      // Skipped: Would destroy test fixture
    })
  })

  test.describe('Chain Management', () => {
    test.skip('can add chain to vault', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('can remove chain from vault', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })

    test.skip('adding chain derives correct address', async ({ context, extensionId }) => {
      // Skipped: Requires pre-seeded vault
    })
  })

  // Basic test that verifies the flow without vault
  test('extension loads and shows initial screen', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    await vaultPage.goto()
    
    // Wait for extension to fully load
    await waitForExtensionReady(page)

    // Extension should show some UI
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Should show either vault page or vultisig branding
    const hasVault = await hasVaultLoaded(page)
    const hasVultisig = await page.getByText(/vultisig/i).first().isVisible().catch(() => false)

    // At least one should be true
    expect(hasVault || hasVultisig).toBe(true)

    await page.close()
  })
})
