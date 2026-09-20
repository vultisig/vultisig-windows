import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'
import { VaultPage } from '../page-objects/VaultPage.po'

const fixtureAddress = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'

const seedEarnSearchVault = async (
  context: Parameters<typeof writeChromeStorageMultiple>[0]
) => {
  const { vaultId, vault } = await createSeededVault({
    name: 'Earn Search QA',
    libType: 'KeyImport',
  })

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [vault],
    vaultsCoins: {
      [vaultId]: [
        {
          address: fixtureAddress,
          chain: 'Ripple',
          decimals: 6,
          logo: 'xrp',
          priceProviderId: 'ripple',
          ticker: 'XRP',
        },
      ],
    },
    dismissedBanners: {
      global: Object.fromEntries(
        ['rujiraStaking', 'followOnX', 'buyVultPromo', 'kamino'].map(id => [
          id,
          { dismissedAt: Date.now() },
        ])
      ),
      byVault: {
        [vaultId]: Object.fromEntries(
          ['vaultBackup', 'referralCode'].map(id => [
            id,
            { dismissedAt: Date.now() },
          ])
        ),
      },
    },
  })
}

test.setTimeout(180_000)

test('Earn search shows a visible X and clears on close', async ({
  context,
  extensionId,
}) => {
  await seedEarnSearchVault(context)

  const page = await context.newPage()
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.setViewportSize({ width: 360, height: 650 })

  const vaultPage = new VaultPage(page, extensionId)
  await vaultPage.goto()
  await vaultPage.waitForView()

  await page
    .getByTestId('bottom-navigation-tabs')
    .getByText('Earn', { exact: true })
    .click()

  const defiPage = page.getByTestId('defi-page')
  await expect(defiPage).toBeVisible()

  const searchButton = defiPage.locator(
    'button:has(svg path[d="M13.2005 13.1999L9.62891 9.62825"])'
  )
  await expect(searchButton).toHaveCount(1)
  await searchButton.click()

  const input = defiPage.locator('input[type="text"]')
  const closeButton = defiPage.locator('button:has(svg path[d="M9 15L15 9"])')
  await expect(input).toBeFocused()
  await expect(closeButton).toBeVisible()

  const closeIcon = closeButton.locator('svg')
  const iconPaint = await closeIcon.evaluate(element => {
    const style = window.getComputedStyle(element)
    const background = window.getComputedStyle(element.parentElement!)

    return {
      color: style.color,
      fill: style.fill,
      buttonBackground: background.backgroundColor,
    }
  })
  expect(iconPaint.fill).toBe('none')
  expect(iconPaint.color).not.toBe(iconPaint.buttonBackground)

  const artifactDirectory = process.env.EARN_SEARCH_QA_ARTIFACT_DIR
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true })
    await defiPage.screenshot({
      animations: 'disabled',
      path: join(artifactDirectory, 'earn-search-expanded.png'),
    })
    await closeButton.locator('xpath=..').screenshot({
      animations: 'disabled',
      path: join(artifactDirectory, 'earn-search-field.png'),
    })
  }

  await input.fill('not-a-chain')
  await page.waitForTimeout(300)
  await closeButton.click()

  await expect(defiPage.getByText('Portfolio', { exact: true })).toBeVisible()
  await expect(searchButton).toBeVisible()
  await page.waitForTimeout(350)

  await searchButton.click()
  await expect(input).toHaveValue('')
  await page.waitForTimeout(300)
  await expect(input).toHaveValue('')

  await input.fill('thor')
  await closeButton.click()
  await page.waitForTimeout(350)
  await searchButton.click()
  await expect(input).toHaveValue('')
  await page.waitForTimeout(300)
  await expect(input).toHaveValue('')

  expect(pageErrors).toEqual([])
  await page.close()
})
