import { create, toBinary } from '@bufbuild/protobuf'
import { toCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultContainerSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { expect, test } from './fixtures/extension.fixture'
import { generateVaultKeyshares } from './helpers/seeded-vault'

test.describe.configure({ mode: 'serial' })

const createRecoveryBackup = async () => {
  const { ecdsa, eddsa } = await generateVaultKeyshares()
  const vault: Vault = {
    name: 'Recovered vault',
    publicKeys: { ecdsa: ecdsa.publicKey, eddsa: eddsa.publicKey },
    signers: ['device-1', 'device-2'],
    localPartyId: 'device-1',
    hexChainCode: ecdsa.chainCode,
    keyShares: { ecdsa: ecdsa.keyshare, eddsa: eddsa.keyshare },
    libType: 'DKLS',
    isBackedUp: true,
    order: 0,
  }
  const vaultData = toBinary(VaultSchema, toCommVault(vault))
  const container = create(VaultContainerSchema, {
    version: 1n,
    vault: Buffer.from(vaultData).toString('base64'),
    isEncrypted: false,
  })

  return {
    vault,
    file: Buffer.from(
      Buffer.from(toBinary(VaultContainerSchema, container)).toString('base64')
    ),
  }
}

test('unreadable shares fail closed and route to backup import', async ({
  extensionPage,
}) => {
  const vaultId = '03'.repeat(33)
  const malformedShare = 'not-a-valid-keyshare'

  await extensionPage.evaluate(
    async ({ unreadableShare, currentVaultId }) => {
      await chrome.storage.local.set({
        currentVaultId,
        hasFinishedOnboarding: true,
        latestInstalledVersion: chrome.runtime.getManifest().version,
        latestMigration: 'removeDuplicateCoins',
        language: 'en',
        passcodeEncryption: null,
        vaults: [
          {
            name: 'Ciphertext must not render',
            publicKeys: {
              ecdsa: currentVaultId,
              eddsa: '04'.repeat(32),
            },
            signers: ['device-1', 'device-2'],
            localPartyId: 'device-1',
            hexChainCode: '00'.repeat(32),
            keyShares: {
              ecdsa: unreadableShare,
              eddsa: unreadableShare,
            },
            libType: 'DKLS',
            isBackedUp: false,
            order: 0,
          },
        ],
      })
    },
    { unreadableShare: malformedShare, currentVaultId: vaultId }
  )

  await extensionPage.reload()
  await extensionPage.setViewportSize({ width: 480, height: 600 })

  await expect(
    extensionPage.getByText("This vault can't be opened on this device").first()
  ).toBeVisible()
  await expect(
    extensionPage.getByText(
      'Its key shares are encrypted, and the key that unlocks them did not come across with this restore. Nothing on this device can read them, so it cannot sign with this vault. Your .vult backup is the way back. Import it and this vault works again.'
    )
  ).toBeVisible()
  await expect(
    extensionPage.getByText('Ciphertext must not render')
  ).not.toBeVisible()

  const importButton = extensionPage.getByRole('button', {
    name: 'Import .vult backup',
  })
  const importButtonBox = await importButton.boundingBox()
  expect(importButtonBox).not.toBeNull()
  expect(
    (importButtonBox?.y ?? Infinity) + (importButtonBox?.height ?? 0)
  ).toBeLessThanOrEqual(600)

  const screenshotPath = process.env.QA_SCREENSHOT_PATH
  if (screenshotPath) {
    await extensionPage.screenshot({ path: screenshotPath })
  }

  const noBackupButton = extensionPage.getByRole('button', {
    name: "I don't have a backup",
  })
  await noBackupButton.click()
  await expect(
    extensionPage.getByText(
      'Without a .vult backup, the key shares on this device cannot be unlocked again — that part is not recoverable. The vault itself may still be: if your other devices hold their own shares and still reach its signing threshold, it keeps working without this one.'
    )
  ).toBeVisible()

  const noBackupScreenshotPath = process.env.QA_NO_BACKUP_SCREENSHOT_PATH
  if (noBackupScreenshotPath) {
    await extensionPage.screenshot({ path: noBackupScreenshotPath })
  }

  await importButton.click()
  await expect(
    extensionPage.locator('[data-testid="import-vault-form"]')
  ).toBeVisible()
})

test('a valid recovery backup replaces the exact unreadable vault', async ({
  extensionPage,
}) => {
  const { vault, file } = await createRecoveryBackup()
  const vaultId = vault.publicKeys.ecdsa
  const malformedShare = 'not-a-valid-keyshare'

  await extensionPage.evaluate(
    async ({ unreadableShare, currentVaultId, publicKeys, hexChainCode }) => {
      await chrome.storage.local.set({
        currentVaultId,
        hasFinishedOnboarding: true,
        latestInstalledVersion: chrome.runtime.getManifest().version,
        latestMigration: 'removeDuplicateCoins',
        language: 'en',
        passcodeEncryption: null,
        vaults: [
          {
            name: 'Unreadable vault',
            publicKeys,
            signers: ['device-1', 'device-2'],
            localPartyId: 'device-1',
            hexChainCode,
            keyShares: {
              ecdsa: unreadableShare,
              eddsa: unreadableShare,
            },
            libType: 'DKLS',
            isBackedUp: false,
            order: 0,
          },
        ],
      })
    },
    {
      unreadableShare: malformedShare,
      currentVaultId: vaultId,
      publicKeys: vault.publicKeys,
      hexChainCode: vault.hexChainCode,
    }
  )

  await extensionPage.reload()
  await extensionPage
    .getByRole('button', { name: 'Import .vult backup' })
    .click()

  const fileInput = extensionPage.locator('input[type="file"]')
  await expect(fileInput).toBeAttached()
  await fileInput.setInputFiles({
    name: 'Recovered-share1of2.vult',
    mimeType: 'application/octet-stream',
    buffer: file,
  })
  await extensionPage.getByTestId('import-continue').click()

  await expect
    .poll(() =>
      extensionPage.evaluate(async expectedVaultId => {
        const { vaults } = await chrome.storage.local.get('vaults')
        const recovered = (vaults as Vault[]).find(
          candidate => candidate.publicKeys.ecdsa === expectedVaultId
        )

        return recovered
          ? {
              isBackedUp: recovered.isBackedUp,
              name: recovered.name,
            }
          : null
      }, vaultId)
    )
    .toEqual({ isBackedUp: true, name: 'Recovered vault' })
})
