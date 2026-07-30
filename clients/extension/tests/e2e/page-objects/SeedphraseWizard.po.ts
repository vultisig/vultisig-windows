/**
 * Seedphrase Wizard Page Object Model
 *
 * Handles seedphrase import flow:
 * - enterSeedphrase(words) - enter 12/24 word mnemonic
 * - waitForScan() - wait for chain scanning
 * - selectChains(chains) - select which chains to import
 * - confirm() - confirm and create vault
 * - getValidationError() - get validation error for invalid mnemonic
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class SeedphraseWizard extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get wizard(): Locator {
    return this.page.locator('[data-testid="seedphrase-wizard"]')
  }

  get seedphraseInput(): Locator {
    return this.page
      .locator('[data-testid="seedphrase-input"]')
      .or(this.page.getByPlaceholder(/seed|mnemonic|recovery|phrase/i))
      .first()
  }

  get wordInputs(): Locator {
    return this.page.locator('[data-testid^="word-input-"], input[data-word-index]')
  }

  get continueButton(): Locator {
    return this.page
      .locator('[data-testid="seedphrase-continue"]')
      .or(this.page.getByRole('button', { name: /continue|import|next/i }))
      .first()
  }

  get validationError(): Locator {
    return this.page
      .locator('[data-testid="seedphrase-error"]')
      .or(this.page.locator('[role="alert"]'))
      .or(this.page.locator('.error-message'))
      .or(
        this.page.getByText(
          /seed phrase must be 12 or 24|seed phrase is not correct/i
        )
      )
      .first()
  }

  get scanProgress(): Locator {
    return this.page
      .locator('[data-testid="scan-progress"]')
      .or(this.page.locator('[role="progressbar"]'))
      .or(this.page.getByText(/scanning|discovering|loading/i))
      .first()
  }

  get chainList(): Locator {
    return this.page.locator('[data-testid="chain-selection-list"]')
  }

  get chainCheckboxes(): Locator {
    return this.page.locator('[data-testid^="chain-checkbox-"], input[type="checkbox"][data-chain]')
  }

  get selectAllButton(): Locator {
    return this.page
      .locator('[data-testid="select-all-chains"]')
      .or(this.page.getByRole('button', { name: /select all/i }))
      .first()
  }

  get confirmButton(): Locator {
    return this.page
      .locator('[data-testid="confirm-import"]')
      .or(this.page.getByRole('button', { name: /confirm|create|finish|import/i }))
      .first()
  }

  get addressDisplay(): Locator {
    return this.page.locator('[data-testid="derived-address"]')
  }

  get discoveredChains(): Locator {
    return this.page.locator('[data-testid="discovered-chain"], [data-chain-discovered="true"]')
  }

  /**
   * Wait for seedphrase wizard to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await Promise.race([
      this.wizard.waitFor({ state: 'visible', timeout }),
      this.seedphraseInput.waitFor({ state: 'visible', timeout }),
      this.wordInputs.first().waitFor({ state: 'visible', timeout }),
    ])
  }

  /**
   * Enter seedphrase as a single string (space-separated)
   */
  async enterSeedphrase(seedphrase: string): Promise<void> {
    const words = seedphrase.trim().split(/\s+/)

    // Check if there's a single textarea or multiple word inputs
    const hasTextarea = await this.seedphraseInput.isVisible()
    const wordInputCount = await this.wordInputs.count()

    if (hasTextarea) {
      // Single textarea input
      await this.seedphraseInput.clear()
      await this.seedphraseInput.fill(seedphrase)
    } else if (wordInputCount >= words.length) {
      // Multiple individual word inputs
      for (let i = 0; i < words.length; i++) {
        const wordInput = this.wordInputs.nth(i)
        await wordInput.clear()
        await wordInput.fill(words[i])
      }
    } else {
      // Fallback: try to find any input that accepts text
      const input = this.page.locator('textarea, input[type="text"]').first()
      await input.fill(seedphrase)
    }

    await this.page.waitForTimeout(500)
  }

  /**
   * Enter seedphrase as array of words
   */
  async enterSeedphraseWords(words: string[]): Promise<void> {
    await this.enterSeedphrase(words.join(' '))
  }

  /**
   * Wait for chain scanning to complete
   */
  async waitForScan(timeout = 60_000): Promise<void> {
    try {
      // Wait for scan progress to appear
      await this.scanProgress.waitFor({ state: 'visible', timeout: 5000 })
      // Wait for it to disappear
      await this.scanProgress.waitFor({ state: 'hidden', timeout })
    } catch {
      // Scan might be instant or already complete
    }

    // Wait for chain list to appear
    await this.page.waitForTimeout(1000)
  }

  /**
   * Get list of discovered chains
   */
  async getDiscoveredChains(): Promise<string[]> {
    const chains: string[] = []

    // Wait for chain list
    await this.page.waitForTimeout(500)

    // Try multiple approaches to find discovered chains
    const chainElements = this.page.locator(
      '[data-testid^="chain-"], [data-chain], .chain-item, .discovered-chain'
    )
    const count = await chainElements.count()

    for (let i = 0; i < count; i++) {
      const text = await chainElements.nth(i).textContent()
      if (text) {
        chains.push(text.trim())
      }
    }

    return chains
  }

  /**
   * Select specific chains for import
   */
  async selectChains(chainNames: string[]): Promise<void> {
    for (const chainName of chainNames) {
      // Find checkbox or toggle for this chain
      const chainRow = this.page.locator(
        `[data-testid="chain-checkbox-${chainName.toLowerCase()}"], ` +
        `[data-chain="${chainName.toLowerCase()}"], ` +
        `text=/${chainName}/i`
      ).first()

      if (await chainRow.isVisible()) {
        const checkbox = chainRow.locator('input[type="checkbox"]')
        if (await checkbox.isVisible()) {
          const isChecked = await checkbox.isChecked()
          if (!isChecked) {
            await checkbox.click()
          }
        } else {
          // Might be a clickable row
          await chainRow.click()
        }
      }
    }
  }

  /**
   * Select all available chains
   */
  async selectAllChains(): Promise<void> {
    if (await this.selectAllButton.isVisible()) {
      await this.selectAllButton.click()
    } else {
      // Manually check all
      const checkboxes = await this.chainCheckboxes.all()
      for (const checkbox of checkboxes) {
        const isChecked = await checkbox.isChecked()
        if (!isChecked) {
          await checkbox.click()
        }
      }
    }
  }

  /**
   * Click continue to proceed
   */
  async continue(): Promise<void> {
    await expect(this.continueButton).toBeEnabled()
    await this.continueButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Confirm import and create vault
   */
  async confirm(): Promise<void> {
    await expect(this.confirmButton).toBeEnabled()
    await this.confirmButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Get validation error text
   */
  async getValidationError(): Promise<string | null> {
    await this.page.waitForTimeout(500)
    if (await this.validationError.isVisible()) {
      return (await this.validationError.textContent()) || null
    }
    return null
  }

  /**
   * Check if there's a validation error
   */
  async hasValidationError(): Promise<boolean> {
    return this.validationError.isVisible()
  }

  /**
   * Check if continue button is enabled
   */
  async isContinueEnabled(): Promise<boolean> {
    return this.continueButton.isEnabled()
  }

  /**
   * Get derived address for a specific chain
   */
  async getDerivedAddress(chain?: string): Promise<string | null> {
    let addressEl = this.addressDisplay

    if (chain) {
      addressEl = this.page.locator(
        `[data-testid="derived-address-${chain.toLowerCase()}"], ` +
        `[data-chain="${chain.toLowerCase()}"] [data-testid="address"]`
      )
    }

    if (await addressEl.isVisible()) {
      return (await addressEl.textContent()) || null
    }
    return null
  }

  /**
   * Complete seedphrase import flow
   */
  async importSeedphrase(seedphrase: string, chains?: string[]): Promise<void> {
    await this.enterSeedphrase(seedphrase)
    await this.continue()
    await this.waitForScan()

    if (chains && chains.length > 0) {
      await this.selectChains(chains)
    } else {
      await this.selectAllChains()
    }

    await this.confirm()
  }
}
