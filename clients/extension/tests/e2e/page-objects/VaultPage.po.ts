/**
 * Vault Page Object Model
 *
 * Main vault view showing balances, chains, and navigation controls.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class VaultPage extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get vaultContainer(): Locator {
    return this.page.locator('[data-testid="vault-page"]')
  }

  get totalBalanceContainer(): Locator {
    return this.page.locator('[data-testid="vault-total-balance"]')
  }

  get balanceValue(): Locator {
    return this.page.locator('[data-testid="balance-value"]')
  }

  get refreshButton(): Locator {
    return (
      this.page.locator('[data-testid="refresh-balance"]') ||
      this.page.getByRole('button', { name: /refresh/i })
    )
  }

  get settingsButton(): Locator {
    return (
      this.page.locator('[data-testid="vault-settings-button"]') ||
      this.page.getByRole('button', { name: /settings/i })
    )
  }

  get sendButton(): Locator {
    return (
      this.page.locator('[data-testid="send-button"]') ||
      this.page.getByRole('button', { name: /send/i })
    )
  }

  get swapButton(): Locator {
    return (
      this.page.locator('[data-testid="swap-button"]') ||
      this.page.getByRole('button', { name: /swap/i })
    )
  }

  get chainList(): Locator {
    return this.page.locator('[data-testid="chain-list"]')
  }

  /**
   * Wait for the vault view to be visible
   */
  async waitForView(timeout = 15_000): Promise<void> {
    await this.vaultContainer.waitFor({ state: 'visible', timeout })
  }

  /**
   * Get the total balance displayed
   */
  async getTotalBalance(): Promise<string> {
    await this.totalBalanceContainer.waitFor({ state: 'visible' })
    const balanceText = await this.balanceValue.textContent()
    return balanceText?.trim() || '0'
  }

  /**
   * Get balance for a specific chain
   */
  async getChainBalance(chain: string): Promise<string> {
    const chainRow = this.page.locator(`[data-testid="VaultChainItem-Panel"]`).filter({
      hasText: new RegExp(chain, 'i'),
    })
    await chainRow.waitFor({ state: 'visible' })
    const balanceElement = chainRow.locator('[data-testid="chain-balance"]').first()
    if (await balanceElement.isVisible()) {
      return (await balanceElement.textContent()) || '0'
    }
    // Fallback: get text that looks like a balance (number with currency)
    const text = await chainRow.textContent()
    const match = text?.match(/[\d.,]+\s*[A-Z]{3,}/)
    return match?.[0] || '0'
  }

  /**
   * Click refresh button to update balances
   */
  async refreshBalance(): Promise<void> {
    await this.refreshButton.click()
    // Wait for potential loading state
    await this.waitForLoading()
  }

  /**
   * Navigate to a specific chain's detail page
   */
  async navigateToChain(chain: string): Promise<void> {
    const chainRow = this.page.locator(`[data-testid="VaultChainItem-Panel"]`).filter({
      hasText: new RegExp(chain, 'i'),
    })
    await chainRow.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to send page
   */
  async navigateToSend(): Promise<void> {
    await this.sendButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to swap page
   */
  async navigateToSwap(): Promise<void> {
    await this.swapButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to vault settings
   */
  async navigateToSettings(): Promise<void> {
    await this.settingsButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Get list of visible chains
   */
  async getVisibleChains(): Promise<string[]> {
    const chainItems = this.page.locator('[data-testid="VaultChainItem-Panel"]')
    const count = await chainItems.count()
    const chains: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await chainItems.nth(i).textContent()
      if (text) chains.push(text.split('\n')[0].trim())
    }
    return chains
  }

  /**
   * Check if vault page is currently visible
   */
  async isVaultPageVisible(): Promise<boolean> {
    try {
      return await this.vaultContainer.isVisible()
    } catch {
      return false
    }
  }
}
