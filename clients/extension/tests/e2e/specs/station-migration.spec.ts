import type { BrowserContext, Locator, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'

const stationPassword = 'station-test-password'
const popupPath = 'index.html?view=popup'
const expectedMnemonicTerraAddress =
  'terra1amdttz2937a3dytmxmkany53pp6ma6dy4vsllv'
const expectedMnemonicPublicKeyHex =
  '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044'
const fastVaultPassword = 'StationFastVault123!'

type LegacyWalletFixture = Record<string, unknown>

const toHex = (bytes: Uint8Array) =>
  [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

const encryptStationSecret = async ({
  message,
  password = stationPassword,
}: {
  message: string
  password?: string
}) => {
  const salt = Uint8Array.from({ length: 16 }, (_, index) => index + 1)
  const iv = Uint8Array.from({ length: 16 }, (_, index) => index + 17)
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 20_000 },
    passwordKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  )
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    new TextEncoder().encode(`STATION:${message}`)
  )

  return `${toHex(salt)}${toHex(iv)}${toBase64(new Uint8Array(encrypted))}`
}

const createStationFixture = async ({
  includeFullReviewRows = true,
}: { includeFullReviewRows?: boolean } = {}) => {
  const mnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const seedHex = toHex(
    Uint8Array.from({ length: 64 }, (_, index) => index + 1)
  )
  const privateKeyHex = toHex(
    Uint8Array.from({ length: 32 }, (_, index) => index + 1)
  )
  const alternatePrivateKeyHex = toHex(
    Uint8Array.from({ length: 32 }, (_, index) => index + 17)
  )
  const encryptedMnemonic = await encryptStationSecret({ message: mnemonic })
  const encryptedSeed = await encryptStationSecret({ message: seedHex })
  const encryptedPrivateKey = await encryptStationSecret({
    message: privateKeyHex,
  })
  const encryptedAlternatePrivateKey = await encryptStationSecret({
    message: alternatePrivateKeyHex,
  })
  const encryptedLegacyWallet = await encryptStationSecret({
    message: JSON.stringify({ privateKey: privateKeyHex }),
  })

  const mnemonicWallet: LegacyWalletFixture = {
    name: 'QA Mnemonic Wallet',
    encryptedMnemonic,
    encryptedSeed,
    index: 0,
    address: expectedMnemonicTerraAddress,
    pubkey: {
      '330': Buffer.from(expectedMnemonicPublicKeyHex, 'hex').toString(
        'base64'
      ),
    },
  }
  const realTerraLedgerWallet: LegacyWalletFixture = {
    name: 'QA Real Terra Ledger',
    ledger: true,
    address: 'terra1jgpxyjazrhqd70n5ftkfs970r5j5kh4703entd',
    addresses: {
      'mars-1': 'mars1jgpxyjazrhqd70n5ftkfs970r5j5kh475g62uk',
      'phoenix-1': 'terra1jgpxyjazrhqd70n5ftkfs970r5j5kh4703entd',
    },
    network: 'mainnet',
    pubkey: {
      '330': 'AwJz0UAWqWO9VHE8T1jJFzsYifcF8is2Oi9qyy5gtU97',
    },
  }
  const wallets: LegacyWalletFixture[] = includeFullReviewRows
    ? [
        mnemonicWallet,
        {
          name: 'QA Seed Only',
          encryptedSeed,
          index: 1,
        },
        {
          name: 'QA Raw Private Key',
          encrypted: encryptedPrivateKey,
        },
        {
          name: 'QA Interchain Key',
          encrypted: {
            '330': encryptedPrivateKey,
            '118': encryptedPrivateKey,
          },
        },
        {
          name: 'QA Split Interchain',
          encrypted: {
            '330': encryptedPrivateKey,
            '118': encryptedAlternatePrivateKey,
          },
        },
        {
          name: 'QA Metadata Mismatch',
          encrypted: encryptedPrivateKey,
          address: 'terra1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnyw93e',
        },
        {
          name: 'QA Ledger Account',
          ledger: true,
          address: 'terra1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnyw93e',
        },
        realTerraLedgerWallet,
        {
          name: 'QA Multisig Account',
          multisig: true,
          pubkeys: ['A'.repeat(44), 'B'.repeat(44)],
          threshold: 2,
        },
        {
          name: 'QA Corrupt Seed',
          encryptedSeed: 123,
        },
      ]
    : [mnemonicWallet, realTerraLedgerWallet]
  const keys: LegacyWalletFixture[] = [
    {
      name: 'QA Legacy Private Key',
      wallet: encryptedLegacyWallet,
    },
    {
      name: 'QA Unknown Shape',
      somethingStationNoLongerUnderstands: true,
    },
  ]

  return {
    encryptedUnlockProbe: await encryptStationSecret({ message: 'station-ok' }),
    keys: includeFullReviewRows ? keys : [],
    wallets,
  }
}

