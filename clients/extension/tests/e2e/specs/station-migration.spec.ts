import { expect, test } from '../fixtures/extension-loader'

const stationPassword = 'station-test-password'
const popupPath = 'index.html?view=popup'

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

const createStationFixture = async () => {
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

  const wallets: LegacyWalletFixture[] = [
    {
      name: 'QA Mnemonic Wallet',
      encryptedMnemonic,
      encryptedSeed,
      index: 0,
    },
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
    keys,
    wallets,
  }
}

const getManifestName = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    fetch(chrome.runtime.getURL('manifest.json'))
      .then(response => response.json())
      .then(manifest => manifest.name as string)
  )

const seedLegacyStorage = async (page: import('@playwright/test').Page) => {
  const fixture = await createStationFixture()

  await page.evaluate(async legacyFixture => {
    localStorage.clear()
    localStorage.setItem('wallets', JSON.stringify(legacyFixture.wallets))
    localStorage.setItem('keys', JSON.stringify(legacyFixture.keys))
    localStorage.setItem('passwordChallenge', legacyFixture.encryptedUnlockProbe)
    await chrome.storage.local.clear()
  }, fixture)
}

const openStationMigrationWithFixture = async ({
  context,
  extensionId,
  page,
}: {
  context: import('@playwright/test').BrowserContext
  extensionId: string
  page: import('@playwright/test').Page
}) => {
  await page.goto(`chrome-extension://${extensionId}/${popupPath}`)

  const manifestName = await getManifestName(page)
  test.skip(manifestName !== 'Station Wallet', 'Station-only migration UI')

  await seedLegacyStorage(page)
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

test.describe('Station legacy migration', () => {
  test('checks realistic legacy wallets and routes ready wallets into setup', async ({
    context,
    extensionId,
  }, testInfo) => {
    const popupPage = await context.newPage()
    await popupPage.setViewportSize({ width: 480, height: 600 })
    const page = await openStationMigrationWithFixture({
      context,
      extensionId,
      page: popupPage,
    })
    await page.setViewportSize({ width: 480, height: 720 })

    await expect(page.getByTestId('station-migration-summary')).toContainText(
      '11'
    )
    await expect(page.getByText('QA Mnemonic Wallet')).toBeVisible()
    await expect(page.getByText('QA Ledger Account')).toBeVisible()
    await expect(page.getByText('QA Multisig Account')).toBeVisible()
    await expect(page.getByText('QA Corrupt Seed')).toBeVisible()
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
    await expect(page.getByText('Ready').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Migrate' }).first()
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

    await page.getByText('QA Mnemonic Wallet').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Migrate' }).first().click()
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

  test('keeps migration hidden in the default Vultisig build', async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/${popupPath}`)

    const manifestName = await getManifestName(popupPage)
    test.skip(manifestName === 'Station Wallet', 'Default-brand guard')

    await seedLegacyStorage(popupPage)
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
