import { join } from 'node:path'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { VaultPage } from '../page-objects/VaultPage.po'

const fixturePublicKey =
  '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044'
const fixtureAddress = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'

const seedNavigationVault = async (
  context: Parameters<typeof writeChromeStorageMultiple>[0]
) => {
  await writeChromeStorageMultiple(context, {
    currentVaultId: fixturePublicKey,
    hasFinishedOnboarding: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [
      {
        name: 'Navigation QA Vault',
        publicKeys: {
          ecdsa: fixturePublicKey,
          eddsa: '0'.repeat(64),
        },
        signers: ['local-device'],
        createdAt: Date.now(),
        hexChainCode: '0'.repeat(64),
        keyShares: { ecdsa: '', eddsa: '' },
        localPartyId: 'local-device',
        libType: 'DKLS',
        isBackedUp: true,
        order: 0,
      },
    ],
    vaultsCoins: {
      [fixturePublicKey]: [
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
  })
}

test('extension vault uses the Figma floating-action navigation shell', async ({
  context,
  extensionId,
}) => {
  await seedNavigationVault(context)

  const page = await context.newPage()
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.setViewportSize({ width: 360, height: 650 })

  const vaultPage = new VaultPage(page, extensionId)
  await vaultPage.goto()
  await vaultPage.waitForView()

  const navigation = page.getByTestId('bottom-navigation')
  const tabs = page.getByTestId('bottom-navigation-tabs')
  const scan = page.getByTestId('bottom-navigation-scan')

  await expect(navigation).toBeVisible()
  await expect(tabs.getByText('Wallet', { exact: true })).toBeVisible()
  await expect(tabs.getByText('DeFi', { exact: true })).toBeVisible()
  await expect(tabs.getByText('Agent', { exact: true })).toBeHidden()
  await expect(scan).toBeVisible()

  const [navigationBox, scanBox] = await Promise.all([
    navigation.boundingBox(),
    scan.boundingBox(),
  ])

  expect(navigationBox).toEqual({ x: 0, y: 584, width: 360, height: 66 })
  expect(scanBox).toEqual({ x: 276, y: 514, width: 56, height: 56 })
  expect(scanBox!.y + scanBox!.height).toBeLessThan(navigationBox!.y)

  const artifactDirectory = process.env.EXTENSION_NAV_QA_ARTIFACT_DIR
  if (artifactDirectory) {
    await page.screenshot({
      animations: 'disabled',
      path: join(artifactDirectory, 'extension-navigation-after.png'),
    })
  }

  expect(pageErrors).toEqual([])
  await page.close()
})
