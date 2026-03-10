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
    // Settings button is an IconButton with SettingsIcon (gear icon)
    // It's in the header controls area
    return this.page.locator('button').filter({
      has: this.page.locator('svg[class*="settings"], svg path[d*="M19.14"]')
    }).first().or(
      this.page.getByRole('button').filter({ hasText: /settings/i })
    ).or(
      // Fallback: look for icon button with gear-like icon in header
      this.page.locator('[data-testid="settings-button"], button:has(svg)').last()
    )
  }

  get sendButton(): Locator {
    return this.page.locator('[data-testid="vault-action-send"]')
  }

  get swapButton(): Locator {
    return this.page.locator('[data-testid="vault-action-swap"]')
  }

  get buyButton(): Locator {
    return this.page.locator('[data-testid="vault-action-buy"]')
  }

  get receiveButton(): Locator {
    return this.page.locator('[data-testid="vault-action-receive"]')
  }

  get chainList(): Locator {
    return this.page.locator('[data-testid="chain-list"]')
  }

  /**
   * Wait for the vault view to be visible
   * Throws a descriptive error if vault page doesn't appear
   */
  async waitForView(timeout = 15_000): Promise<void> {
    try {
      await this.vaultContainer.waitFor({ state: 'visible', timeout })
    } catch {
      // Check if we're on onboarding/new vault page instead
      const onNewVault = await this.page.getByText(/vultisig/i).first().isVisible().catch(() => false)
      if (onNewVault) {
        throw new Error('No vault exists - extension is showing onboarding/new vault page. Create or import a vault first.')
      }
      throw new Error(`Vault page did not appear within ${timeout}ms. Check if a vault exists.`)
    }
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

  /**
   * Check if vault is visible (alias for isVaultPageVisible)
   */
  async isVaultVisible(): Promise<boolean> {
    return this.isVaultPageVisible()
  }

  /**
   * Get the current vault name
   */
  async getVaultName(): Promise<string | null> {
    // Try different selectors for vault name
    const nameSelectors = [
      '[data-testid="vault-name"]',
      '[data-testid="current-vault-name"]',
      '[data-testid="vault-selector"] button',
      '.vault-name',
    ]

    for (const selector of nameSelectors) {
      const element = this.page.locator(selector).first()
      if (await element.isVisible().catch(() => false)) {
        return (await element.textContent()) || null
      }
    }

    // Try to find vault name in header
    const header = this.page.locator('header, [data-testid="header"]').first()
    if (await header.isVisible().catch(() => false)) {
      const headerText = await header.textContent()
      // Extract vault name (usually the first prominent text)
      const nameMatch = headerText?.match(/^([A-Za-z0-9\s-]+)/)?.[1]
      if (nameMatch) return nameMatch.trim()
    }

    return null
  }

  /**
   * Get token balances as an object
   */
  async getTokenBalances(): Promise<Record<string, string>> {
    const balances: Record<string, string> = {}

    // Get all chain items
    const chainItems = this.page.locator(
      '[data-testid="VaultChainItem-Panel"], [data-testid^="chain-"], .chain-item'
    )
    const count = await chainItems.count()

    for (let i = 0; i < count; i++) {
      const item = chainItems.nth(i)
      const text = await item.textContent()

      if (text) {
        // Extract chain name and balance
        // Format might be "Ethereum\n0.5 ETH" or "ETH 0.5"
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

        if (lines.length >= 1) {
          const chainName = lines[0].toLowerCase()
          // Look for balance pattern
          const balanceMatch = text.match(/[\d.,]+\s*[A-Z]{2,5}/)
          if (balanceMatch) {
            balances[chainName] = balanceMatch[0]
          }
        }
      }
    }

    return balances
  }

  /**
   * Get vault selector element
   */
  get vaultSelector(): Locator {
    return (
      this.page.locator('[data-testid="vault-selector"]') ||
      this.page.locator('[data-testid="vault-dropdown"]')
    )
  }

  /**
   * Open vault selector dropdown
   */
  async openVaultSelector(): Promise<void> {
    if (await this.vaultSelector.isVisible()) {
      await this.vaultSelector.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Get list of available vaults
   */
  async getAvailableVaults(): Promise<string[]> {
    await this.openVaultSelector()

    const vaultOptions = this.page.locator(
      '[data-testid^="vault-option-"], [data-testid="vault-list-item"]'
    )
    const count = await vaultOptions.count()
    const vaults: string[] = []

    for (let i = 0; i < count; i++) {
      const text = await vaultOptions.nth(i).textContent()
      if (text) vaults.push(text.trim())
    }

    return vaults
  }

  /**
   * Get the vault's address for a specific chain symbol
   * Navigates to chain detail and extracts address, then returns to vault page
   */
  async getChainAddress(chainSymbol: string): Promise<string | null> {
    try {
      // Find and click on the chain row
      const chainRow = this.page.locator(`[data-testid="VaultChainItem-Panel"]`).filter({
        hasText: new RegExp(chainSymbol, 'i'),
      })
      
      if (!(await chainRow.isVisible().catch(() => false))) {
        console.log(`Chain ${chainSymbol} not visible in vault`)
        return null
      }

      await chainRow.click()
      await this.page.waitForTimeout(500)

      // Look for address in the chain detail page
      const addressSelectors = [
        '[data-testid="chain-address"]',
        '[data-testid="address-display"]',
        '[data-testid="copy-address"]',
        '.address',
        // Common address patterns (truncated or full)
        'text=/0x[a-fA-F0-9]{6,}/i',
        'text=/bc1[a-z0-9]{20,}/i',
        'text=/[a-zA-Z0-9]{32,44}/', // Solana, Cosmos, etc.
      ]

      let address: string | null = null

      for (const selector of addressSelectors) {
        const element = this.page.locator(selector).first()
        if (await element.isVisible().catch(() => false)) {
          const text = await element.textContent()
          if (text) {
            // Extract address pattern
            const ethMatch = text.match(/0x[a-fA-F0-9]{40}/)
            const btcMatch = text.match(/bc1[a-z0-9]{25,62}/)
            const solMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/)
            
            address = ethMatch?.[0] || btcMatch?.[0] || solMatch?.[0] || text.trim()
            if (address && address.length > 10) break
          }
        }
      }

      // Go back to vault page
      await this.goBack()
      await this.waitForView(5000).catch(() => {})

      return address
    } catch (error) {
      console.log(`Failed to get address for ${chainSymbol}:`, error)
      return null
    }
  }
}
