/**
 * Guards the 360px popup against long vault names.
 *
 * The popup narrowed from 480px to 360px (#4861), which removed the slack that
 * had been hiding rows whose name and address compete for one line. Each fix
 * since has been the same three properties applied by hand, so this test walks
 * the screens that render a vault name and asserts none of them scroll
 * sideways or push content out of view.
 */

import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  writeChromeSessionStorage,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'

const longVaultName = 'Fast-DKLSFast-DKLSFast-DKLSFast-DKLSFast-DKLSDKLS'
const popup = { width: 360, height: 600 }

type Screen = {
  title: string
  initialView: Record<string, unknown>
}

const screens: Screen[] = [
  { title: 'Vault home', initialView: { id: 'vault' } },
  { title: 'Earn', initialView: { id: 'defi', state: {} } },
  { title: 'Vault settings', initialView: { id: 'settings' } },
  { title: 'Vault list', initialView: { id: 'vaults' } },
]

type SeedInput = {
  context: BrowserContext
  screen: Screen
}

const seed = async ({ context, screen }: SeedInput) => {
  const { vaultId, vault } = await createSeededVault({ name: longVaultName })

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    vaults: [vault],
    vaultsCoins: { [vaultId]: [] },
  })
  await writeChromeSessionStorage(context, 'initialView', screen.initialView)
}

/**
 * Horizontal page scroll plus any element whose box runs past the viewport.
 * Both matter: the page can stay unscrolled while a row is clipped by an
 * ancestor that hides its overflow.
 */
const getOverflow = (page: Page) =>
  page.evaluate(() => {
    const root = document.documentElement
    const escaped: string[] = []

    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      const { left, right, width } = element.getBoundingClientRect()
      if (width === 0) continue
      if (right > root.clientWidth + 1 || left < -1) {
        escaped.push(
          `${element.tagName.toLowerCase()}.${element.className || '(no class)'}`.slice(
            0,
            80
          )
        )
      }
    }

    return {
      horizontalScroll: root.scrollWidth - root.clientWidth,
      escapedCount: escaped.length,
      escaped: escaped.slice(0, 5),
    }
  })

for (const screen of screens) {
  test(`${screen.title}: a long vault name stays inside the 360px popup`, async ({
    context,
    extensionId,
  }) => {
    await seed({ context, screen })

    const page = await context.newPage()
    await page.setViewportSize(popup)
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      undefined,
      { timeout: 30_000 }
    )

    await expect
      .poll(() => getOverflow(page), { timeout: 15_000 })
      .toEqual({ horizontalScroll: 0, escapedCount: 0, escaped: [] })

    await page.close()
  })
}
