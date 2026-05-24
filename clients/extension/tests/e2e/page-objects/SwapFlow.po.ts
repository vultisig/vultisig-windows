import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'
import {
  waitForFormReady,
  waitForStackedFieldReady,
  robustClick,
  waitForLoadingComplete,
} from '../helpers/ui-waits'

export class SwapFlow extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

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

  // Fast vaults show "Fast Sign", secure vaults show "Sign".
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

  async waitForView(timeout = 10_000): Promise<void> {
    await waitForFormReady(this.page, 'swap-form', timeout)
  }

  // ETH belongs to multiple chains (Ethereum + L2s) — for unambiguous routing
  // callers should drive via chain IDs through CHAIN_TO_NATIVE/getNativeSymbol.
  private static readonly SYMBOL_TO_CHAIN: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    BNB: 'BSC',
    SOL: 'Solana',
    RUNE: 'THORChain',
    CACAO: 'MayaChain',
    ATOM: 'Cosmos',
    MATIC: 'Polygon',
    AVAX: 'Avalanche',
    LTC: 'Litecoin',
    DOGE: 'Dogecoin',
    BCH: 'Bitcoin-Cash',
    DASH: 'Dash',
    ZEC: 'Zcash',
    KUJI: 'Kujira',
    ADA: 'Cardano',
    SUI: 'Sui',
    TON: 'Ton',
    TRX: 'Tron',
    XRP: 'Ripple',
  }

  // Covers the full SwapKit-enabled chain set (SDK 0.26+).
  private static readonly CHAIN_TO_NATIVE: Record<string, string> = {
    // SwapKit source chains
    ethereum: 'ETH',
    arbitrum: 'ETH',
    optimism: 'ETH',
    base: 'ETH',
    bsc: 'BNB',
    polygon: 'MATIC',
    avalanche: 'AVAX',
    solana: 'SOL',
    // SwapKit destination-only chains
    bitcoin: 'BTC',
    bitcoincash: 'BCH',
    cardano: 'ADA',
    cosmos: 'ATOM',
    dash: 'DASH',
    dogecoin: 'DOGE',
    kujira: 'KUJI',
    litecoin: 'LTC',
    mayachain: 'CACAO',
    ripple: 'XRP',
    sui: 'SUI',
    thorchain: 'RUNE',
    ton: 'TON',
    tron: 'TRX',
    zcash: 'ZEC',
  }

  getNativeSymbol(chainId: string): string {
    return SwapFlow.CHAIN_TO_NATIVE[chainId.toLowerCase()] || chainId.toUpperCase()
  }

  // Clicking a chain in the explorer's chain carousel switches chain AND selects its native token.
  async selectFromCoin(coin: string): Promise<void> {
    const chainName = SwapFlow.SYMBOL_TO_CHAIN[coin.toUpperCase()] || coin

    await waitForStackedFieldReady(this.page)
    await waitForLoadingComplete(this.page)

    const currentCoin = await this.swapForm.locator('[data-testid="swap-from-coin-selector"]').textContent().catch(() => '')
    if (currentCoin?.toUpperCase().includes(coin.toUpperCase())) {
      console.log(`From coin ${coin} already selected`)
      return
    }

    await this.fromCoinSelector.click({ force: true })
    await this.page.waitForTimeout(800)

    const chainOption = this.getExplorerChainOption(chainName)
    if (await chainOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chainOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${chainName} from explorer carousel`)
      return
    }

    const coinOption = this.getCoinOption(coin)
    if (await coinOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coinOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${coin} from coin options`)
      return
    }

    console.log(`Could not select from coin ${coin}`)
  }

  async selectToCoin(coin: string): Promise<void> {
    const chainName = SwapFlow.SYMBOL_TO_CHAIN[coin.toUpperCase()] || coin

    await waitForStackedFieldReady(this.page)
    await waitForLoadingComplete(this.page)

    const currentCoin = await this.swapForm.locator('[data-testid="swap-to-coin-selector"]').textContent().catch(() => '')
    if (currentCoin?.toUpperCase().includes(coin.toUpperCase())) {
      console.log(`To coin ${coin} already selected`)
      return
    }

    await this.toCoinSelector.click({ force: true })
    await this.page.waitForTimeout(800)

    const chainOption = this.getExplorerChainOption(chainName)
    if (await chainOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chainOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${chainName} from explorer carousel (to)`)
      return
    }

    const coinOption = this.getCoinOption(coin)
    if (await coinOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coinOption.click({ force: true })
      await this.page.waitForTimeout(500)
      console.log(`Selected ${coin} from coin options (to)`)
      return
    }

    console.log(`Could not select to coin ${coin}`)
  }

  async fillAmount(amount: string): Promise<void> {
    await this.fromAmountInput.click({ force: true })
    await this.page.waitForTimeout(100)
    await this.fromAmountInput.clear()
    // pressSequentially triggers per-char input events; blur triggers change.
    await this.fromAmountInput.pressSequentially(amount, { delay: 50 })
    await this.fromAmountInput.blur()
    await this.page.waitForTimeout(300)
  }

  // percent: 25, 50, 75, or 100 (Max)
  async clickPercentage(percent: 25 | 50 | 75 | 100 = 25): Promise<void> {
    const btnText = percent === 100 ? 'Max' : `${percent}%`
    const btn = this.page.locator(`button:has-text("${btnText}")`)
    await btn.click()
    await this.page.waitForTimeout(500)
    console.log(`Clicked ${btnText} button`)
  }

  async clickMax(): Promise<void> {
    await this.maxButton.click()
    await this.page.waitForTimeout(300)
  }

  async reverse(): Promise<void> {
    await this.reverseButton.click()
    await this.page.waitForTimeout(300)
  }

  // Quotes come from aggregators (THORChain/1inch/etc.) and can take seconds.
  // Settle when an output appears, continue is enabled, or an error shows.
  async waitForQuote(timeout = 30_000): Promise<void> {
    await this.quoteLoading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await this.quoteLoading.waitFor({ state: 'hidden', timeout }).catch(() => {})

    await waitForLoadingComplete(this.page, timeout)

    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      const output = await this.getExpectedOutput()
      if (output && output !== '0' && output !== '') {
        console.log(`Quote loaded: output = ${output}`)
        break
      }

      const canContinue = await this.isContinueEnabled().catch(() => false)
      if (canContinue) {
        console.log('Quote loaded: continue button is enabled')
        break
      }

      const errorText = this.page.locator('text=/no.route|insufficient|error|failed/i').first()
      if (await errorText.isVisible().catch(() => false)) {
        console.log('Quote failed: error message visible')
        break
      }

      await this.page.waitForTimeout(500)
    }

    await this.page.waitForTimeout(500)
  }

  async continue(): Promise<void> {
    await waitForLoadingComplete(this.page)
    await expect(this.continueButton).toBeEnabled({ timeout: 10000 })
    await robustClick(this.continueButton)
    await this.page.waitForTimeout(500)
  }

  // The verify page may render multiple terms checkboxes as custom components
  // (invisible <input> inside <label>) — click the label, not the input.
  async acceptTerms(): Promise<void> {
    await waitForLoadingComplete(this.page)
    await this.page.waitForTimeout(300)

    const termsCheckboxes = this.termsCheckboxes
    const termsCount = await termsCheckboxes.count()

    if (termsCount > 0) {
      for (let i = 0; i < termsCount; i++) {
        await robustClick(termsCheckboxes.nth(i))
        await this.page.waitForTimeout(200)
      }
      return
    }

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

  // Fast vaults open a password modal after "Fast Sign".
  async sign(): Promise<void> {
    await waitForLoadingComplete(this.page)
    await robustClick(this.signButton)
    await this.page.waitForTimeout(500)

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

  async waitForSuccess(timeout = 120_000): Promise<void> {
    await this.successScreen.waitFor({ state: 'visible', timeout })
  }

  async getTxHash(): Promise<string> {
    await this.txHashDisplay.waitFor({ state: 'visible' })
    return (await this.txHashDisplay.textContent()) || ''
  }

  async getExpectedOutput(): Promise<string> {
    if (await this.toAmountDisplay.isVisible()) {
      return (await this.toAmountDisplay.textContent()) || ''
    }
    return ''
  }

  async getSwapRate(): Promise<string> {
    if (await this.rateDisplay.isVisible()) {
      return (await this.rateDisplay.textContent()) || ''
    }
    return ''
  }

  async isContinueEnabled(): Promise<boolean> {
    return this.continueButton.isEnabled()
  }

  /**
   * Pre-broadcast safety gate. Reads the visible from/to coin selectors and
   * confirms they match the intended symbols. Throws if mismatch so callers
   * can abort BEFORE clicking continue and broadcasting an unintended swap.
   *
   * Known failure mode this catches: selectFromCoin('ETH') clicks the chain
   * carousel which switches to Ethereum context, but the token row defaults
   * to USDC (or whatever appears first), so the form silently ends up with
   * USDC>ETH instead of ETH>$DEST. Without this gate the test broadcasts
   * real money on the wrong pair.
   */
  async assertSelectionMatches(fromSymbol: string, toSymbol: string): Promise<void> {
    const fromText = ((await this.fromCoinSelector.textContent()) || '').toUpperCase()
    const toText = ((await this.toCoinSelector.textContent()) || '').toUpperCase()

    const fromOk = fromText.includes(fromSymbol.toUpperCase())
    const toOk = toText.includes(toSymbol.toUpperCase())

    // Catch the "fell back to USDC" failure mode explicitly. If the test was
    // not expecting a stable, presence of a common stable symbol in the from
    // selector is a strong signal the chain-carousel pick didn't actually
    // select native.
    const STABLE_SYMBOLS = ['USDC', 'USDT', 'DAI', 'TUSD', 'FRAX', 'LUSD']
    const expectingStableSource = STABLE_SYMBOLS.includes(fromSymbol.toUpperCase())
    const unexpectedStableInSource =
      !expectingStableSource && STABLE_SYMBOLS.some(s => fromText.includes(s))

    if (!fromOk || !toOk || unexpectedStableInSource) {
      throw new Error(
        `Swap form selection mismatch — refusing to broadcast.\n` +
          `  Expected: ${fromSymbol} -> ${toSymbol}\n` +
          `  From selector text: ${JSON.stringify(fromText)}\n` +
          `  To selector text:   ${JSON.stringify(toText)}\n` +
          `  Checks: fromOk=${fromOk} toOk=${toOk} unexpectedStableInSource=${unexpectedStableInSource}`
      )
    }
  }

  async prepareSwap(fromCoin: string, toCoin: string, amount: string): Promise<void> {
    await this.selectFromCoin(fromCoin)
    await this.selectToCoin(toCoin)
    await this.fillAmount(amount)
    await this.waitForQuote()
  }

  // @deprecated Use prepareSwapWithAmount for dynamic amount-based swaps.
  // Default 75% picks a value above provider minimum thresholds.
  async prepareNativeSwap(fromChainId: string, toChainId: string, percent: 25 | 50 | 75 | 100 = 75): Promise<void> {
    const fromSymbol = this.getNativeSymbol(fromChainId)
    const toSymbol = this.getNativeSymbol(toChainId)
    console.log(`Preparing native swap: ${fromSymbol} (${fromChainId}) → ${toSymbol} (${toChainId}) @ ${percent}%`)
    await this.selectFromCoin(fromSymbol)
    await this.selectToCoin(toSymbol)
    await this.clickPercentage(percent)
    await this.waitForQuote()
  }

  // UI defaults to BTC→ETH; if our intended direction is the inverse, use the
  // reverse button instead of re-selecting both sides.
  async prepareSwapWithAmount(fromChainId: string, toChainId: string, amount: string): Promise<void> {
    const fromSymbol = this.getNativeSymbol(fromChainId)
    const toSymbol = this.getNativeSymbol(toChainId)
    console.log(`Preparing swap: ${amount} ${fromSymbol} (${fromChainId}) → ${toSymbol} (${toChainId})`)

    await this.page.waitForTimeout(500)

    const currentFromText = await this.fromCoinSelector.textContent().catch(() => '') || ''
    const currentToText = await this.toCoinSelector.textContent().catch(() => '') || ''
    console.log(`Current selection: ${currentFromText} → ${currentToText}`)

    if (currentFromText.toUpperCase().includes(toSymbol) &&
        currentToText.toUpperCase().includes(fromSymbol)) {
      console.log('Using reverse button to swap direction')
      await this.reverse()
      await this.page.waitForTimeout(500)
    } else if (!currentFromText.toUpperCase().includes(fromSymbol)) {
      await this.selectFromCoin(fromSymbol)
    }

    const updatedToText = await this.toCoinSelector.textContent().catch(() => '') || ''
    if (!updatedToText.toUpperCase().includes(toSymbol)) {
      await this.selectToCoin(toSymbol)
    }

    await this.fillAmount(amount)
    await this.waitForQuote()
  }

  // Executes a real swap if signing succeeds.
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
