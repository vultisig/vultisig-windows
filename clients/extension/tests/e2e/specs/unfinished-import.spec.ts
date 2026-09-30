import { access, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  readChromeStorage,
  writeChromeSessionStorage,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'
import {
  getSecureVaultConfigFromEnv,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'

const capture = async (page: Page, name: string) => {
  const directory = process.env.UNFINISHED_IMPORT_QA_DIR
  if (!directory) return
  if (await page.getByTestId('vault-page').isVisible()) {
    await expect(page.getByTestId('balance-value')).toContainText(/\d/, {
      timeout: 45_000,
    })
  }
  await mkdir(directory, { recursive: true })
  await page.screenshot({ path: join(directory, `${name}.png`) })
}

const openPopupPage = async (context: BrowserContext, extensionId: string) => {
  const page = await context.newPage()
  await page.setViewportSize({ width: 360, height: 650 })
  await page.goto(`chrome-extension://${extensionId}/index.html?view=popup`)
  return page
}

const startImportFromPopup = async (page: Page, context: BrowserContext) => {
  await page.getByRole('button', { name: /^Import/ }).click()
  const shareOption = page.getByText('Import vault share', { exact: true })
  const expandedPage = context.waitForEvent('page')
  await shareOption.click()
  const importPage = await expandedPage
  await expect(importPage.getByTestId('import-vault-form')).toBeVisible()
  return importPage
}

const completeImport = async (
  page: Page,
  config: { vaultPath: string; password: string }
) => {
  await page.locator('input[type="file"]').setInputFiles(config.vaultPath)
  await page.getByTestId('import-continue').click()
  const password = page.locator('input[type="password"]')
  await expect(password.or(page.getByTestId('vault-page'))).toBeVisible({
    timeout: 30_000,
  })
  if (await password.isVisible()) {
    await password.fill(config.password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await expect(page.getByTestId('vault-page')).toBeVisible({ timeout: 30_000 })
}

test('wallet stays accessible while the original import tab completes', async ({
  context,
  extensionId,
}) => {
  test.setTimeout(120_000)
  const first = getVaultConfigFromEnv()
  const [second] = getSecureVaultConfigFromEnv()
  test.skip(
    !first || !second,
    'Requires designated Fast and Secure vault files'
  )
  if (!first || !second) return

  await writeChromeStorageMultiple(context, {
    hasFinishedOnboarding: true,
    hasSeenNotificationPrompt: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
  })

  const initialPopup = await openPopupPage(context, extensionId)
  await expect(initialPopup.getByTestId('new-vault-create')).toBeVisible()
  await capture(initialPopup, 'empty-wallet')
  const firstImport = await startImportFromPopup(initialPopup, context)
  await completeImport(firstImport, first)
  await expect
    .poll(
      async () =>
        (await readChromeStorage<unknown[]>(context, 'vaults'))?.length
    )
    .toBe(1)
  const originalVaultId = await readChromeStorage<string>(
    context,
    'currentVaultId'
  )
  await initialPopup.close()
  await firstImport.close()

  const launcher = await openPopupPage(context, extensionId)
  await launcher.getByTestId('vault-selector-page-header').click()
  await launcher
    .getByRole('button', { name: 'Add New Vault', exact: true })
    .click()
  const importPage = await startImportFromPopup(launcher, context)
  await expect
    .poll(() => readChromeStorage(context, 'persistedView'))
    .toBeUndefined()
  await launcher.close()
  const openTabs = context.pages().length

  for (let attempt = 0; attempt < 3; attempt++) {
    const popup = await openPopupPage(context, extensionId)
    await expect(popup.getByTestId('vault-page')).toBeVisible()
    expect(await readChromeStorage(context, 'currentVaultId')).toBe(
      originalVaultId
    )
    expect(context.pages().length).toBe(openTabs + 1)
    await expect(importPage.getByTestId('import-vault-form')).toBeVisible()
    await capture(popup, `wallet-reopen-${attempt + 1}`)
    await popup.close()

    // This exercises Chrome's real action popup, which Playwright does not
    // expose as a Page. The open import tab can inspect its same-origin view.
    await importPage.evaluate(() => chrome.action.openPopup())
    await expect
      .poll(() =>
        importPage.evaluate(() =>
          chrome.extension.getViews({ type: 'popup' }).map(view => ({
            wallet: !!view.document.querySelector('[data-testid="vault-page"]'),
            import: !!view.document.querySelector(
              '[data-testid="import-vault-form"]'
            ),
          }))
        )
      )
      .toEqual([{ wallet: true, import: false }])
    expect(context.pages().length).toBe(openTabs)

    if (attempt === 2 && process.env.NATIVE_POPUP_QA_HOLD_DIR) {
      const directory = process.env.NATIVE_POPUP_QA_HOLD_DIR
      await mkdir(directory, { recursive: true })
      await writeFile(join(directory, 'ready'), 'Native wallet popup open')
      await expect
        .poll(
          async () => {
            try {
              await access(join(directory, 'release'))
              return true
            } catch {
              return false
            }
          },
          { timeout: 60_000 }
        )
        .toBe(true)
    }
    await importPage.evaluate(() => {
      chrome.extension.getViews({ type: 'popup' }).forEach(view => view.close())
    })
  }

  await capture(importPage, 'unfinished-import')
  await completeImport(importPage, second)
  await expect
    .poll(
      async () =>
        (await readChromeStorage<unknown[]>(context, 'vaults'))?.length
    )
    .toBe(2)
  await importPage.reload()
  await expect(importPage.getByTestId('vault-page')).toBeVisible()
  await capture(importPage, 'completed-original-import')
})

test('legacy Import and Setup reopen home, explicit Setup still expands', async ({
  context,
  extensionId,
}) => {
  const { vault, vaultId } = await createSeededVault({
    name: 'Existing QA Vault',
  })
  await writeChromeStorageMultiple(context, {
    vaults: [vault],
    currentVaultId: vaultId,
    vaultsCoins: { [vaultId]: [] },
    hasFinishedOnboarding: true,
    hasSeenNotificationPrompt: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
  })

  for (const id of ['importVault', 'setupVault']) {
    await writeChromeStorageMultiple(context, {
      persistedView: { id, state: {} },
    })
    const popup = await openPopupPage(context, extensionId)
    await expect(popup.getByTestId('vault-page')).toBeVisible()
    await capture(popup, `legacy-${id}-home`)
    await popup.close()
  }

  await writeChromeStorageMultiple(context, {
    persistedView: { id: 'settings' },
  })
  const settings = await openPopupPage(context, extensionId)
  await expect(
    settings.getByText('Settings', { exact: true }).first()
  ).toBeVisible()
  await settings.close()

  await writeChromeSessionStorage(context, 'initialView', { id: 'newVault' })
  const launcher = await openPopupPage(context, extensionId)
  const expandedPage = context.waitForEvent('page')
  await launcher.getByTestId('new-vault-create').click()
  const setup = await expandedPage
  await expect(
    setup.getByRole('button', { name: 'Get started', exact: true })
  ).toBeVisible()
  await expect
    .poll(() => readChromeStorage(context, 'persistedView'))
    .toBeUndefined()
  const popup = await openPopupPage(context, extensionId)
  await expect(popup.getByTestId('vault-page')).toBeVisible()
  await expect(
    setup.getByRole('button', { name: 'Get started', exact: true })
  ).toBeVisible()
  await capture(setup, 'explicit-setup-tab')
  await capture(popup, 'wallet-during-setup')
})
