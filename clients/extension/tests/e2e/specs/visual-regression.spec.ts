/**
 * Visual Regression E2E Tests
 *
 * Captures screenshots for visual regression testing.
 * 
 * Note: These tests generate baselines on first run.
 * Run with --update-snapshots to regenerate baselines.
 */

import { test, expect } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'

// Helper to wait for extension UI to fully load (past splash screen)
async function waitForExtensionReady(page: import('@playwright/test').Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button')
    return buttons.length > 0 && Array.from(buttons).some(b => b.offsetParent !== null)
  }, { timeout })
}

test.describe('Visual Regression - Key Screens', () => {
  test('1. Initial load - Shows vultisig branding', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load past splash screen
    await waitForExtensionReady(page)
    
    // Wait for content to stabilize
    await page.waitForTimeout(500)

    // Take baseline screenshot
    await expect(page).toHaveScreenshot('01-initial-load.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    })

    await page.close()
  })

  test('2. After skip/next - Shows navigation options', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load
    await waitForExtensionReady(page)

    // Try to skip or click next
    const skipButton = page.getByRole('button', { name: /skip/i })
    const nextButton = page.getByRole('button', { name: /next/i })
    
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(500)
      await waitForExtensionReady(page)
    } else if (await nextButton.isVisible().catch(() => false)) {
      // Click next a few times
      for (let i = 0; i < 4; i++) {
        if (await nextButton.isVisible().catch(() => false)) {
          await nextButton.click()
          await page.waitForTimeout(200)
        } else {
          break
        }
      }
    }

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('02-after-onboarding.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    })

    await page.close()
  })

  test('3. Setup vault page - Device selection', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load
    await waitForExtensionReady(page)

    // Complete onboarding
    await onboardingPage.completeOnboarding()
    await page.waitForTimeout(500)
    await waitForExtensionReady(page)

    // Click "Next" from NewVaultPage to go to SetupVaultPage
    const nextButton = page.getByRole('button', { name: /next/i }).first()
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click()
      await page.waitForTimeout(1000)
    }

    await expect(page).toHaveScreenshot('03-setup-vault.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    })

    await page.close()
  })

  // Tests requiring seeded vault - skipped for now
  test.describe('With Seeded Vault', () => {
    test.skip('4. Vault page - Main view', async () => {
      // Requires pre-seeded vault
    })

    test.skip('5. Vault page - Chain list', async () => {
      // Requires pre-seeded vault
    })

    test.skip('6. Chain detail page', async () => {
      // Requires pre-seeded vault  
    })

    test.skip('7. Send form - Empty', async () => {
      // Requires pre-seeded vault
    })

    test.skip('8. Send form - Filled', async () => {
      // Requires pre-seeded vault
    })

    test.skip('9. Settings page', async () => {
      // Requires pre-seeded vault
    })

    test.skip('10. Delete vault confirmation', async () => {
      // Requires pre-seeded vault
    })
  })
})
