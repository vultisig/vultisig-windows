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
  test('fast-vault wizard accepts name, email and password', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)

    try {
      await onboarding.goto()

      // A fresh profile may open on onboarding or straight on NewVault; wait
      // for whichever mounts instead of probing before render.
      const newVaultCreate = page.getByTestId('new-vault-create')
      await expect(
        newVaultCreate.or(onboarding.skipButton).first()
      ).toBeVisible({ timeout: stepTimeout })
      if (await onboarding.skipButton.isVisible()) {
        await onboarding.skipButton.click()
      }
      await newVaultCreate.click({ timeout: stepTimeout })

      // Device count picker defaults to one device (Fast Vault); the setup
      // overview repeats the same call to action, so wait for the route flip.
      const getStarted = page.getByRole('button', { name: /get started/i })
      await getStarted.first().click({ timeout: stepTimeout })
      await expect(
        page.getByTestId('vault-setup-overview-content')
      ).toBeVisible({ timeout: stepTimeout })
      await getStarted.first().click({ timeout: stepTimeout })

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
    } finally {
      await page.close()
    }
  })

  test.skip('email verification step appears after form submission', async () => {
    // Completing creation registers a real vault and sends a real email.
  })

  test('fresh profile lands on the new-vault page', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await expect(page.getByTestId('new-vault-create')).toBeVisible({
        timeout: stepTimeout,
      })
    } finally {
      await page.close()
    }
  })
})
