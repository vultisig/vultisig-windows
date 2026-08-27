import { mkdir, writeFile } from 'node:fs/promises'
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
        name: 'Main Vault',
        publicKeys: {
          ecdsa: fixturePublicKey,
          eddsa: '0'.repeat(64),
        },
        signers: ['local-device'],
        createdAt: Date.now(),
        hexChainCode: '0'.repeat(64),
        keyShares: { ecdsa: '', eddsa: '' },
        localPartyId: 'local-device',
        libType: 'GG20',
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
    dismissedBanners: Object.fromEntries(
      [
        'rujiraStaking',
        'followOnX',
        'vaultBackup',
        'referralCode',
        'buyVultPromo',
        'kamino',
      ].map(id => [id, { dismissedAt: Date.now() }])
    ),
  })
}

test('extension vault matches the Figma home shell', async ({
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

  const header = page.getByTestId('vault-page-header')
  const dappsIcon = page.getByTestId('dapps-button').locator('img').first()
  const secureVaultIcon = page
    .getByTestId('vault-selector-page-header')
    .locator('svg')
    .first()
  const balanceActions = page.getByTestId('vault-overview-balance-wrapper')
  const banner = page.getByTestId('migrate-promo-banner')
  const portfolio = page.getByTestId('vault-portfolio')
  const navigation = page.getByTestId('bottom-navigation')
  const tabs = page.getByTestId('bottom-navigation-tabs')
  const walletTab = tabs.getByText('Wallet', { exact: true }).locator('..')
  const earnTab = tabs.getByText('Earn', { exact: true }).locator('..')
  const scan = page.getByTestId('bottom-navigation-scan')

  await expect(header).toBeVisible()
  await expect(balanceActions).toBeVisible()
  await expect(banner).toBeVisible()
  await expect(portfolio).toBeVisible()
  await expect(page.getByTestId('vault-chain-search-button')).toBeVisible()
  await expect(page.getByTestId('manage-chains-button')).toContainText('Chains')
  await expect(page.getByTestId('balance-value')).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByTestId('VaultChainItem-Panel').first()).toBeVisible({
    timeout: 30_000,
  })
  await expect(navigation).toBeVisible()
  await expect(tabs.getByText('Wallet', { exact: true })).toBeVisible()
  await expect(tabs.getByText('Earn', { exact: true })).toBeVisible()
  await expect(tabs.getByText('Agent', { exact: true })).toBeHidden()
  await expect(tabs.getByText('Card', { exact: true })).toBeHidden()
  await expect(scan).toBeVisible()
  await page.waitForTimeout(250)

  const [
    headerBox,
    dappsIconBox,
    secureVaultIconBox,
    balanceActionsBox,
    bannerBox,
    portfolioBox,
    navigationBox,
    walletTabBox,
    earnTabBox,
    scanBox,
  ] = await Promise.all([
    header.boundingBox(),
    dappsIcon.boundingBox(),
    secureVaultIcon.boundingBox(),
    balanceActions.boundingBox(),
    banner.boundingBox(),
    portfolio.boundingBox(),
    navigation.boundingBox(),
    walletTab.boundingBox(),
    earnTab.boundingBox(),
    scan.boundingBox(),
  ])
  const balanceActionsComputedStyle = await balanceActions.evaluate(element => {
    const style = window.getComputedStyle(element)

    return {
      boxSizing: style.boxSizing,
      flexShrink: style.flexShrink,
      height: style.height,
      transform: style.transform,
    }
  })

  const artifactDirectory = process.env.EXTENSION_NAV_QA_ARTIFACT_DIR
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true })
    await writeFile(
      join(artifactDirectory, 'extension-home-geometry.json'),
      JSON.stringify(
        {
          header: headerBox,
          dappsIcon: dappsIconBox,
          secureVaultIcon: secureVaultIconBox,
          balanceActions: balanceActionsBox,
          balanceActionsComputedStyle,
          upgradeBanner: bannerBox,
          portfolio: portfolioBox,
          bottomNavigation: navigationBox,
          walletTab: walletTabBox,
          earnTab: earnTabBox,
          scan: scanBox,
        },
        null,
        2
      )
    )
    await header.screenshot({
      path: join(artifactDirectory, 'extension-home-header.png'),
    })
    await balanceActions.screenshot({
      path: join(artifactDirectory, 'extension-home-balance-actions.png'),
    })
    await banner.screenshot({
      path: join(artifactDirectory, 'extension-home-upgrade-banner.png'),
    })
    await portfolio.screenshot({
      path: join(artifactDirectory, 'extension-home-portfolio.png'),
    })
    await page.screenshot({
      clip: { x: 0, y: 506, width: 360, height: 144 },
      path: join(artifactDirectory, 'extension-home-bottom-navigation.png'),
    })
    await page.screenshot({
      path: join(artifactDirectory, 'extension-home-full.png'),
    })
  }

  expect(headerBox).toEqual({ x: 0, y: 0, width: 360, height: 56 })
  expect(dappsIconBox).toEqual({ x: 20, y: 12.5, width: 36, height: 36 })
  expect(secureVaultIconBox).toMatchObject({ y: 20, width: 16, height: 16 })
  expect(secureVaultIconBox!.x).toBeCloseTo(121, 0)
  expect(balanceActionsBox).toEqual({ x: 16, y: 88, width: 328, height: 178 })
  expect(bannerBox).toEqual({ x: 16, y: 298, width: 328, height: 81 })
  expect(portfolioBox).toMatchObject({ x: 16, y: 419, width: 328 })
  expect(navigationBox).toEqual({ x: 0, y: 584, width: 360, height: 66 })
  expect(walletTabBox).toEqual({ x: 12, y: 592, width: 168, height: 48 })
  expect(earnTabBox).toEqual({ x: 180, y: 592, width: 168, height: 48 })
  expect(scanBox).toEqual({ x: 152, y: 514, width: 56, height: 56 })
  expect(scanBox!.x + scanBox!.width / 2).toBe(
    navigationBox!.x + navigationBox!.width / 2
  )
  expect(
    scanBox!.x +
      scanBox!.width / 2 -
      (walletTabBox!.x + walletTabBox!.width / 2)
  ).toBe(
    earnTabBox!.x + earnTabBox!.width / 2 - (scanBox!.x + scanBox!.width / 2)
  )
  expect(scanBox!.y + scanBox!.height).toBeLessThan(navigationBox!.y)

  await tabs.getByText('Earn', { exact: true }).click()
  await expect(page.getByTestId('defi-page')).toBeVisible()
  await expect(vaultPage.vaultContainer).toBeHidden()

  await page
    .getByTestId('bottom-navigation-tabs')
    .getByText('Wallet', { exact: true })
    .click()
  await expect(vaultPage.vaultContainer).toBeVisible()
  await expect(page.getByTestId('defi-page')).toBeHidden()

  await page.getByTestId('bottom-navigation-scan').click()
  await expect(vaultPage.vaultContainer).toBeHidden()
  await expect(page.getByText('Keysign', { exact: true })).toBeVisible()
  await page.getByTestId('page-header-back').click()
  await expect(vaultPage.vaultContainer).toBeVisible()

  await writeChromeStorageMultiple(context, { language: 'de' })
  await page.reload()
  await vaultPage.waitForView()

  const localizedBanner = page.getByTestId('migrate-promo-banner')
  const localizedBannerText = page.getByTestId('home-promo-banner-text')
  await expect(localizedBanner).toBeVisible()
  expect(await localizedBanner.boundingBox()).toMatchObject({ height: 81 })
  const localizedTextMetrics = await localizedBannerText.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    children: Array.from(element.children).map(child => {
      const style = window.getComputedStyle(child)

      return {
        overflow: style.overflow,
        textOverflow: style.textOverflow,
        whiteSpace: style.whiteSpace,
      }
    }),
  }))
  expect(localizedTextMetrics.scrollHeight).toBe(
    localizedTextMetrics.clientHeight
  )
  expect(localizedTextMetrics.clientHeight).toBeLessThanOrEqual(41)
  expect(localizedTextMetrics.children).toEqual([
    { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  ])

  expect(pageErrors).toEqual([])
  await page.close()
})
