/**
 * Send Flow Page Object Model
 *
 * Handles the complete send transaction flow.
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class SendFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get sendForm(): Locator {
    return this.page.locator('[data-testid="send-form"]')
  }

  get coinSelector(): Locator {
    return this.page.locator('[data-testid="coin-selector"]')
  }

  get coinSelectorTrigger(): Locator {
    return this.page.locator('[data-testid="coin-selector-trigger"]')
  }

  getCoinOption(symbol: string): Locator {
    return this.page.locator(`[data-testid="coin-option-${symbol}"]`)
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

  /**
   * The chain selector button within the send form.
   * Renders as a clickable HStack with the chain name and a ChevronDownIcon.
   * Located in the "From" row of the coin input field.
   */
  get chainSelectorButton(): Locator {
    return this.sendForm.locator('role=button >> text=/Bitcoin|Ethereum|THORChain|Solana|BSC/i').first()
  }

  get addressInput(): Locator {
    return this.page.locator('[data-testid="send-address-input"]')
  }

  get amountInput(): Locator {
    return this.page.locator('[data-testid="send-amount-input"]')
  }

  get continueButton(): Locator {
    return this.page.locator('[data-testid="send-continue"]')
  }

  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="send-terms-checkbox"], input[type="checkbox"]')
  }

  /**
   * The sign/keysign button on the verify page.
   * For fast vaults this shows "Fast Sign", for secure vaults "Sign".
   * There's no data-testid, so we match by button role and text.
   */
  get signButton(): Locator {
    return this.page.getByRole('button', { name: /fast.sign|sign|confirm/i }).first()
  }

  get successScreen(): Locator {
    return this.page.locator('[data-testid="send-success"]').or(this.page.locator('text=/success|sent|complete/i')).first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]')
  }

  get maxButton(): Locator {
    return this.page.locator('[data-testid="max-amount"]').or(this.page.getByRole('button', { name: /max/i })).first()
  }

  get feeDisplay(): Locator {
    return this.page.locator('[data-testid="network-fee"]')
  }

  /**
   * Wait for send form to be visible
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await this.sendForm.waitFor({ state: 'visible', timeout })
  }

  /**
   * Map of coin symbols to their chain names as displayed in the UI.
   * The chain selector modal shows chain names (e.g. "Ethereum"), not symbols (e.g. "ETH").
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
   * Select coin/chain to send.
   *
   * The send form pre-selects a coin based on navigation state.
   * The coin section may start collapsed (showing ticker + pencil icon).
   * To switch chains we must:
   *   1. Expand the coin section (click collapsed row)
   *   2. Click the chain name to open the chain selector modal
   *   3. Pick the desired chain from the modal
   *
   * @param coin - Coin symbol (e.g. 'ETH', 'BTC', 'BNB') or chain name (e.g. 'Ethereum')
   */
  async selectCoin(coin: string): Promise<void> {
    // Resolve chain name from symbol if needed
    const chainName = SendFlow.SYMBOL_TO_CHAIN[coin.toUpperCase()] || coin

    // Check if the coin ticker is already visible in the form (collapsed or expanded)
    const currentCoin = this.sendForm.getByText(new RegExp(`^${coin}$`, 'i')).first()
    if (await currentCoin.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log(`Coin ${coin} already selected`)
      return
    }

    // Also check by chain name
    const currentChain = this.sendForm.getByText(new RegExp(`^${chainName}$`, 'i')).first()
    if (await currentChain.isVisible({ timeout: 500 }).catch(() => false)) {
      console.log(`Chain ${chainName} already selected`)
      return
    }

    // Try data-testid coin selector trigger first
    if (await this.coinSelectorTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.coinSelectorTrigger.click()
      await this.page.waitForTimeout(300)
      // Try to click the coin option by testid first
      const coinOptionByTestid = this.getCoinOption(coin.toUpperCase())
      if (await coinOptionByTestid.isVisible({ timeout: 2000 }).catch(() => false)) {
        await coinOptionByTestid.click()
        await this.page.waitForTimeout(300)
        return
      }
      // Fallback to text matching
      const coinOption = this.page.getByText(new RegExp(`^${coin}$`, 'i')).first()
      if (await coinOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await coinOption.click()
        await this.page.waitForTimeout(300)
        return
      }
    }

    // The coin section may be collapsed — expand it first by clicking the "Asset" row
    // The collapsed row shows "Asset [icon] TICKER [checkmark] [pencil]" and is clickable
    const expandCoin = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      for (const el of elements) {
        const text = el.textContent?.trim()
        if (text && /^Asset/.test(text) && el.querySelector('svg')) {
          const style = window.getComputedStyle(el)
          if (style.cursor === 'pointer' || el.getAttribute('role') === 'button') {
            ;(el as HTMLElement).click()
            return true
          }
          const clickable = el.closest('[role="button"], button') as HTMLElement
          if (clickable) {
            clickable.click()
            return true
          }
          ;(el as HTMLElement).click()
          return true
        }
      }
      return false
    })

    if (expandCoin) {
      await this.page.waitForTimeout(500)
    }

    // Now the coin section should be expanded, showing the chain selector
    // Click the chain name (has role="button" and contains the chain name + ChevronDownIcon)
    const chainClicked = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('[role="button"]')
      for (const btn of buttons) {
        if (btn.querySelector('svg') && btn.textContent) {
          const text = btn.textContent.trim()
          if (/^(Bitcoin|Ethereum|THORChain|Solana|BSC|Litecoin|Dogecoin|Polygon|Avalanche|Cosmos|Arbitrum|Optimism|Base)$/i.test(text.replace(/\s/g, ''))) {
            ;(btn as HTMLElement).click()
            return text
          }
        }
      }
      return null
    })

    if (chainClicked) {
      console.log(`Clicked chain selector (current: ${chainClicked})`)
      await this.page.waitForTimeout(500)

      // The chain selector modal is open — search for the target chain by name
      // The modal has a search input and lists chains with ChainOption components
      const chainOption = this.page.getByText(new RegExp(`^${chainName}$`, 'i')).first()
      if (await chainOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chainOption.click()
        await this.page.waitForTimeout(500)
        console.log(`Selected chain: ${chainName}`)
        return
      }

      // Try with the symbol too (in case it's listed differently)
      const symbolOption = this.page.getByText(new RegExp(`^${coin}$`, 'i')).first()
      if (await symbolOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await symbolOption.click()
        await this.page.waitForTimeout(500)
        return
      }
    }

    console.log(`Could not find chain selector to switch to ${coin} (${chainName})`)
  }

  /**
   * Fill recipient address
   */
  async fillAddress(address: string): Promise<void> {
    await this.addressInput.clear()
    await this.addressInput.fill(address)
  }

  /**
   * Fill amount to send
   */
  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.clear()
    await this.amountInput.fill(amount)
  }

  /**
   * Click max amount button
   */
  async clickMax(): Promise<void> {
    await this.maxButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click continue to proceed to confirmation
   */
  async continue(): Promise<void> {
    await expect(this.continueButton).toBeEnabled()
    await this.continueButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Accept terms if shown.
   * The verify page may show multiple checkboxes (e.g. "The amount is correct",
   * "I'm sending to the right address"). Each checkbox is a custom component:
   *   <label>          ← Container (clickable)
   *     <div>          ← visual Box (circle with checkmark)
   *     <Text>         ← label text
   *     <input>        ← InvisibleInput (1px, position absolute, clipped)
   *   </label>
   *
   * We click the parent <label> instead of the hidden <input>.
   */
  async acceptTerms(): Promise<void> {
    // Primary strategy: Use data-testid terms checkboxes
    const termsCheckboxes = this.termsCheckboxes
    const termsCount = await termsCheckboxes.count()
    
    if (termsCount > 0) {
      for (let i = 0; i < termsCount; i++) {
        await termsCheckboxes.nth(i).click()
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
        // Click the parent <label> element which is the actual clickable container
        const label = checkbox.locator('xpath=ancestor::label')
        if (await label.count() > 0) {
          await label.first().click()
        } else {
          // Fallback: force-click the hidden input
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
   * We detect the modal, enter the vault password, and click "Confirm".
   */
  async sign(): Promise<void> {
    await this.signButton.click()
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

        // Click Confirm button in the modal
        const confirmBtn = this.page.getByRole('button', { name: /confirm/i }).first()
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click()
          await this.page.waitForTimeout(500)
        }
      }
    }
  }

  /**
   * Wait for transaction success screen
   */
  async waitForSuccess(timeout = 60_000): Promise<void> {
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
   * Get displayed network fee
   */
  async getNetworkFee(): Promise<string> {
    if (await this.feeDisplay.isVisible()) {
      return (await this.feeDisplay.textContent()) || ''
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
   * Perform complete send operation (fills form and submits)
   * Note: Does NOT sign - use for UI testing only
   */
  async prepareSend(coin: string, address: string, amount: string): Promise<void> {
    await this.selectCoin(coin)
    await this.fillAddress(address)
    await this.fillAmount(amount)
  }

  /**
   * Complete the entire send flow
   * Warning: This will actually send tokens if signing succeeds
   */
  async completeSend(
    coin: string,
    address: string,
    amount: string
  ): Promise<string> {
    await this.prepareSend(coin, address, amount)
    await this.continue()
    await this.acceptTerms()
    await this.sign()
    await this.waitForSuccess()
    return this.getTxHash()
  }
}
