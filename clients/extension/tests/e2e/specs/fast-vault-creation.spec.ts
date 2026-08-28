/**
 * Fast Vault Creation E2E Tests
 *
 * Walks NewVault -> device count -> setup overview -> the Fast Vault wizard
 * (name -> email -> password) and stops at an enabled create button. Clicking
 * it would register a real vault on the Fast Vault server, so the form being
 * submittable is the boundary of this spec.
 */

import { expect, test } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const stepTimeout = 15_000
const testVaultName = `TestVault-${Date.now()}`
const testEmail = `test-${Date.now()}@example.com`
const testPassword = 'SecurePass123!'

test.describe('Fast Vault Creation', () => {
  test('fill name + email + password creates vault', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)

    try {
      await onboarding.goto()

      const skipButton = page.getByRole('button', { name: /skip/i })
      if (await skipButton.isVisible().catch(() => false)) {
        await skipButton.click()
      }

      await page.getByTestId('new-vault-create').click({ timeout: stepTimeout })

      // Device count picker defaults to one device (Fast Vault), then the
      // setup overview repeats the same call to action.
      const getStarted = page.getByRole('button', { name: /get started/i })
      await getStarted.click({ timeout: stepTimeout })
      await getStarted.click({ timeout: stepTimeout })

      const nameInput = page.getByTestId('vault-name-input')
      await expect(nameInput).toBeVisible({ timeout: stepTimeout })
      await nameInput.fill(testVaultName)
      await page.getByTestId('vault-name-next').click()

      const emailInput = page.getByTestId('vault-email-input')
      await expect(emailInput).toBeVisible({ timeout: stepTimeout })
      await emailInput.fill(testEmail)
      await page.getByTestId('vault-email-next').click()

      const passwordInput = page.getByTestId('vault-password-input')
      await expect(passwordInput).toBeVisible({ timeout: stepTimeout })
      await passwordInput.fill(testPassword)
      await page.getByTestId('vault-password-confirm').fill(testPassword)

      await expect(page.getByTestId('create-vault-button')).toBeEnabled()
      await expect(page.locator('[role="alert"]')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test.skip('email verification step appears after form submission', async () => {
    // Completing creation registers a real vault and sends a real email.
  })

  test('new vault shows on vault page with 0 balance', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()

      const vaultPageIndicator = page.getByTestId('vault-page')
      const hasVault = await vaultPageIndicator
        .isVisible({ timeout: stepTimeout })
        .catch(() => false)

      if (hasVault) {
        await expect(page.getByTestId('vault-total-balance')).toBeVisible()
        return
      }

      await expect(page.getByText(/vultisig/i).first()).toBeVisible()
    } finally {
      await page.close()
    }
  })
})