const getManifestName = (page: import('@playwright/test').Page) =>
  page.evaluate(async () => {
    const manifest = await fetch(chrome.runtime.getURL('manifest.json')).then(
      response => response.json()
    )

    if (
      typeof manifest === 'object' &&
      manifest !== null &&
      !Array.isArray(manifest) &&
      'name' in manifest &&
      typeof manifest.name === 'string'
    ) {
      return manifest.name
    }

    return ''
  })

const seedLegacyStorage = async ({
  fixture,
  page,
}: {
  fixture?: Awaited<ReturnType<typeof createStationFixture>>
  page: import('@playwright/test').Page
}) => {
  const legacyFixture = fixture ?? (await createStationFixture())
  await page.evaluate(async legacyFixture => {
    localStorage.clear()
    localStorage.setItem('wallets', JSON.stringify(legacyFixture.wallets))
    localStorage.setItem('keys', JSON.stringify(legacyFixture.keys))
    localStorage.setItem(
      'passwordChallenge',
      legacyFixture.encryptedUnlockProbe
    )
    await chrome.storage.local.clear()
  }, legacyFixture)
}

const openStationMigrationWithFixture = async ({
  context,
  extensionId,
  fixture,
  page,
}: {
  context: import('@playwright/test').BrowserContext
  extensionId: string
  fixture?: Awaited<ReturnType<typeof createStationFixture>>
  page: import('@playwright/test').Page
}) => {
  await page.goto(`chrome-extension://${extensionId}/${popupPath}`)

  const manifestName = await getManifestName(page)
  test.skip(manifestName !== 'Station Wallet', 'Station-only migration UI')

  await seedLegacyStorage({ fixture, page })
  await page.goto(`chrome-extension://${extensionId}/${popupPath}`)

  const skipButton = page.getByRole('button', { name: 'Skip' })
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click()
  }

  const expandedPagePromise = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Next' }).click()
  const expandedPage = await expandedPagePromise
  await expandedPage.waitForLoadState('domcontentloaded')
  await expect(expandedPage.locator('body')).toContainText(
    'Review old Station wallets'
  )

  return expandedPage
}

const openSetupFromPopup = async ({
  context,
  page,
}: {
  context: import('@playwright/test').BrowserContext
  page: import('@playwright/test').Page
}) => {
  const skipButton = page.getByRole('button', { name: 'Skip' })
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click()
  }

  const expandedPagePromise = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Next' }).click()
  const expandedPage = await expandedPagePromise
  await expandedPage.waitForLoadState('domcontentloaded')

  return expandedPage
}

const expectNoHorizontalOverflow = async (
  page: import('@playwright/test').Page
) => {
  const overflowingElements = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body *'))
      .map(element => {
        const rect = element.getBoundingClientRect()
        return {
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 80),
          left: rect.left,
          right: rect.right,
          width: rect.width,
        }
      })
      .filter(
        ({ left, right, width }) =>
          width > 1 &&
          (left < -1 || right > document.documentElement.clientWidth + 1)
      )
  )

  expect(overflowingElements).toEqual([])
}

