import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it } from 'vitest'

import { AppView } from '@clients/extension/src/navigation/AppView'
import { getPersistableHistory } from '@clients/extension/src/navigation/persistableViews'

const mnemonic = 'test mnemonic that must never reach extension storage'
const password = 'fast-vault-password'

const vaultView: AppView = { id: 'vault' }
const keysignView: AppView = {
  id: 'keysign',
  state: {
    securityType: 'fast',
    keysignPayload: { keysign: create(KeysignPayloadSchema) },
    password,
  },
}
const keyImportInput = { mnemonic, chains: [Chain.Arbitrum] }
const importSetupVaultView: AppView = {
  id: 'setupVault',
  state: { keyImportInput },
}

const expectNoSecrets = (history: AppView[] | null) => {
  const serialized = JSON.stringify(history)
  expect(serialized).not.toContain(mnemonic)
  expect(serialized).not.toContain(password)
}

describe('getPersistableHistory', () => {
  it('persists a history made only of persistable views', () => {
    const history: AppView[] = [
      vaultView,
      { id: 'vaultChainDetail', state: { chain: Chain.Solana } },
      { id: 'send', state: { fromChain: Chain.Solana } },
    ]

    expect(getPersistableHistory(history)).toEqual(history)
  })

  it('persists nothing while the current view is not persistable', () => {
    expect(getPersistableHistory([vaultView, keysignView])).toBeNull()
  })

  it('drops a finished keysign that is still on the stack', () => {
    const history: AppView[] = [
      vaultView,
      { id: 'swap', state: {} },
      keysignView,
      vaultView,
    ]

    const persisted = getPersistableHistory(history)

    expect(persisted).toEqual([vaultView, { id: 'swap', state: {} }, vaultView])
    expectNoSecrets(persisted)
  })

  it('persists nothing while setting up a vault from imported keys', () => {
    expect(
      getPersistableHistory([
        vaultView,
        { id: 'importSeedphrase' },
        importSetupVaultView,
      ])
    ).toBeNull()
  })

  it('keeps a plain vault setup view', () => {
    const history: AppView[] = [vaultView, { id: 'setupVault', state: {} }]

    expect(getPersistableHistory(history)).toEqual(history)
  })

  it('drops every view carrying key import input once back home', () => {
    const history: AppView[] = [
      vaultView,
      { id: 'newVault' },
      { id: 'importSeedphrase' },
      importSetupVaultView,
      {
        id: 'setupVaultOverview',
        state: { selectedDeviceCount: 0, keyImportInput },
      },
      { id: 'setupFastVault', state: { keyImportInput } },
      vaultView,
    ]

    const persisted = getPersistableHistory(history)

    expect(persisted).toEqual([vaultView, vaultView])
    expectNoSecrets(persisted)
  })
})
