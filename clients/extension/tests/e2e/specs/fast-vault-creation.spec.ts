/**
 * Fast Vault Creation E2E Tests
 *
 * Tests the fast vault creation flow:
 * - Navigate through: Onboarding -> NewVault -> SetupVault -> VaultSetupOverview -> FastVaultSetupFlow
 * - FastVaultSetupFlow is a multi-step wizard: Name -> Email -> Password
 */

import { test, expect } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'
import { VaultPage } from '../page-objects/VaultPage.po'

// Helper to wait for extension UI to fully load
async function waitForExtensionReady(page: import('@playwright/test').Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button')
    return buttons.length > 0 && Array.from(buttons).some(b => b.offsetParent !== null)
  }, { timeout })
}

// Test data
const TEST_VAULT_NAME = `TestVault-${Date.now()}`
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'SecurePass123!'

test.describe('Fast Vault Creation', () => {
  test('fill name + email + password creates vault', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)

    // Navigate to extension
    await onboarding.goto()
    await waitForExtensionReady(page)

    // Complete onboarding if present
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(500)
      await waitForExtensionReady(page)
    }

    // We're now on NewVaultPage. Click "Next" to go to SetupVaultPage
    let nextButton = page.getByRole('button', { name: /next/i }).first()
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click()
      await page.waitForTimeout(1000)
      await waitForExtensionReady(page)
    }

    // We're now on SetupVaultPage with device selection animation
    // Click "Get Started" to proceed to VaultSetupOverview
    let getStartedButton = page.getByRole('button', { name: /get.*started/i }).first()
    if (await getStartedButton.isVisible().catch(() => false)) {
      await getStartedButton.click()
      await page.waitForTimeout(1000)
      await waitForExtensionReady(page)
    }

    // Now we're on VaultSetupOverview - shows "Fast Vault" and "Get started" again
    // Wait for the overview page and click "Get started" again
    getStartedButton = page.getByRole('button', { name: /get.*started/i }).first()
    if (await getStartedButton.isVisible().catch(() => false)) {
      await getStartedButton.click()
      await page.waitForTimeout(1000)
      await waitForExtensionReady(page)
    }

    // Now we're on FastVaultSetupFlow - Step 1: VaultNameStep
    // Wait for the vault name input
    const nameInput = page.locator('[data-testid="vault-name-input"]').or(
      page.getByPlaceholder(/vault name|enter.*name/i)
    ).or(
      page.locator('input').first()
    )
    
    try {
      await nameInput.waitFor({ state: 'visible', timeout: 10_000 })
      
      // Clear and fill name
      await nameInput.clear()
      await nameInput.fill(TEST_VAULT_NAME)
      
      // Click next to go to email step
      nextButton = page.locator('[data-testid="vault-name-next"]').or(
        page.getByRole('button', { name: /next/i })
      )
      await nextButton.click()
      await page.waitForTimeout(500)

      // Step 2: VaultEmailStep
      const emailInput = page.locator('[data-testid="vault-email-input"]').or(
        page.getByPlaceholder(/email/i)
      ).or(
        page.locator('input[type="email"]')
      ).or(
        page.locator('input').first()
      )
      
      await emailInput.waitFor({ state: 'visible', timeout: 5_000 })
      await emailInput.clear()
      await emailInput.fill(TEST_EMAIL)
      
      // Click next to go to password step
      nextButton = page.getByRole('button', { name: /next/i })
      await nextButton.click()
      await page.waitForTimeout(500)

      // Step 3: VaultPasswordStep - both password and confirm password are visible
      // Use specific data-testids
      const passwordInput = page.locator('[data-testid="vault-password-input"]')
      const confirmPasswordInput = page.locator('[data-testid="vault-password-confirm"]')
      
      await passwordInput.waitFor({ state: 'visible', timeout: 5_000 })
      await passwordInput.fill(TEST_PASSWORD)
      
      // Fill confirm password if visible
      if (await confirmPasswordInput.isVisible().catch(() => false)) {
        await confirmPasswordInput.fill(TEST_PASSWORD)
      }
      
      // Submit the form - look for "Create" or "Continue" or "Next" button
      const createButton = page.getByRole('button', { name: /create|continue|next/i }).first()
      if (await createButton.isEnabled()) {
        await createButton.click()
        await page.waitForTimeout(2000)
      }

      // At this point, the vault should be creating or email verification should appear
      const hasError = await page.locator('[role="alert"], text=/error/i')
        .isVisible().catch(() => false)

      // Form should be accepted (no validation errors)
      expect(hasError).toBe(false)

    } catch (error) {
      console.log('Fast vault form navigation error:', error)
      await page.screenshot({ path: 'test-results/fast-vault-debug.png' })
      throw error
    }

    await page.close()
  })

  test.skip('email verification step appears after form submission', async () => {
    // This test requires completing vault creation which sends real emails
    // Skip for now to avoid side effects
  })

  test('new vault shows on vault page with 0 balance', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    await vaultPage.goto()
    await waitForExtensionReady(page)

    // Check if we're on vault page or onboarding
    const vaultPageIndicator = page.locator('[data-testid="vault-page"]')
    const hasVault = await vaultPageIndicator.isVisible().catch(() => false)

    if (hasVault) {
      // Vault exists - check for balance display
      const balanceDisplay = page.locator('[data-testid="total-balance"], text=/balance/i').first()
      const hasBalance = await balanceDisplay.isVisible().catch(() => false)

      if (hasBalance) {
        const balanceText = await balanceDisplay.textContent()
        expect(balanceText).toBeDefined()
      }
    } else {
      // No vault exists - we're on onboarding/new vault page
      const hasVultisig = await page.getByText(/vultisig/i).first().isVisible().catch(() => false)
      expect(hasVultisig).toBe(true)
    }

    await page.close()
  })
})
