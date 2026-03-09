/**
 * Visual Regression E2E Tests
 *
 * Captures screenshots for visual regression testing.
 * First 10 key screens as per spec.
 */

import { test, expect } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'
import { VaultPage } from '../page-objects/VaultPage.po'
import {
  maskBalances,
  maskDynamicContent,
  DYNAMIC_SELECTORS,
} from '../helpers/screenshot'

test.describe('Visual Regression - Key Screens', () => {
  test('1. Onboarding - Initial load', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    await onboardingPage.waitForView()

    // Take baseline screenshot
    await expect(page).toHaveScreenshot('01-onboarding-initial.png', {
      maxDiffPixels: 100,
    })

    await page.close()
  })

  test('2. Vault type selection - 3 options visible', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()

    // Skip through onboarding to vault type selection
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
    } else {
      // Click through onboarding
      const nextButton = page.getByRole('button', { name: /next/i })
      while (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(300)
      }
    }

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('02-vault-type-selection.png', {
      maxDiffPixels: 100,
    })

    await page.close()
  })

  test('3. FastVault form - Empty state', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()

    // Navigate to FastVault form
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
    }
    await page.waitForTimeout(300)

    // Click FastVault option
    const fastVaultOption = page.getByText(/fast.*vault/i).first()
    if (await fastVaultOption.isVisible()) {
      await fastVaultOption.click()
      await page.waitForTimeout(500)
    }

    await expect(page).toHaveScreenshot('03-fastvault-form-empty.png', {
      maxDiffPixels: 100,
    })

    await page.close()
  })

  test('4. FastVault form - Filled', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()

    // Navigate to FastVault form
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
    }
    await page.waitForTimeout(300)

    const fastVaultOption = page.getByText(/fast.*vault/i).first()
    if (await fastVaultOption.isVisible()) {
      await fastVaultOption.click()
      await page.waitForTimeout(500)
    }

    // Fill the form
    const nameInput = page.locator('[data-testid="vault-name-input"]')
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Visual Vault')
    }

    const emailInput = page.locator('[data-testid="vault-email-input"]')
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com')
    }

    await expect(page).toHaveScreenshot('04-fastvault-form-filled.png', {
      maxDiffPixels: 100,
    })

    await page.close()
  })

  test('5. FastVault form - Validation errors', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()

    // Navigate to FastVault form
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
    }
    await page.waitForTimeout(300)

    const fastVaultOption = page.getByText(/fast.*vault/i).first()
    if (await fastVaultOption.isVisible()) {
      await fastVaultOption.click()
      await page.waitForTimeout(500)
    }

    // Fill with invalid data to trigger validation
    const nameInput = page.locator('[data-testid="vault-name-input"]')
    if (await nameInput.isVisible()) {
      await nameInput.fill('A') // Too short
      await nameInput.blur()
    }

    const emailInput = page.locator('[data-testid="vault-email-input"]')
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email') // Invalid email
      await emailInput.blur()
    }

    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('05-fastvault-form-validation.png', {
      maxDiffPixels: 100,
    })

    await page.close()
  })

  // Tests 6-10 require a seeded vault
  test.describe('With Seeded Vault', () => {
    test.skip('6. Vault page - With balances (masked)', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)

      await vaultPage.goto()
      await vaultPage.waitForView()

      // Mask dynamic balance content
      await maskBalances(page)

      await expect(page).toHaveScreenshot('06-vault-page-with-balances.png', {
        maxDiffPixels: 200,
        mask: [page.locator('[data-testid="balance-value"]')],
      })

      await page.close()
    })

    test.skip('7. Vault page - Empty vault (0 balance)', async ({ context, extensionId }) => {
      // This would need a vault with 0 balance
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)

      await vaultPage.goto()
      await vaultPage.waitForView()

      await expect(page).toHaveScreenshot('07-vault-page-empty.png', {
        maxDiffPixels: 200,
      })

      await page.close()
    })

    test.skip('8. Chain detail page (masked)', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)

      await vaultPage.goto()
      await vaultPage.waitForView()

      // Click on first chain
      const chains = await vaultPage.getVisibleChains()
      if (chains.length > 0) {
        await vaultPage.navigateToChain(chains[0])
        await page.waitForTimeout(500)

        // Mask balances and addresses
        await maskDynamicContent(page, [
          ...DYNAMIC_SELECTORS.balances,
          ...DYNAMIC_SELECTORS.addresses,
        ])

        await expect(page).toHaveScreenshot('08-chain-detail.png', {
          maxDiffPixels: 200,
        })
      }

      await page.close()
    })

    test.skip('9. Send form - Empty state', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)

      await vaultPage.goto()
      await vaultPage.waitForView()
      await vaultPage.navigateToSend()

      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('09-send-form-empty.png', {
        maxDiffPixels: 200,
      })

      await page.close()
    })

    test.skip('10. Send form - Filled (masked)', async ({ context, extensionId }) => {
      const page = await context.newPage()
      const vaultPage = new VaultPage(page, extensionId)

      await vaultPage.goto()
      await vaultPage.waitForView()
      await vaultPage.navigateToSend()

      await page.waitForTimeout(500)

      // Fill send form
      const addressInput = page.locator('[data-testid="send-address-input"]')
      if (await addressInput.isVisible()) {
        await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb6d')
      }

      const amountInput = page.locator('[data-testid="send-amount-input"]')
      if (await amountInput.isVisible()) {
        await amountInput.fill('0.001')
      }

      await page.waitForTimeout(500)

      // Mask balances
      await maskBalances(page)

      await expect(page).toHaveScreenshot('10-send-form-filled.png', {
        maxDiffPixels: 200,
      })

      await page.close()
    })
  })
})
