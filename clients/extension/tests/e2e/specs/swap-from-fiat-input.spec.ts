/**
 * Guards the swap form's fiat input mode (#4938). The From card keeps the
 * token amount as the editable field with the fiat value under it; tapping
 * the fiat line flips the two so a fiat amount can be typed, and tapping the
 * token line under it brings token input back with the converted amount.
 *
 * The price feed is stubbed to a fixed rate so every conversion the test
 * asserts is exact; the balance the percent chip resolves against is read
 * from the card, since it comes from the live chain.
 */

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const popup = { width: 360, height: 600 }

/** Fixed USD price served for every coin the form asks about. */
const stubbedPrice = 50_000

const stubCoinPrices = (page: Page) =>
  page.route('**/coingeicko/api/v3/simple/price*', route => {
    const url = new URL(route.request().url())
    const ids = (url.searchParams.get('ids') ?? '').split(',').filter(Boolean)
    const currency = url.searchParams.get('vs_currencies') ?? 'usd'

    return route.fulfill({
      json: Object.fromEntries(
        ids.map(id => [id, { [currency]: stubbedPrice }])
      ),
    })
  })

/** Splits the card's balance line (`0.00064157 BTC`) into amount and ticker. */
const parseBalanceLine = (line: string) => {
  const match = line.trim().match(/^([\d,.]+)\s+(\S+)$/)
  if (!match) {
    throw new Error(`Unexpected balance line: "${line}"`)
  }

  return { amount: Number(match[1].replace(/,/g, '')), ticker: match[2] }
}

test.describe('swap From fiat input', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      test.skip()
      return
    }

    await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
  })

  test('flips between token and fiat input from the secondary line', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.setViewportSize(popup)
    await stubCoinPrices(page)
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    await vaultPage.goto()
    await vaultPage.waitForView(20_000)
    await vaultPage.navigateToSwap()
    await swapFlow.waitForView(20_000)

    const fiatLine = page.getByTestId('swap-from-fiat-amount')
    const fiatInput = page.getByTestId('swap-from-fiat-amount-input')
    const tokenLine = page.getByTestId('swap-from-token-amount')
    const balanceLine = page
      .getByTestId('swap-from-section')
      .locator('button', { hasText: /^[\d,.]+ \S+$/ })
      .first()

    // Token input is the default, and the fiat line only appears once the
    // From coin has a price behind it.
    await expect(swapFlow.fromAmountInput).toBeVisible()
    await expect(fiatLine).toBeVisible({ timeout: 30_000 })
    await expect(fiatInput).toHaveCount(0)

    await expect(balanceLine).toBeVisible({ timeout: 30_000 })
    const { amount: balance, ticker } = parseBalanceLine(
      await balanceLine.innerText()
    )

    const artifactDirectory = process.env.EXTENSION_SWAP_FIAT_QA_ARTIFACT_DIR
    if (artifactDirectory) {
      await mkdir(artifactDirectory, { recursive: true })
    }

    await swapFlow.fromAmountInput.fill('1')
    await expect(fiatLine).toHaveText('$50,000.00')
    if (artifactDirectory) {
      await page.screenshot({
        path: join(artifactDirectory, 'swap-from-token-mode.png'),
      })
    }

    await fiatLine.click()
    await expect(fiatInput).toBeVisible()
    await expect(fiatInput).toBeFocused()
    await expect(swapFlow.fromAmountInput).toHaveCount(0)
    // Entering fiat mode carries the typed token amount over as its fiat value.
    await expect(fiatInput).toHaveValue('50000')
    await expect(tokenLine).toHaveText(`1 ${ticker}`)

    await fiatInput.fill('10')
    await expect(tokenLine).toHaveText(`0.0002 ${ticker}`)
    if (artifactDirectory) {
      await page.screenshot({
        path: join(artifactDirectory, 'swap-from-fiat-mode.png'),
      })
    }

    // Percent chips still resolve against the token balance; in fiat mode the
    // field shows that amount's fiat value. The balance line is rounded to
    // 8 fraction digits and the field to the cent, hence the tolerance.
    await page.getByRole('button', { name: '25%' }).click()
    await expect(fiatInput).not.toHaveValue('10')
    const quarterFiatValue = Number(await fiatInput.inputValue())
    expect(quarterFiatValue).toBeCloseTo(balance * 0.25 * stubbedPrice, 1)

    await tokenLine.click()
    await expect(swapFlow.fromAmountInput).toBeVisible()
    await expect(fiatInput).toHaveCount(0)
    await expect(swapFlow.fromAmountInput).not.toHaveValue('')

    await page.close()
  })
})
