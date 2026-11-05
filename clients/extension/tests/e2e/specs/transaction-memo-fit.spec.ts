/**
 * Guards the Transaction Details memo row against unbroken memos (#5242).
 *
 * An EVM contract call is recorded with its calldata as the memo: a single
 * run of hex with no spaces. Rendered as plain text it could not wrap, so it
 * ran past the card edge and gave the popup a horizontal scrollbar. This test
 * seeds such a record and asserts the memo wraps inside its card, clear of
 * its label, at the popup and side panel widths.
 */

import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  writeChromeSessionStorage,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'

const approveCalldata =
  '0x095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0b8'

const recordId = 'memo-fit-record'

const viewports = [
  { width: 360, height: 600 }, // popup
  { width: 480, height: 600 }, // side panel
]

const seed = async (context: BrowserContext) => {
  const { vaultId, vault } = await createSeededVault({ name: 'Memo Fit' })
  const address = '0x000000000000000000000000000000000000dEaD'

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    vaults: [vault],
    vaultsCoins: { [vaultId]: [] },
    // Confirmed with its fee already read, so the page polls nothing.
    [`transactionHistory:${vaultId}`]: [
      {
        id: recordId,
        vaultId,
        type: 'send',
        status: 'confirmed',
        chain: 'Ethereum',
        timestamp: new Date().toISOString(),
        txHash: `0x${'ab'.repeat(32)}`,
        explorerUrl: '',
        fiatValue: '0',
        data: JSON.stringify({
          fromAddress: address,
          toAddress: address,
          amount: '0',
          token: 'ETH',
          tokenLogo: 'eth',
          decimals: 18,
          networkFee: { amount: '21000', decimals: 18, ticker: 'ETH' },
          memo: approveCalldata,
        }),
      },
    ],
  })
  await writeChromeSessionStorage(context, 'initialView', {
    id: 'transactionDetail',
    state: { id: recordId },
  })
}

/**
 * Where the memo sits relative to the page, its card and its label. The card
 * is the nearest ancestor that also holds the From row.
 */
const measureMemo = (page: Page) =>
  page.evaluate(memo => {
    const root = document.documentElement
    const value = [...document.querySelectorAll<HTMLElement>('body *')].find(
      element => element.childElementCount === 0 && element.textContent === memo
    )
    if (!value) return null

    const label = [...value.parentElement!.children].find(
      element => element !== value
    )
    let card = value.parentElement!
    while (!card.textContent?.includes('From') && card.parentElement) {
      card = card.parentElement
    }

    const valueBox = value.getBoundingClientRect()
    const cardBox = card.getBoundingClientRect()
    const text = document.createRange()
    text.selectNodeContents(value)
    const lineTops = new Set(
      [...text.getClientRects()].map(rect => Math.round(rect.top))
    )

    return {
      horizontalScroll: root.scrollWidth - root.clientWidth,
      insideCard:
        valueBox.left >= cardBox.left - 1 && valueBox.right <= cardBox.right + 1,
      wraps: lineTops.size > 1,
      labelGap: label
        ? Math.round(valueBox.left - label.getBoundingClientRect().right)
        : null,
    }
  }, approveCalldata)

for (const viewport of viewports) {
  test(`an unbroken memo wraps inside its card at ${viewport.width}px`, async ({
    context,
    extensionId,
  }) => {
    await seed(context)

    const page = await context.newPage()
    await page.setViewportSize(viewport)
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await expect(page.getByText(approveCalldata)).toBeVisible({
      timeout: 30_000,
    })

    const memo = await measureMemo(page)
    expect(memo).toMatchObject({
      horizontalScroll: 0,
      insideCard: true,
      wraps: true,
    })
    expect(memo?.labelGap).toBeGreaterThanOrEqual(12)

    await page.close()
  })
}
