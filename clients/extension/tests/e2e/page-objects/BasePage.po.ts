/**
 * Base Page Object Model
 *
 * Common functionality for all extension page objects.
 * Provides waitForView(), screenshot(name), goBack(), extensionUrl()
 */

import { type Page, type Locator, expect } from '@playwright/test'

export abstract class BasePage {
  readonly page: Page
  readonly extensionId: string

  constructor(page: Page, extensionId: string) {
    this.page = page
    this.extensionId = extensionId
  }

  /**
   * Get extension URL for a given path
   */
  extensionUrl(path = 'index.html'): string {
    return `chrome-extension://${this.extensionId}/${path}`
  }

  /**
   * Navigate to extension popup
   */
  async goto(path = 'index.html'): Promise<void> {
    await this.page.goto(this.extensionUrl(path))
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Wait for a specific view/page to be visible
   * Override in subclasses to specify the root element
   */
  abstract waitForView(timeout?: number): Promise<void>

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string): Promise<void> {
    // Ensure fonts are loaded before screenshot
    await this.page.evaluate(() => document.fonts.ready)

    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: false,
    })
  }

  /**
   * Click the back button (if present)
   */
  async goBack(): Promise<void> {
    // Try data-testid first, then aria-label, then generic back button
    const backButton =
      this.page.locator('[data-testid="back-button"]').first() ||
      this.page.getByRole('button', { name: /back/i }).first() ||
      this.page.locator('button:has-text("Back")').first()

    if (await backButton.isVisible()) {
      await backButton.click()
    } else {
      // Fallback: use browser back
      await this.page.goBack()
    }
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(locator: Locator, timeout = 10_000): Promise<void> {
    await expect(locator).toBeVisible({ timeout })
  }

  /**
   * Wait for navigation/loading to complete
   */
  async waitForNavigation(timeout = 10_000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout })
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || ''
  }

  /**
   * Check if an element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible()
  }

  /**
   * Wait for a specific amount of time (use sparingly)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms)
  }

  /**
   * Common locators used across pages
   */
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"], .spinner, [role="progressbar"]')
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], [role="alert"]')
  }

  get continueButton(): Locator {
    return (
      this.page.locator('[data-testid="continue-button"]') ||
      this.page.getByRole('button', { name: /continue/i })
    )
  }

  get submitButton(): Locator {
    return (
      this.page.locator('[data-testid="submit-button"]') ||
      this.page.getByRole('button', { name: /submit/i })
    )
  }

  /**
   * Wait for loading to complete (spinner to disappear)
   */
  async waitForLoading(timeout = 30_000): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout })
    } catch {
      // No spinner found, which is fine
    }
  }

  /**
   * Check if there's an error displayed
   */
  async hasError(): Promise<boolean> {
    return this.errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string | null> {
    if (await this.hasError()) {
      return this.getText(this.errorMessage)
    }
    return null
  }
}
