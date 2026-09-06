/**
 * Send Flow Page Object Model
 *
 * Handles the complete send transaction flow.
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { Chain } from '@vultisig/core-chain/Chain'

import {
  robustClick,
  waitForFormReady,
  waitForLoadingComplete,
  waitForStackedFieldReady,
} from '../helpers/ui-waits'
import { BasePage } from './BasePage.po'

type SendCoinSelection = {
  chain: string
  ticker: string
}

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
    return this.coinSelector.getByRole('button').first()
  }

  get addressInput(): Locator {
    return this.page.locator('[data-testid="send-address-input"]')
  }

  get amountInput(): Locator {
    return this.page.locator('[data-testid="send-amount-input"]')
  }

  get destinationTagInput(): Locator {
    return this.page.locator('[data-testid="send-destination-tag-input"]')
  }

  get continueButton(): Locator {
    return this.page.locator('[data-testid="send-continue"]')
  }

  get termsCheckbox(): Locator {
    return this.page.locator(
      '[data-testid="send-terms-checkbox"], input[type="checkbox"]'
    )
  }

  /**
   * The sign/keysign button on the verify page.
   * For fast vaults this shows "Fast Sign", for secure vaults "Sign".
   * There's no data-testid, so we match by button role and text.
   */
  get signButton(): Locator {
    return this.page
      .getByRole('button', { name: /fast.sign|sign|confirm/i })
      .first()
  }

  get successScreen(): Locator {
    return this.page
      .locator('[data-testid="send-success"]')
      .or(this.page.locator('text=/success|sent|complete/i'))
      .first()
  }

  get txHashDisplay(): Locator {
    return this.page.locator('[data-testid="tx-hash"]')
  }

  get maxButton(): Locator {
    return this.page
      .locator('[data-testid="max-amount"]')
      .or(this.page.getByRole('button', { name: /max/i }))
      .first()
  }

  get feeDisplay(): Locator {
    return this.page.locator('[data-testid="network-fee"]')
  }

  /**
   * Wait for send form to be fully visible and ready for interaction.
   * This includes waiting for loading states and animations to complete.
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await waitForFormReady(this.page, 'send-form', timeout)
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
    XRP: 'Ripple',
  }

  private get assetPickerTitle(): Locator {
    return this.page.getByText('Select asset', { exact: true })
  }

  private get chainPickerTitle(): Locator {
    return this.page.getByText('Select chain', { exact: true })
  }

  private pickerForTitle(title: Locator): Locator {
    return title.locator('xpath=../../..')
  }

  private async isActiveStackedField(locator: Locator): Promise<boolean> {
    return (
      (await locator.isVisible().catch(() => false)) &&
      (await locator.locator('xpath=ancestor::*[@inert]').count()) === 0
    )
  }

  private async ensureCoinFieldExpanded(): Promise<void> {
    if (await this.isActiveStackedField(this.coinSelector)) return

    const collapsedCoinField = this.page.getByTestId('send-coin-field')
    if (!(await this.isActiveStackedField(collapsedCoinField))) {
      throw new Error(
        'Cannot inspect the selected send asset: the coin field is not visible'
      )
    }

    await collapsedCoinField.click()
    await expect
      .poll(() => this.isActiveStackedField(this.coinSelector))
      .toBe(true)
    await waitForStackedFieldReady(this.page)
  }

  private async readCoinSelection(): Promise<SendCoinSelection> {
    await this.ensureCoinFieldExpanded()

    const chain = (await this.chainSelectorButton.innerText()).trim()
    const ticker = (await this.coinSelectorTrigger.innerText())
      .split(/\s+/)
      .find(Boolean)

    if (!chain || !ticker) {
      throw new Error(
        `Cannot read the selected send asset (chain=${
          chain || 'missing'
        }, ticker=${ticker || 'missing'})`
      )
    }

    return { chain, ticker }
  }

  private async closeCoinPickers(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const openPicker = (await this.chainPickerTitle
        .isVisible()
        .catch(() => false))
        ? this.chainPickerTitle
        : (await this.assetPickerTitle.isVisible().catch(() => false))
          ? this.assetPickerTitle
          : null

      if (!openPicker) return
      const picker = this.pickerForTitle(openPicker)
      const closeButton = picker.getByRole('button').first()
      await expect(closeButton).toBeVisible()
      await closeButton.click()
      await expect(openPicker).toHaveCount(0)
    }

    throw new Error('Could not close the send asset pickers')
  }

  private async selectionFailure(
    requested: string,
    route: string[],
    expectedChain?: string
  ): Promise<never> {
    await this.closeCoinPickers()
    const observed = await this.readCoinSelection().catch(() => ({
      chain: 'unreadable',
      ticker: 'unreadable',
    }))
    const expectation = expectedChain
      ? `${expectedChain}/${requested}`
      : `${observed.chain}/${requested}`

    throw new Error(
      `Unable to select ${requested} (expected ${expectation}); ` +
        `route: ${route.join(' -> ')}; ` +
        `observed ${observed.chain}/${observed.ticker}`
    )
  }

  private async uniqueAssetOption(
    assetPicker: Locator,
    ticker: string,
    timeout = 2_000
  ): Promise<Locator | null> {
    const options = assetPicker.getByTestId(`coin-option-${ticker}`)
    await options
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => {})
    const count = await options.count()

    if (count > 1) {
      await this.selectionFailure(ticker, [
        `asset:${ticker} ambiguous (${count} matches)`,
      ])
    }

    return count === 1 ? options.first() : null
  }

  private async restoreOpenField(
    field: 'address' | 'amount' | null
  ): Promise<void> {
    if (!field) return

    const input = field === 'address' ? this.addressInput : this.amountInput
    if (await this.isActiveStackedField(input)) return

    const collapsedField = input.locator(
      'xpath=ancestor::*[@inert][1]/following-sibling::*[1]/*[1]'
    )
    await expect
      .poll(() => this.isActiveStackedField(collapsedField))
      .toBe(true)
    await collapsedField.click()
    await expect.poll(() => this.isActiveStackedField(input)).toBe(true)
    await waitForStackedFieldReady(this.page)
  }

  async openAddressField(): Promise<void> {
    await this.restoreOpenField('address')
  }

  async openAmountField(): Promise<void> {
    await this.restoreOpenField('amount')
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
    const requested = coin.trim()
    if (!requested || !/^[a-z0-9-]+$/i.test(requested)) {
      throw new Error(`Invalid send asset request: ${JSON.stringify(coin)}`)
    }

    const requestedTicker = requested.toUpperCase()
    const mappedChain = SendFlow.SYMBOL_TO_CHAIN[requestedTicker]
    const requestedChain =
      mappedChain ??
      Object.values(Chain).find(
        chain => chain.toLowerCase() === requested.toLowerCase()
      )
    const expectedTicker =
      mappedChain || !requestedChain ? requestedTicker : null
    const fieldToRestore = (await this.isActiveStackedField(this.addressInput))
      ? 'address'
      : (await this.isActiveStackedField(this.amountInput))
        ? 'amount'
        : null
    const route: string[] = []

    await waitForStackedFieldReady(this.page)
    await waitForLoadingComplete(this.page)
    let selected = await this.readCoinSelection()

    const selectionMatches = () =>
      (!requestedChain ||
        selected.chain.toLowerCase() === requestedChain.toLowerCase()) &&
      (!expectedTicker || selected.ticker.toUpperCase() === expectedTicker)

    if (!selectionMatches()) {
      await this.coinSelectorTrigger.click()
      await expect(this.assetPickerTitle).toBeVisible()
      const assetPicker = this.pickerForTitle(this.assetPickerTitle)
      route.push(`asset:${requestedTicker} on ${selected.chain}`)

      if (
        !requestedChain ||
        selected.chain.toLowerCase() === requestedChain.toLowerCase()
      ) {
        const assetOption = expectedTicker
          ? await this.uniqueAssetOption(assetPicker, expectedTicker)
          : null

        if (!assetOption) {
          return this.selectionFailure(
            requestedTicker,
            [...route, 'missing'],
            requestedChain
          )
        }

        await assetOption.click()
        await expect(this.assetPickerTitle).toBeHidden()
      } else {
        const chainHeader = assetPicker
          .getByText('Chain', { exact: true })
          .first()
          .locator('..')
        const nestedChainTrigger = chainHeader.getByRole('button')
        if ((await nestedChainTrigger.count()) !== 1) {
          await this.selectionFailure(
            requestedTicker,
            [...route, 'chain picker unavailable'],
            requestedChain
          )
        }

        await nestedChainTrigger.click()
        await expect(this.chainPickerTitle).toBeVisible()
        const chainPicker = this.pickerForTitle(this.chainPickerTitle)
        const chainLabels = chainPicker.getByText(requestedChain, {
          exact: true,
        })
        await chainLabels
          .first()
          .waitFor({ state: 'visible', timeout: 2_000 })
          .catch(() => {})
        const chainOptionCount = await chainLabels.count()
        route.push(`chain:${requestedChain}`)

        if (chainOptionCount !== 1) {
          await this.selectionFailure(
            requestedTicker,
            [
              ...route,
              chainOptionCount === 0
                ? 'missing'
                : `ambiguous (${chainOptionCount} matches)`,
            ],
            requestedChain
          )
        }

        const chainOption = chainLabels
          .first()
          .locator('xpath=ancestor::*[@role="button"][1]')
        await expect(chainOption).toHaveCount(1)
        await chainOption.click()
        await expect(this.chainPickerTitle).toBeHidden()

        if (expectedTicker) {
          const assetOption = await this.uniqueAssetOption(
            assetPicker,
            expectedTicker,
            10_000
          )
          if (!assetOption) {
            return this.selectionFailure(
              requestedTicker,
              [...route, `asset:${expectedTicker} missing`],
              requestedChain
            )
          }
          await assetOption.click()
          await expect(this.assetPickerTitle).toBeHidden()
        } else {
          await this.closeCoinPickers()
          await expect(this.assetPickerTitle).toBeHidden()
        }
      }
    }

    await expect(this.assetPickerTitle).toHaveCount(0)
    await expect(this.chainPickerTitle).toHaveCount(0)
    selected = await this.readCoinSelection()

    if (!selectionMatches()) {
      await this.selectionFailure(
        requestedTicker,
        [...route, 'final verification failed'],
        requestedChain
      )
    }

    await this.restoreOpenField(fieldToRestore)
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
    // Wait for any loading to complete before clicking
    await waitForLoadingComplete(this.page)
    await expect(this.continueButton).toBeEnabled({ timeout: 10000 })
    await robustClick(this.continueButton)
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
        // Click the parent <label> element which is the actual clickable container
        const label = checkbox.locator('xpath=ancestor::label')
        if ((await label.count()) > 0) {
          await label.first().click({ force: true })
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
    await waitForLoadingComplete(this.page)
    await robustClick(this.signButton)
    await this.page.waitForTimeout(500)

    // Check if fast vault password modal appeared (using testid)
    if (
      await this.fastVaultPasswordModal
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
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
    const passwordInput = this.page
      .locator('input[type="password"], input[placeholder*="password" i]')
      .first()
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const password = process.env.TEST_VAULT_PASSWORD || ''
      if (password) {
        await passwordInput.fill(password)
        await this.page.waitForTimeout(300)

        // Click Confirm button in the modal
        const confirmBtn = this.page
          .getByRole('button', { name: /confirm/i })
          .first()
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
  async prepareSend(
    coin: string,
    address: string,
    amount: string
  ): Promise<void> {
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
