/**
 * Viewport Fit E2E Tests
 *
 * Guards against page-level scrolling on fixed extension screens (#4652).
 * The extension body used to keep a hard 600px min-height in non-popup
 * views, so any side panel shorter than 600px showed a phantom scrollbar
 * even when every screen fit. These tests assert the page itself never
 * scrolls at supported sizes; screens with unbounded content may still
 * scroll inside their own bounded content region.
 *
 * Runs without a vault: covers the initial screen and the new-vault flow
 * entry, which exercise the shared page chrome the floor used to break.
 */

import type { Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'

const viewports = [
  { width: 480, height: 600 }, // popup baseline
  { width: 480, height: 500 }, // short side panel
  { width: 360, height: 500 }, // minimal side panel
]

const getPageOverflow = (page: Page) =>
  page.evaluate(() => {
    const root = document.documentElement
    return {
      vertical: root.scrollHeight - root.clientHeight,
      horizontal: root.scrollWidth - root.clientWidth,
    }
  })

test.describe('Viewport fit', () => {
  for (const viewport of viewports) {
    test(`no page-level scroll at ${viewport.width}x${viewport.height}`, async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage()
      await page.setViewportSize(viewport)
      await page.goto(`chrome-extension://${extensionId}/index.html`)
      await page.waitForFunction(
        () => document.querySelectorAll('button').length > 0
      )

      expect(await getPageOverflow(page)).toEqual({
        vertical: 0,
        horizontal: 0,
      })

      const createVaultButton = page.getByRole('button', {
        name: /create new vault/i,
      })
      await expect(createVaultButton).toBeVisible()
      await createVaultButton.click()
      await expect(createVaultButton).toBeHidden()
      await expect
        .poll(() => getPageOverflow(page))
        .toEqual({ vertical: 0, horizontal: 0 })

      await page.close()
    })
  }
})
