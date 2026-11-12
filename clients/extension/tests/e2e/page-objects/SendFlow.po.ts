/**
 * Send Flow Page Object Model
 *
 * Handles the complete send transaction flow: the asset, address and
 * amount steps, then Verify.
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

import {
  robustClick,
  waitForFormReady,
  waitForLoadingComplete,
} from '../helpers/ui-waits'
import { BasePage } from './BasePage.po'

const sendSteps = ['coin', 'address', 'amount'] as const

type SendStep = (typeof sendSteps)[number]

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

  /** A step icon in the send step header. */
  step(step: SendStep): Locator {
    return this.page.getByTestId(`send-step-${step}`)
  }

  /** The asset step's chain filter button, which opens "Select chains". */
  get chainFilterButton(): Locator {
    return this.page.getByTestId('send-chain-filter')
  }

  get chainList(): Locator {
    return this.page.getByTestId('send-chain-list')
  }

  /** A row of the "Select chains" page; `null` is "All chains". */
  chainOption(chain: string | null): Locator {
    return this.chainList.getByTestId(`send-chain-option-${chain ?? 'all'}`)
  }

  getCoinOption(symbol: string): Locator {
    return this.sendForm.locator(`[data-testid="coin-option-${symbol}"]`)
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
    return this.page.locator('[data-testid="send-network-fee"]')
  }

  /**
   * Wait for send form to be fully visible and ready for interaction.
   * This includes waiting for loading states and animations to complete.
   */
  async waitForView(timeout = 10_000): Promise<void> {
    await waitForFormReady(this.page, 'send-form', timeout)
  }

  /**
   * Map of coin symbols to the chains the asset step's chips are keyed by.
   */
  private static readonly SYMBOL_TO_CHAIN: Record<string, Chain> = {
    BTC: Chain.Bitcoin,
    ETH: Chain.Ethereum,
    BNB: Chain.BSC,
    SOL: Chain.Solana,
    RUNE: Chain.THORChain,
    ATOM: Chain.Cosmos,
    MATIC: Chain.Polygon,
    AVAX: Chain.Avalanche,
    LTC: Chain.Litecoin,
    DOGE: Chain.Dogecoin,
    XRP: Chain.Ripple,
  }

  /** The step the form shows. */
  async currentStep(): Promise<SendStep> {
    for (const step of sendSteps) {
      if ((await this.step(step).getAttribute('aria-current')) === 'step') {
        return step
      }
    }

    throw new Error('The send step header marks no step as current')
  }

  /**
   * Opens a step through the header and waits for its pane to settle. Only
   * steps the header allows can be opened: Address once an asset is chosen,
   * Amount once the address is valid.
   */
  async openStep(step: SendStep): Promise<void> {
    if ((await this.currentStep()) !== step) {
      await expect(this.step(step)).toBeEnabled()
      await this.step(step).click()
    }

    await expect(this.step(step)).toHaveAttribute('aria-current', 'step')
    const pane = this.page.getByTestId(`send-step-pane-${step}`)
    await expect(pane).toHaveCount(1)
    await expect(pane).toHaveCSS('opacity', '1')
  }

  async openAddressField(): Promise<void> {
    await this.openStep('address')
  }

  async openAmountField(): Promise<void> {
    await this.openStep('amount')
  }

  /**
   * Filters the asset step by a chain through the "Select chains" page;
   * `null` clears the filter. Returns `false`, back on the asset step with
   * the filter unchanged, when the page does not list the chain.
   */
  async selectChainFilter(chain: string | null): Promise<boolean> {
    await this.openStep('coin')
    await this.chainFilterButton.click()
    await expect(this.chainList).toBeVisible()

    const option = this.chainOption(chain)
    if ((await option.count()) !== 1) {
      await this.page.keyboard.press('Escape')
      await expect(this.chainFilterButton).toBeVisible()
      return false
    }

    await option.click()
    await expect(this.chainFilterButton).toBeVisible()
    return true
  }

  /**
   * The coin being sent, read from the asset step: with every chain shown,
   * the selected coin is pinned first. Leaves the form on the asset step.
   */
  async getSelectedCoin(): Promise<SendCoinSelection> {
    await this.selectChainFilter(null)
    const first = this.sendForm.locator('[data-testid^="coin-option-"]').first()
    await expect(first).toBeVisible()

    const ticker = (await first.getAttribute('data-testid'))?.replace(
      'coin-option-',
      ''
    )
    const lines = (await first.innerText()).split('\n').map(line => line.trim())
    const chain = Object.values(Chain).find(value => lines.includes(value))

    if (!chain || !ticker) {
      throw new Error(
        `Cannot read the selected send asset (chain=${
          chain || 'missing'
        }, ticker=${ticker || 'missing'})`
      )
    }

    return { chain, ticker }
  }

  private async selectionFailure(
    requested: string,
    route: string[],
    expectedChain?: string
  ): Promise<never> {
    const observed = await this.getSelectedCoin().catch(() => ({
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

  /**
   * Returns to the step that was open before selecting a coin. Picking a coin
   * lands on the address; the amount comes back only if the header allows it.
   */
  private async restoreStep(step: SendStep): Promise<void> {
    if (step === 'coin') return

    if (step === 'amount' && (await this.step('amount').isEnabled())) {
      await this.openStep('amount')
      return
    }

    await this.openStep('address')
  }

  /**
   * Select the coin to send in the asset step.
   *
   * Picks the requested chain on the "Select chains" page, then the coin's
   * row, and checks the result. A request that already matches the
   * selection changes nothing.
   * Fails, naming the route taken, when the chain or the coin is missing or
   * when more than one row matches.
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
      mappedChain || !requestedChain
        ? requestedTicker
        : chainFeeCoin[requestedChain].ticker
    const stepToRestore = await this.currentStep()
    const route: string[] = []

    await waitForLoadingComplete(this.page)
    let selected = await this.getSelectedCoin()

    const selectionMatches = () =>
      (!requestedChain ||
        selected.chain.toLowerCase() === requestedChain.toLowerCase()) &&
      selected.ticker.toUpperCase() === expectedTicker

    if (selectionMatches()) {
      await this.restoreStep(stepToRestore)
      return
    }

    route.push(`asset:${requestedTicker} on ${selected.chain}`)

    if (requestedChain) {
      route.push(`chain:${requestedChain}`)
      if (!(await this.selectChainFilter(requestedChain))) {
        return this.selectionFailure(
          requestedTicker,
          [...route, 'missing'],
          requestedChain
        )
      }
    }

    const options = this.getCoinOption(expectedTicker)
    await options
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {})
    const count = await options.count()

    if (count !== 1) {
      return this.selectionFailure(
        requestedTicker,
        [
          ...route,
          count === 0
            ? `asset:${expectedTicker} missing`
            : `asset:${expectedTicker} ambiguous (${count} matches)`,
        ],
        requestedChain
      )
    }

    await options.first().click()
    await expect(this.step('address')).toHaveAttribute('aria-current', 'step')

    selected = await this.getSelectedCoin()
    if (!selectionMatches()) {
      await this.selectionFailure(
        requestedTicker,
        [...route, 'final verification failed'],
        requestedChain
      )
    }

    await this.restoreStep(stepToRestore === 'coin' ? 'address' : stepToRestore)
  }

  /**
   * Fill recipient address
   */
  async fillAddress(address: string): Promise<void> {
    await this.openStep('address')
    await this.addressInput.clear()
    await this.addressInput.fill(address)
  }

  /**
   * Fill amount to send
   */
  async fillAmount(amount: string): Promise<void> {
    await this.openStep('amount')
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
