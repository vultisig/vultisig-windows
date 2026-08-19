import { expect, test } from '../fixtures/extension-loader'
import {
  readChromeStorage,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'
import { createMockFastVault, generateVaultId } from '../helpers/vault-factory'

test('adopts versionless retained vault storage without deleting it', async ({
  context,
  extensionId,
}) => {
  const vault = {
    ...createMockFastVault('Retained unbacked vault'),
    isBackedUp: false,
  }
  const currentVaultId = generateVaultId(vault)

  await writeChromeStorageMultiple(context, {
    vaults: [vault],
    currentVaultId,
    vaultsCoins: {},
    retainedPreference: 'keep',
  })

  const page = await context.newPage()
  await page.goto(`chrome-extension://${extensionId}/index.html`)
  const extensionVersion = await page.evaluate(
    () => chrome.runtime.getManifest().version
  )

  await expect
    .poll(() => readChromeStorage(context, 'latestInstalledVersion'))
    .toBe(extensionVersion)

  await expect(readChromeStorage(context, 'vaults')).resolves.toEqual([vault])
  await expect(readChromeStorage(context, 'retainedPreference')).resolves.toBe(
    'keep'
  )

  await page.close()
})