const fillFastVaultSetup = async ({
  context,
  email,
  name,
  page,
}: {
  context: BrowserContext
  email: string
  name: string
  page: Page
}) => {
  const findActiveSetupPage = async () => {
    for (const candidatePage of [...context.pages()].reverse()) {
      if (candidatePage.isClosed()) {
        continue
      }

      const showsSetup = await candidatePage
        .getByText('Your vault setup')
        .isVisible()
        .catch(() => false)
      const showsGetStarted = await candidatePage
        .getByRole('button', { name: 'Get Started' })
        .first()
        .isVisible()
        .catch(() => false)

      if (showsSetup || showsGetStarted) {
        return candidatePage
      }
    }

    return page
  }

  let activePage = await findActiveSetupPage()

  type PageAdvanceResult =
    | {
        type: 'opened'
        page: Page
      }
    | {
        type: 'same'
      }

  const clickAndUsePageWith = async ({
    click,
    expected,
    timeout = 15_000,
  }: {
    click: () => Promise<void>
    expected: (page: Page) => Locator
    timeout?: number
  }) => {
    const previousPage = activePage
    const openedPagePromise: Promise<PageAdvanceResult> = context
      .waitForEvent('page', { timeout })
      .then(openedPage => ({
        type: 'opened',
        page: openedPage,
      }))

    await click()

    const samePagePromise: Promise<PageAdvanceResult> = expected(previousPage)
      .waitFor({ state: 'visible', timeout })
      .then(() => ({
        type: 'same',
      }))
    const result = await Promise.race([openedPagePromise, samePagePromise])

    if (result.type === 'same') {
      return
    }

    await result.page.waitForLoadState('domcontentloaded')
    activePage = result.page
    await expect(expected(activePage)).toBeVisible({ timeout })
    await previousPage.close().catch(() => undefined)
  }

  const clickGetStarted = async (expected: (page: Page) => Locator) => {
    const button = activePage
      .getByRole('button', { name: 'Get Started' })
      .first()
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    await clickAndUsePageWith({
      click: () => button.click(),
      expected,
    })
  }

  const isOnVaultSetupOverview = await activePage
    .getByText('Your vault setup')
    .isVisible()
    .catch(() => false)

  if (!isOnVaultSetupOverview) {
    await clickGetStarted(nextPage => nextPage.getByText('Your vault setup'))
  }

  await clickGetStarted(nextPage =>
    nextPage
      .getByTestId('vault-name-input')
      .or(nextPage.getByRole('button', { name: 'Continue' }))
  )

  const continueButton = activePage.getByRole('button', { name: 'Continue' })
  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click()
  }

  await activePage.getByTestId('vault-name-input').fill(name)
  await activePage.getByTestId('vault-name-next').click()
  await activePage.getByTestId('vault-email-input').fill(email)
  await activePage.getByTestId('vault-email-next').click()
  await activePage.getByTestId('vault-password-input').fill(fastVaultPassword)
  await activePage.getByTestId('vault-password-confirm').fill(fastVaultPassword)
  await clickAndUsePageWith({
    click: () => activePage.getByTestId('create-vault-button').click(),
    expected: nextPage =>
      nextPage
        .getByText(
          /Connecting (to|with) server|Backups, your new recovery method|Failed to connect with server/
        )
        .first(),
    timeout: 60_000,
  })

  return activePage
}

const waitForMigratedMnemonicVault = async ({
  name,
  page,
}: {
  name: string
  page: import('@playwright/test').Page
}) =>
  page.waitForFunction(
    ({ expectedAddress, expectedPublicKey, walletName }) => {
      return chrome.storage.local
        .get([
          'currentVaultId',
          'vaults',
          'vaultsCoins',
          'stationLegacyMigrationStatus',
        ])
        .then(storage => {
          const vaults = Array.isArray(storage.vaults) ? storage.vaults : []
          const statusRecords =
            typeof storage.stationLegacyMigrationStatus === 'object' &&
            storage.stationLegacyMigrationStatus !== null
              ? Object.values(
                  storage.stationLegacyMigrationStatus as Record<
                    string,
                    Record<string, unknown>
                  >
                )
              : []
          const migrationStatus = statusRecords.find(
            record =>
              record.walletName === 'QA Mnemonic Wallet' &&
              record.status === 'migrated' &&
              typeof record.vaultId === 'string'
          )
          if (!migrationStatus) return false
          if (storage.currentVaultId !== migrationStatus.vaultId) return false

          const vault = vaults.find(
            (candidate: Record<string, unknown>) =>
              candidate.name === walletName &&
              typeof candidate.chainPublicKeys === 'object' &&
              candidate.chainPublicKeys !== null &&
              (candidate.chainPublicKeys as Record<string, string>).Terra ===
                expectedPublicKey &&
              (candidate.chainPublicKeys as Record<string, string>)
                .TerraClassic === expectedPublicKey &&
              ['Terra', 'TerraClassic'].every(chain =>
                (
                  (candidate as { stationKeyImportRootChains?: unknown })
                    .stationKeyImportRootChains as unknown[]
                )?.includes(chain)
              )
          ) as Record<string, unknown> | undefined
          if (!vault) return false

          const vaultCoins =
            typeof storage.vaultsCoins === 'object' &&
            storage.vaultsCoins !== null
              ? (
                  storage.vaultsCoins as Record<
                    string,
                    Array<Record<string, unknown>>
                  >
                )[migrationStatus.vaultId as string]
              : undefined
          return (
            Array.isArray(vaultCoins) &&
            vaultCoins.some(
              coin => coin.chain === 'Terra' && coin.address === expectedAddress
            ) &&
            vaultCoins.some(
              coin =>
                coin.chain === 'TerraClassic' &&
                coin.address === expectedAddress
            )
          )
        })
    },
    {
      expectedAddress: expectedMnemonicTerraAddress,
      expectedPublicKey: expectedMnemonicPublicKeyHex,
      walletName: name,
    },
    { timeout: 180_000 }
  )

