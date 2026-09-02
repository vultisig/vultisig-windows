import '@vultisig/sdk/node'

import { create, toBinary } from '@bufbuild/protobuf'
import { toCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultContainerSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import {
  DklsEngine,
  ensureMpcEngine,
  MpcKeyshare,
  MpcSession,
  SchnorrEngine,
} from '@vultisig/mpc-types'

import { expect, test } from './fixtures/extension.fixture'

test.describe.configure({ mode: 'serial' })

type KeygenEngine = Pick<
  DklsEngine | SchnorrEngine,
  'createKeygenSession' | 'keygenSetup'
>

const createKeyshare = async (engine: KeygenEngine) => {
  const partyIds = ['device-1', 'device-2']
  const setup = engine.keygenSetup(undefined, partyIds.length, partyIds)
  const sessions = new Map<string, MpcSession<MpcKeyshare>>()

  for (const partyId of partyIds) {
    sessions.set(partyId, await engine.createKeygenSession(setup, partyId))
  }

  const completed = new Set<string>()
  for (let round = 0; round < 10 && completed.size < partyIds.length; round++) {
    const messages: { body: Uint8Array; receivers: string[] }[] = []

    sessions.forEach(session => {
      let message = session.outputMessage()
      while (message) {
        messages.push({
          body: message.body,
          receivers: [...message.receivers],
        })
        message = session.outputMessage()
      }
    })

    if (messages.length === 0) {
      throw new Error('MPC fixture keygen stalled')
    }

    messages.forEach(message => {
      message.receivers.forEach(receiver => {
        const session = sessions.get(receiver)
        if (session?.inputMessage(message.body)) {
          completed.add(receiver)
        }
      })
    })
  }

  if (completed.size !== partyIds.length) {
    throw new Error('MPC fixture keygen did not complete')
  }

  const results = new Map<
    string,
    { chainCode: string; keyshare: string; publicKey: string }
  >()

  for (const [partyId, session] of sessions) {
    const keyshare = await session.finish()
    results.set(partyId, {
      chainCode: Buffer.from(keyshare.rootChainCode()).toString('hex'),
      keyshare: Buffer.from(keyshare.toBytes()).toString('base64'),
      publicKey: Buffer.from(keyshare.publicKey()).toString('hex'),
    })
    keyshare.free?.()
    session.free?.()
  }

  return results.get('device-1')!
}

const createRecoveryBackup = async () => {
  const mpc = await ensureMpcEngine()
  await mpc.initialize()
  const [ecdsa, eddsa] = await Promise.all([
    createKeyshare(mpc.dkls),
    createKeyshare(mpc.schnorr),
  ])
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
