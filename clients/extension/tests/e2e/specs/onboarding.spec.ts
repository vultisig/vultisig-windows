/**
 * Onboarding E2E Tests
 *
 * Tests for the initial onboarding experience on a fresh extension.
 * 
 * Actual UI flow:
 * 1. Loading/splash screen (shows just logo)
 * 2. OnboardingPage - Shows "vultisig" logo/text, onboarding slides, Next/Skip buttons
 *    OR
 * 2. NewVaultPage - Shows "vultisig" logo, Scan QR, Import, Next buttons (if onboarding completed)
 * 3. SetupVaultPage - Shows device selection animation, Get Started button
 */

import { test, expect } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'

// Helper to wait for extension UI to fully load (past splash screen)
async function waitForExtensionReady(page: import('@playwright/test').Page, timeout = 15_000): Promise<void> {
  // Wait for either:
  // - A button to appear (Next, Skip, Import, Scan QR)
  // - Text content like "Vultisig" with buttons
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button')
    // Extension is ready when we have at least one button visible
    return buttons.length > 0 && Array.from(buttons).some(b => b.offsetParent !== null)
  }, { timeout })
}

test.describe('Onboarding Flow', () => {
  test('fresh extension shows onboarding or new vault page', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load past splash screen
    await waitForExtensionReady(page)

    // Should show vultisig branding
    const vultisigText = page.getByText(/vultisig/i).first()
    await expect(vultisigText).toBeVisible({ timeout: 10_000 })

    await page.close()
  })

  test('can navigate through onboarding with Next or Skip', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load
    await waitForExtensionReady(page)

    // Look for navigation buttons (Next or Skip or Import)
    const nextButton = page.getByRole('button', { name: /next/i }).first()
    const skipButton = page.getByRole('button', { name: /skip/i }).first()
    const importButton = page.getByRole('button', { name: /import/i }).first()

    // Should have at least one navigation option
    const hasNext = await nextButton.isVisible().catch(() => false)
    const hasSkip = await skipButton.isVisible().catch(() => false)
    const hasImport = await importButton.isVisible().catch(() => false)

    expect(hasNext || hasSkip || hasImport).toBe(true)

    await page.close()
  })

  test('NewVaultPage shows vault creation options', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    
    // Wait for extension to fully load
    await waitForExtensionReady(page)

    // Skip onboarding if we're on onboarding page (has Skip button)
    const skipButton = page.getByRole('button', { name: /skip/i })
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(500)
      await waitForExtensionReady(page)
    }

    // Now should be on NewVaultPage with these options:
    // - "Scan QR" button
    // - "Import" button  
    // - "Next" button (to create new vault)
    
    const options = await onboardingPage.getVaultTypeOptions()
    
    // Should have at least one option available
    expect(options.length).toBeGreaterThanOrEqual(1)

    await page.close()
  })

  test('Rive plus control selects a two-device vault', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    await waitForExtensionReady(page)
    await onboardingPage.completeOnboarding()
    await onboardingPage.navigateToSetupVault()

    const riveCanvas = page.locator('canvas').first()
    const canvasBounds = await riveCanvas.boundingBox()
    expect(canvasBounds).not.toBeNull()

    if (!canvasBounds) {
      throw new Error('Device-selection Rive canvas is unavailable')
    }

    const plusY = canvasBounds.y + canvasBounds.height * 0.29
    // The Rive +/- controls remain the primary interaction.
    await page.mouse.click(
      canvasBounds.x + canvasBounds.width * 0.91,
      plusY
    )

    await page.getByRole('button', { name: /get.*started/i }).first().click()
    await expect(
      page.locator('[data-testid="vault-setup-overview-content"]')
    ).toContainText(/2-device vault/i)

    await page.close()
  })

  test('Rive slider drag selects a four-device vault', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const onboardingPage = new OnboardingPage(page, extensionId)

    await onboardingPage.goto()
    await waitForExtensionReady(page)
    await onboardingPage.completeOnboarding()
    await onboardingPage.navigateToSetupVault()

    const riveCanvas = page.locator('canvas').first()
    const canvasBounds = await riveCanvas.boundingBox()
    expect(canvasBounds).not.toBeNull()

    if (!canvasBounds) {
      throw new Error('Device-selection Rive canvas is unavailable')
    }

    const sliderY = canvasBounds.y + canvasBounds.height * 0.39
    await page.mouse.move(canvasBounds.x + canvasBounds.width * 0.1, sliderY)
    await page.mouse.down()
    await page.mouse.move(canvasBounds.x + canvasBounds.width * 0.9, sliderY)
    await page.mouse.up()

    await page.getByRole('button', { name: /get.*started/i }).first().click()
    await expect(
      page.locator('[data-testid="vault-setup-overview-content"]')
    ).toContainText(/4\+-device vault/i)

    await page.close()
  })
})