test.describe('Station legacy migration', () => {
  test('checks realistic legacy wallets and routes ready wallets into setup', async ({
    context,
    extensionId,
  }, testInfo) => {
    const popupPage = await context.newPage()
    await popupPage.setViewportSize({ width: 480, height: 600 })
    const fixture = await createStationFixture({ includeFullReviewRows: true })
    const page = await openStationMigrationWithFixture({
      context,
      extensionId,
      fixture,
      page: popupPage,
    })
    await page.setViewportSize({ width: 480, height: 720 })

    await expect(page.getByTestId('station-migration-summary')).toContainText(
      '12'
    )
    await expect(page.getByTestId('station-migration-summary')).toContainText(
      '7'
    )
    await expect(page.getByTestId('station-migration-summary')).toContainText(
      '5'
    )
    await expect(page.getByText('QA Mnemonic Wallet')).toBeVisible()
    await expect(page.getByText('QA Ledger Account')).toBeVisible()
    await expect(page.getByText('QA Real Terra Ledger')).toBeVisible()
    await expect(page.getByText('QA Multisig Account')).toBeVisible()
    await expect(page.getByText('QA Corrupt Seed')).toBeVisible()
    await expect(page.getByText('Reconnect')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Connect Ledger' })
    ).toHaveCount(0)
    const ledgerWallet = page
      .getByTestId('station-migration-wallet-item')
      .filter({ has: page.getByText('QA Real Terra Ledger') })
    await expect(ledgerWallet.getByText('Unsupported')).toBeVisible()
    await expect(
      ledgerWallet.getByText(
        'Station only stores public Ledger metadata. It does not store private keys that can be converted into a Station vault.'
      )
    ).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page
      .locator('input[type="password"], input[type="text"]')
      .first()
      .fill('wrong-password')
    await page.getByRole('button', { name: 'Check wallets' }).click()
    await expect(
      page.getByText(
        'That password did not unlock any supported Station wallet.'
      )
    ).toBeVisible()
    await expect(page.getByText('QA Mnemonic Wallet')).toBeVisible()
    await expect(page.getByText('Failed').first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await page.screenshot({
      path: testInfo.outputPath('station-migration-wrong-password.png'),
      animations: 'disabled',
    })

    await page
      .locator('input[type="password"], input[type="text"]')
      .first()
      .fill(stationPassword)
    await page.getByRole('button', { name: 'Check wallets' }).click()
    const mnemonicWallet = page
      .getByTestId('station-migration-wallet-item')
      .filter({ has: page.getByText('QA Mnemonic Wallet') })

    await expect(mnemonicWallet.getByText('Ready')).toBeVisible()
    await expect(
      mnemonicWallet.getByRole('button', { name: 'Migrate' })
    ).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await page.screenshot({
      path: testInfo.outputPath('station-migration-ready-top.png'),
      animations: 'disabled',
    })

    await page.getByText('QA Metadata Mismatch').scrollIntoViewIfNeeded()
    await expect(page.getByText('QA Metadata Mismatch')).toBeVisible()
    await expect(
      page.getByText(
        'The decrypted key does not match the old Station address or public key.'
      )
    ).toBeVisible()
    await page.getByText('QA Split Interchain').scrollIntoViewIfNeeded()
    await expect(
      page.getByText(
        'This wallet has separate Terra and Terra Classic private keys.'
      )
    ).toBeVisible()

    await page
      .getByTestId('station-migration-wallet-list')
      .scrollIntoViewIfNeeded()
    await page.mouse.wheel(0, 900)
    await expect(page.getByText('QA Legacy Private Key')).toBeVisible()
    await expect(page.getByText('QA Unknown Shape')).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await page.screenshot({
      path: testInfo.outputPath('station-migration-ready-bottom.png'),
      animations: 'disabled',
    })

    await mnemonicWallet.scrollIntoViewIfNeeded()
    await mnemonicWallet.getByRole('button', { name: 'Migrate' }).click()
    await expect(
      page.getByRole('button', { name: 'Get Started' })
    ).toBeVisible()
    const migrationStatus = await page.evaluate(() =>
      chrome.storage.local.get('stationLegacyMigrationStatus')
    )
    expect(migrationStatus.stationLegacyMigrationStatus).toMatchObject({
      'wallets:0': {
        status: 'importing',
        walletName: 'QA Mnemonic Wallet',
        source: 'mnemonic',
      },
    })
    await expect(page.locator('body')).not.toContainText(
      'Review old Station wallets'
    )

    await page.close()
  })

  test('creates a Fast Vault from a Station software wallet and preserves its Terra address', async ({
    context,
    extensionId,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'network',
      'full vault creation uses the Fast Vault server'
    )
    test.setTimeout(240_000)

    const popupPage = await context.newPage()
    await popupPage.setViewportSize({ width: 480, height: 600 })
    const fixture = await createStationFixture({ includeFullReviewRows: false })
    const page = await openStationMigrationWithFixture({
      context,
      extensionId,
      fixture,
      page: popupPage,
    })
    await page.setViewportSize({ width: 480, height: 720 })

    await page
      .locator('input[type="password"], input[type="text"]')
      .first()
      .fill(stationPassword)
    await page.getByRole('button', { name: 'Check wallets' }).click()

    const mnemonicWallet = page
      .getByTestId('station-migration-wallet-item')
      .filter({ has: page.getByText('QA Mnemonic Wallet') })
    await expect(mnemonicWallet.getByText('Ready')).toBeVisible()
    await mnemonicWallet.getByRole('button', { name: 'Migrate' }).click()

    const vaultName = `Station QA ${Date.now()}`
    const setupPage = await fillFastVaultSetup({
      context,
      email: `station-migration-${Date.now()}@example.com`,
      name: vaultName,
      page,
    })
    await waitForMigratedMnemonicVault({ name: vaultName, page: setupPage })
    await expect(setupPage.locator('body')).not.toContainText(
      /Connecting (to|with) server/,
      { timeout: 60_000 }
    )
    await expect(setupPage.locator('body')).not.toContainText(
      'Failed to connect with server'
    )
    await expect(setupPage.locator('body')).toContainText(
      'Backups, your new recovery method',
      { timeout: 60_000 }
    )
    await expect(setupPage.locator('body')).not.toContainText(
      'Failed to connect with server'
    )

    await setupPage.screenshot({
      path: testInfo.outputPath(
        'station-migration-fast-vault-created-backup-step.png'
      ),
      animations: 'disabled',
    })

    await setupPage.close()
    await page.close()
  })

  test('keeps migration hidden in the default Vultisig build', async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/${popupPath}`)

    const manifestName = await getManifestName(popupPage)
    test.skip(manifestName === 'Station Wallet', 'Default-brand guard')

    await seedLegacyStorage({ page: popupPage })
    await popupPage.goto(`chrome-extension://${extensionId}/${popupPath}`)

    const setupPage = await openSetupFromPopup({
      context,
      page: popupPage,
    })

    await expect(setupPage.locator('body')).not.toContainText(
      'Review old Station wallets'
    )
    await expect(
      setupPage.getByRole('button', { name: 'Get Started' })
    ).toBeVisible()

    await setupPage.close()
    await popupPage.close()
  })
})
