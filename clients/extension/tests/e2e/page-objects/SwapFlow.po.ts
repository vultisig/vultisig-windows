/**
 * Swap Flow Page Object Model
 *
 * Handles the complete swap transaction flow.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'
import { 
  waitForFormReady, 
  waitForStackedFieldReady, 
  robustClick,
  waitForLoadingComplete,
  debugElementState,
} from '../helpers/ui-waits'

export class SwapFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get swapForm(): Locator {
    return this.page.locator('[data-testid="swap-form"]')
  }

  get fromCoinSelector(): Locator {
    return this.page.locator('[data-testid="swap-from-coin-selector"]')
  }

  get fromChainSelector(): Locator {
    return this.page.locator('[data-testid="swap-from-chain-selector"]')
  }

  get toCoinSelector(): Locator {
    return this.page.locator('[data-testid="swap-to-coin-selector"]')
  }

  get toChainSelector(): Locator {
    return this.page.locator('[data-testid="swap-to-chain-selector"]')
  }

  getCoinOption(symbol: string): Locator {
    return this.page.locator(`[data-testid="coin-option-${symbol}"]`)
  }

  getChainOption(chain: string): Locator {
    return this.page.locator(`[data-testid="swap-chain-option-${chain}"]`)
  }

  getExplorerChainOption(chain: string): Locator {
    return this.page.locator(`[data-testid="swap-explorer-chain-${chain}"]`)
  }

  get termsCheckboxes(): Locator {
    return this.page.locator('[data-testid^="terms-checkbox-"]')
  }

  get fastVaultPasswordModal(): Locator {
    return this.page.locator('[data-testid="fast-vault-password-modal"]')
  }

  get fastVaultPasswordInput(): Locator {
    return this.page.locator('[data-testid="fast-vault-password-input"]')
  }

  get fastVaultSubmit(): Locator {
    return this.page.locator('[data-testid="fast-vault-submit"]')
  }

  get fromAmountInput(): Locator {
    return this.page.locator('[data-testid="swap-from-amount-input"]')
  }

  get toAmountDisplay(): Locator {
    return this.page.locator('[data-testid="swap-to-amount"]')
  }

  get continueButton(): Locator {
    return this.page.locator('[data-testid="swap-continue"]')
  }

  get reverseButton(): Locator {
    return this.page.locator('[data-testid="swap-reverse"]').or(this.page.getByRole('button', { name: /reverse|switch/i })).first()
  }

  get quoteLoading(): Locator {
    return this.page.locator('[data-testid="quote-loading"], .spinner, [role="progressbar"]')
  }

  get quoteInfo(): Locator {
    return this.page.locator('[data-testid="swap-quote-info"]')
  }

  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="swap-terms-checkbox"], input[type="checkbox"]')
  }

  /**
   * The sign/keysign button on the verify page.
   * For fast vaults this shows "Fast Sign", for secure vaults "Sign".
   */
  get signButton(): Locator {
    return this.page.getByRole('button', { name: /fast.sign|sign|confirm/i }).first()
  }

  get successScreen(): Locator {
    return this.page.locator('[data-testid="swap-success"]').or(this.page.locator('text=/success|swapped|complete/i')).first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]')
  }

  get rateDisplay(): Locator {
    return this.page.locator('[data-testid="swap-rate"]')
  }

  get maxButton(): Locator {
    return this.page.locator('[data-testid="max-amount"]').or(this.page.getByRole('button', { name: /max/i })).first()
  }

  /**
   * Wait for swap form to be fully visible and ready for interaction.
   * This includes waiting for loading states and animations to complete.
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await waitForFormReady(this.page, 'swap-form', timeout)
  }

  /**
   * Map of coin symbols to chain names for swap selection
   */
  private static readonly SYMBOL_TO_CHAIN: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    BNB: 'BSC',
    SOL: 'Solana',
    RUNE: 'THORChain',
    ATOM: 'Cosmos',
    MATIC: 'Polygon',
    AVAX: 'Avalanche',
    LTC: 'Litecoin',
    DOGE: 'Dogecoin',
  }

  /**
   * Map chain IDs to their native token symbols.
   * Used for cross-chain native token swaps.
   */
  private static readonly CHAIN_TO_NATIVE: Record<string, string> = {
    ethereum: 'ETH',
    bitcoin: 'BTC',
    solana: 'SOL',
    thorchain: 'RUNE',
    bsc: 'BNB',
    polygon: 'MATIC',
    avalanche: 'AVAX',
    arbitrum: 'ETH',
    optimism: 'ETH',
    base: 'ETH',
    litecoin: 'LTC',
    dogecoin: 'DOGE',
    cosmos: 'ATOM',
  }

  /**
   * Get native token symbol for a chain ID.
   */
  getNativeSymbol(chainId: string): string {
    return SwapFlow.CHAIN_TO_NATIVE[chainId.toLowerCase()] || chainId.toUpperCase()
  }

  /**
   * Select source coin in the swap form.
   * Uses data-testid selectors for reliable element targeting.
   * 
   * The swap coin explorer has two parts:
   * 1. Coin options list (showing tokens for the currently selected chain)
   * 2. Chain carousel at bottom (to switch chains)
   * 
   * To select a different chain's native token, we click the chain in the carousel
   * which both switches the chain AND selects the native token.
   */
  async selectFromCoin(coin: string): Promise<void> {
    const chainName = SwapFlow.SYMBOL_TO_CHAIN[coin.toUpperCase()] || coin

    // Wait for animations to complete
    await waitForStackedFieldReady(this.page)
    await waitForLoadingComplete(this.page)

    // Check if this coin is already selected
    const currentCoin = await this.swapForm.locator('[data-testid="swap-from-coin-selector"]').textContent().catch(() => '')
    if (currentCoin?.toUpperCase().includes(coin.toUpperCase())) {
      console.log(`From coin ${coin} already selected`)
      return
    }

    // Click the from coin selector to open the coin explorer
    await this.fromCoinSelector.click({ force: true })
    await this.page.waitForTimeout(800)

    // For native tokens, clicking the chain in the carousel selects both chain and native token
    const chainOption = this.getExplorerChainOption(chainName)
    if (await chainOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chainOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${chainName} from explorer carousel`)
      return
    }

    // Fallback: Look for the coin option directly
    const coinOption = this.getCoinOption(coin)
    if (await coinOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coinOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${coin} from coin options`)
      return
    }

    console.log(`Could not select from coin ${coin}`)
  }

  /**
   * Select destination coin in the swap form.
   * Uses data-testid selectors for reliable element targeting.
   * 
   * The swap coin explorer has two parts:
   * 1. Coin options list (showing tokens for the currently selected chain)
   * 2. Chain carousel at bottom (to switch chains)
   * 
   * To select a different chain's native token, we click the chain in the carousel
   * which both switches the chain AND selects the native token.
   */
  async selectToCoin(coin: string): Promise<void> {
    const chainName = SwapFlow.SYMBOL_TO_CHAIN[coin.toUpperCase()] || coin

    // Wait for animations
    await waitForStackedFieldReady(this.page)
    await waitForLoadingComplete(this.page)

    // Check if this coin is already selected
    const currentCoin = await this.swapForm.locator('[data-testid="swap-to-coin-selector"]').textContent().catch(() => '')
    if (currentCoin?.toUpperCase().includes(coin.toUpperCase())) {
      console.log(`To coin ${coin} already selected`)
      return
    }

    // Click the to coin selector to open the coin explorer
    await this.toCoinSelector.click({ force: true })
    await this.page.waitForTimeout(800)

    // For native tokens, clicking the chain in the carousel selects both chain and native token
    const chainOption = this.getExplorerChainOption(chainName)
    if (await chainOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chainOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${chainName} from explorer carousel (to)`)
      return
    }

    // Fallback: Look for the coin option directly
    const coinOption = this.getCoinOption(coin)
    if (await coinOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coinOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${coin} from coin options (to)`)
      return
    }

    console.log(`Could not select to coin ${coin}`)
  }

  /**
   * Fill swap amount using input with proper event simulation
   */
  async fillAmount(amount: string): Promise<void> {
    // Click to focus first (force to bypass overlay)
    await this.fromAmountInput.click({ force: true })
    await this.page.waitForTimeout(100)
    
    // Clear existing value
    await this.fromAmountInput.clear()
    
    // Type character by character (triggers input events)
    await this.fromAmountInput.pressSequentially(amount, { delay: 50 })
    
    // Blur to trigger change event
    await this.fromAmountInput.blur()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click percentage button to set amount (more reliable than direct input)
   * @param percent - 25, 50, 75, or 100 (max)
   */
  async clickPercentage(percent: 25 | 50 | 75 | 100 = 25): Promise<void> {
    const btnText = percent === 100 ? 'Max' : `${percent}%`
    const btn = this.page.locator(`button:has-text("${btnText}")`)
    await btn.click()
    await this.page.waitForTimeout(500)
    console.log(`Clicked ${btnText} button`)
  }

  /**
   * Click max button
   */
  async clickMax(): Promise<void> {
    await this.maxButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Reverse the swap direction (swap from/to coins)
   */
  async reverse(): Promise<void> {
    await this.reverseButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Wait for quote to load.
   * The swap UI fetches quotes from various aggregators (THORChain, 1inch, etc.)
   * which can take a few seconds. We wait for:
   * 1. Any loading indicators to disappear
   * 2. The expected output to appear (or continue button to be enabled)
   */
  async waitForQuote(timeout = 30_000): Promise<void> {
    try {
      // Wait for loading to appear then disappear
      await this.quoteLoading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
      await this.quoteLoading.waitFor({ state: 'hidden', timeout }).catch(() => {})
    } catch {
      // Loading might be too fast to catch, which is fine
    }

    // Wait for general loading states to complete
    await waitForLoadingComplete(this.page, timeout)
    
    // Wait for either:
    // 1. The expected output to show a value
    // 2. The continue button to be enabled
    // 3. An error message to appear
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      // Check if we have an output amount
      const output = await this.getExpectedOutput()
      if (output && output !== '0' && output !== '') {
        console.log(`Quote loaded: output = ${output}`)
        break
      }
      
      // Check if continue is enabled
      const canContinue = await this.isContinueEnabled().catch(() => false)
      if (canContinue) {
        console.log('Quote loaded: continue button is enabled')
        break
      }
      
      // Check for error state
      const errorText = this.page.locator('text=/no.route|insufficient|error|failed/i').first()
      if (await errorText.isVisible().catch(() => false)) {
        console.log('Quote failed: error message visible')
        break
      }
      
      await this.page.waitForTimeout(500)
    }

    // Final wait for UI to settle
    await this.page.waitForTimeout(500)
  }

  /**
   * Click continue to proceed to confirmation
   */
  async continue(): Promise<void> {
    await waitForLoadingComplete(this.page)
    await expect(this.continueButton).toBeEnabled({ timeout: 10000 })
    await robustClick(this.continueButton)
    await this.page.waitForTimeout(500)
  }

  /**
   * Accept terms if shown.
   * The verify page may show multiple checkboxes. Each checkbox is a custom component
   * with an invisible <input> inside a <label>. We click the <label> instead.
   */
  async acceptTerms(): Promise<void> {
    // Wait for any loading/animations to complete
    await waitForLoadingComplete(this.page)
    await this.page.waitForTimeout(300)
    
    // Primary strategy: Use data-testid terms checkboxes
    const termsCheckboxes = this.termsCheckboxes
    const termsCount = await termsCheckboxes.count()
    
    if (termsCount > 0) {
      for (let i = 0; i < termsCount; i++) {
        await robustClick(termsCheckboxes.nth(i))
        await this.page.waitForTimeout(200)
      }
      return
    }

    // Fallback: Use input[type="checkbox"]
    const checkboxes = this.page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i)
      const isChecked = await checkbox.isChecked().catch(() => false)
      if (!isChecked) {
        const label = checkbox.locator('xpath=ancestor::label')
        if (await label.count() > 0) {
          await label.first().click({ force: true })
        } else {
          await checkbox.click({ force: true })
        }
        await this.page.waitForTimeout(200)
      }
    }
  }

  /**
   * Initiate signing.
   *
   * For fast vaults, clicking "Fast Sign" opens a password modal.
   */
  async sign(): Promise<void> {
    await waitForLoadingComplete(this.page)
    await robustClick(this.signButton)
    await this.page.waitForTimeout(500)

    // Check if fast vault password modal appeared (using testid)
    if (await this.fastVaultPasswordModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const password = process.env.TEST_VAULT_PASSWORD || ''
      if (password) {
        await this.fastVaultPasswordInput.fill(password)
        await this.page.waitForTimeout(300)
        await this.fastVaultSubmit.click()
        await this.page.waitForTimeout(500)
        return
      }
    }

    // Fallback: Check for generic password input
    const passwordInput = this.page.locator('input[type="password"], input[placeholder*="password" i]').first()
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const password = process.env.TEST_VAULT_PASSWORD || ''
      if (password) {
        await passwordInput.fill(password)
        await this.page.waitForTimeout(300)

        const confirmBtn = this.page.getByRole('button', { name: /confirm/i }).first()
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click()
          await this.page.waitForTimeout(500)
        }
      }
    }
  }

  /**
   * Wait for swap success screen
   */
  async waitForSuccess(timeout = 120_000): Promise<void> {
    // Swaps can take longer than sends
    await this.successScreen.waitFor({ state: 'visible', timeout })
  }

  /**
   * Get transaction hash from success screen
   */
  async getTxHash(): Promise<string> {
    await this.txHashDisplay.waitFor({ state: 'visible' })
    return (await this.txHashDisplay.textContent()) || ''
  }

  /**
   * Get expected output amount
   */
  async getExpectedOutput(): Promise<string> {
    if (await this.toAmountDisplay.isVisible()) {
      return (await this.toAmountDisplay.textContent()) || ''
    }
    return ''
  }

  /**
   * Get swap rate
   */
  async getSwapRate(): Promise<string> {
    if (await this.rateDisplay.isVisible()) {
      return (await this.rateDisplay.textContent()) || ''
    }
    return ''
  }

  /**
   * Check if continue button is enabled
   */
  async isContinueEnabled(): Promise<boolean> {
    return this.continueButton.isEnabled()
  }

  /**
   * Prepare a swap (fills form but doesn't submit)
   */
  async prepareSwap(fromCoin: string, toCoin: string, amount: string): Promise<void> {
    await this.selectFromCoin(fromCoin)
    await this.selectToCoin(toCoin)
    await this.fillAmount(amount)
    await this.waitForQuote()
  }

  /**
   * Prepare a cross-chain native token swap using chain IDs.
   * Uses percentage buttons for more reliable quote triggering.
   * @param percent - 25, 50, 75, or 100 (default 25 for small test amounts)
   */
  async prepareNativeSwap(fromChainId: string, toChainId: string, percent: 25 | 50 | 75 | 100 = 25): Promise<void> {
    const fromSymbol = this.getNativeSymbol(fromChainId)
    const toSymbol = this.getNativeSymbol(toChainId)
    console.log(`Preparing native swap: ${fromSymbol} (${fromChainId}) → ${toSymbol} (${toChainId}) @ ${percent}%`)
    await this.selectFromCoin(fromSymbol)
    await this.selectToCoin(toSymbol)
    await this.clickPercentage(percent)
    await this.waitForQuote()
  }

  /**
   * Complete the entire swap flow
   * Warning: This will actually execute the swap if signing succeeds
   */
  async completeSwap(
    fromCoin: string,
    toCoin: string,
    amount: string
  ): Promise<string> {
    await this.prepareSwap(fromCoin, toCoin, amount)
    await this.continue()
    await this.acceptTerms()
    await this.sign()
    await this.waitForSuccess()
    return this.getTxHash()
  }
}
