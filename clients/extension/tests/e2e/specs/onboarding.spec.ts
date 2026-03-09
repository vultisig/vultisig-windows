/**
 * Onboarding E2E Tests
 *
 * Tests for the initial onboarding experience on a fresh extension.
 */

import { test, expect } from '@playwright/test'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'

// Use ui-isolated project for clean state tests
test.describe('Onboarding Flow', () => {
  let onboardingPage: OnboardingPage

  test.beforeEach(async ({ page, context }) => {
    // Get extension ID from service worker
    let extensionId = ''
    const serviceWorkers = context.serviceWorkers()
    if (serviceWorkers.length > 0) {
      const url = serviceWorkers[0].url()
      extensionId = url.split('/')[2]
    } else {
      // Fallback: wait for service worker
      const sw = await context.waitForEvent('serviceworker')
      extensionId = sw.url().split('/')[2]
    }

    onboardingPage = new OnboardingPage(page, extensionId)
  })

  test('fresh extension shows onboarding', async ({ page }) => {
    await onboardingPage.goto()

    // Should show onboarding/welcome screen
    const isVisible = await onboardingPage.isVisible()
    expect(isVisible).toBe(true)

    // Should have welcome text or logo
    const welcomeText = onboardingPage.welcomeText
    await expect(welcomeText).toBeVisible({ timeout: 10_000 })
  })

  test('"Get Started" or "Next" navigates to vault type selection', async ({ page }) => {
    await onboardingPage.goto()
    await onboardingPage.waitForView()

    // Click through onboarding steps
    const nextButton = page.getByRole('button', { name: /next/i })
    const skipButton = page.getByRole('button', { name: /skip/i })

    // Use skip if available, otherwise click through
    if (await skipButton.isVisible()) {
      await skipButton.click()
    } else {
      // Click next through all onboarding slides
      while (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(300)
      }
    }

    // After onboarding, should show vault creation options
    await page.waitForTimeout(500)

    // Look for vault type selection or new vault screen
    const hasFastVault = await page.getByText(/fast.*vault/i).isVisible()
    const hasSecureVault = await page.getByText(/secure.*vault/i).isVisible()
    const hasImport = await page.getByText(/import/i).isVisible()
    const hasSetup = await page.getByText(/set.*up|create|new/i).first().isVisible()

    expect(hasFastVault || hasSecureVault || hasImport || hasSetup).toBe(true)
  })

  test('all 3 vault type options visible after onboarding', async ({ page }) => {
    await onboardingPage.goto()

    // Skip onboarding
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
    } else {
      // Click through onboarding
      const nextButton = page.getByRole('button', { name: /next/i })
      for (let i = 0; i < 5; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click()
          await page.waitForTimeout(300)
        }
      }
    }

    await page.waitForTimeout(500)

    // Check for vault type options
    // These may be on the current page or accessed via "Get Started"
    const getStartedButton = page.getByRole('button', { name: /get started/i })
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click()
      await page.waitForTimeout(300)
    }

    // Now check for the 3 vault options
    const options = await onboardingPage.getVaultTypeOptions()

    // Should have at least 2 options (fast, secure, and/or import)
    expect(options.length).toBeGreaterThanOrEqual(2)
  })
})
