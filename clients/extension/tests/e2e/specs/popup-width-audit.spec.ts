/**
 * Temporary measuring harness for #4687. Not a guard — it prints geometry at
 * the 360px popup width so the fixes can be checked without a human looking at
 * a build. Delete before the branch merges.
 */

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const popup = { width: 360, height: 600 }

test.describe('popup width audit', () => {
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

  test('swap form at 360', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.setViewportSize(popup)

    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    await vaultPage.goto()
    await vaultPage.waitForView(30_000)
    await vaultPage.navigateToSwap()
    await swapFlow.waitForView(30_000)

    await page.waitForTimeout(1500)

    const report = await page.evaluate(() => {
      const pill = document.querySelector<HTMLElement>(
        '[data-testid="swap-from-coin-selector"]'
      )
      const chevron = pill?.querySelector('svg:last-of-type')
      const chevronBox = chevron?.getBoundingClientRect()
      const pillBox = pill?.getBoundingClientRect()

      // Buttons only: each suggestion also has an inner text node, and its top
      // differs from the button's, which would read as a second row.
      const suggestions = [...document.querySelectorAll('button')].filter(el =>
        /^(25%|50%|75%|max)$/i.test(el.textContent?.trim() ?? '')
      )
      const rows = new Set(
        suggestions.map(el => Math.round(el.getBoundingClientRect().top))
      )

      const root = document.documentElement
      return {
        pillWidth: pillBox ? +pillBox.width.toFixed(1) : null,
        chevronWidth: chevronBox ? +chevronBox.width.toFixed(1) : null,
        chevronInsidePill:
          pillBox && chevronBox
            ? chevronBox.right <= pillBox.right + 0.5
            : null,
        suggestionCount: suggestions.length,
        suggestionRows: rows.size,
        suggestionWidths: suggestions.map(
          el => +el.getBoundingClientRect().width.toFixed(1)
        ),
        overflowingRows: [...document.querySelectorAll('*')].filter(
          el => el.scrollWidth - el.clientWidth > 1
        ).length,
        pageHorizontalScroll: root.scrollWidth - root.clientWidth,
      }
    })

    // The vault's from-coin is a fee coin, which is offered no Max, so the
    // four-button case never renders here. The question is a layout one, so
    // ask it of the real row under the real stylesheet: clone a suggestion
    // into its own container and see whether the row still holds one line.
    const withMax = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(el =>
        /^(25%|50%|75%)$/.test(el.textContent?.trim() ?? '')
      )
      const row = button?.parentElement
      if (!button || !row) return null

      const clone = button.cloneNode(true) as HTMLElement
      clone.textContent = 'Max'
      row.appendChild(clone)

      const buttons = [...row.children]
      const result = {
        count: buttons.length,
        rows: new Set(
          buttons.map(el => Math.round(el.getBoundingClientRect().top))
        ).size,
        widths: buttons.map(el => +el.getBoundingClientRect().width.toFixed(1)),
      }
      clone.remove()
      return result
    })

    console.log('SWAP_REPORT', JSON.stringify(report))
    console.log('SWAP_WITH_MAX', JSON.stringify(withMax))
    expect(withMax?.rows).toBe(1)
    expect(report.pageHorizontalScroll).toBe(0)
    expect(report.chevronInsidePill).toBe(true)
    expect(report.suggestionRows).toBe(1)
  })

  test('select chain modal at 360', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.setViewportSize(popup)

    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    await vaultPage.goto()
    await vaultPage.waitForView(30_000)
    await vaultPage.navigateToSwap()
    await swapFlow.waitForView(30_000)

    await page
      .getByTestId('swap-from-chain-selector')
      .click({ timeout: 15_000 })
    await expect(page.getByText('Select chain', { exact: true })).toBeVisible({
      timeout: 15_000,
    })
    await page.waitForTimeout(1200)

    const report = await page.evaluate(() => {
      const scrollers = [...document.querySelectorAll<HTMLElement>('*')]
        .filter(el => el.scrollWidth - el.clientWidth > 1)
        .filter(el => /auto|scroll/.test(getComputedStyle(el).overflowX))
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          testId: el.closest('[data-testid]')?.getAttribute('data-testid'),
          html: el.outerHTML.slice(0, 140),
          cls: el.className?.toString().slice(0, 60),
          overflowX: getComputedStyle(el).overflowX,
          overflowY: getComputedStyle(el).overflowY,
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
        }))
      const root = document.documentElement
      return {
        horizontalScrollers: scrollers,
        pageHorizontalScroll: root.scrollWidth - root.clientWidth,
      }
    })

    console.log('CHAIN_MODAL_REPORT', JSON.stringify(report))
    expect(report.horizontalScrollers).toEqual([])
  })
})
