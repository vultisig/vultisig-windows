/**
 * Guards the Add Folder / Edit Folder vault rows against a long vault name
 * pushing the toggle out of the card (#4906). The shared `VaultListRow` used
 * to keep its title side at `flex-shrink: 0`, so the name never truncated and
 * the trailing switch overflowed the row at the 360px popup width. The rows
 * also no longer render the signer pill — the leading icon already conveys
 * the vault type.
 */

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'

const longVaultName = 'Ahmad-Ehsan Family Treasury Vault With A Long Name'
const folderId = 'family-folder'
const popup = { width: 360, height: 600 }

type Screen = {
  title: string
  initialView: Record<string, unknown>
  vaultFolderId?: string
}

const screens: Screen[] = [
  {
    title: 'Add Folder',
    initialView: { id: 'createVaultFolder' },
  },
  {
    title: 'Edit Folder',
    initialView: { id: 'updateVaultFolder', state: { id: folderId } },
    vaultFolderId: folderId,
  },
]

const seedScreen = async (context: BrowserContext, screen: Screen) => {
  const { vaultId, vault } = await createSeededVault({ name: longVaultName })

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    initialView: screen.initialView,
    vaultFolders: [{ id: folderId, name: 'Family', order: 0 }],
    vaults: [{ ...vault, folderId: screen.vaultFolderId }],
    vaultsCoins: { [vaultId]: [] },
  })
}

const getRowGeometry = (page: Page) =>
  page
    .getByTestId('vault-list-row')
    .first()
    .evaluate(row => {
      const title = row.querySelector('p')
      const toggle = [
        ...row.querySelectorAll<HTMLElement>('[tabindex="0"]'),
      ].at(-1)
      if (!title || !toggle) {
        throw new Error('Vault row is missing its title or toggle')
      }

      const rowBox = row.getBoundingClientRect()
      const titleBox = title.getBoundingClientRect()
      const toggleBox = toggle.getBoundingClientRect()
      const root = document.documentElement

      return {
        titleEllipsized: title.scrollWidth > title.clientWidth,
        titleEndsBeforeToggle: titleBox.right <= toggleBox.left,
        toggleInsideRow:
          toggleBox.left >= rowBox.left - 0.5 &&
          toggleBox.right <= rowBox.right + 0.5,
        rowInsideViewport: rowBox.right <= root.clientWidth + 0.5,
        pageHorizontalScroll: root.scrollWidth - root.clientWidth,
      }
    })

for (const screen of screens) {
  test(`${screen.title}: a long vault name keeps the toggle inside the row at 360px`, async ({
    context,
    extensionId,
  }) => {
    await seedScreen(context, screen)

    const page = await context.newPage()
    await page.setViewportSize(popup)
    await page.goto(`chrome-extension://${extensionId}/index.html`)

    const row = page.getByTestId('vault-list-row').first()
    await expect(row).toBeVisible({ timeout: 30_000 })
    await expect(row).toContainText(longVaultName)
    await expect(row.getByText(/^fast$/i)).toHaveCount(0)
    await expect(row.getByText(/part \d+-of-\d+/i)).toHaveCount(0)

    await expect
      .poll(() => getRowGeometry(page))
      .toEqual({
        titleEllipsized: true,
        titleEndsBeforeToggle: true,
        toggleInsideRow: true,
        rowInsideViewport: true,
        pageHorizontalScroll: 0,
      })

    const artifactDirectory = process.env.EXTENSION_FOLDER_QA_ARTIFACT_DIR
    if (artifactDirectory) {
      await mkdir(artifactDirectory, { recursive: true })
      await page.screenshot({
        path: join(artifactDirectory, `${screen.title.replace(/ /g, '-')}.png`),
      })
    }

    await page.close()
  })
}
