import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it } from 'vitest'

import { AppView } from '@clients/extension/src/navigation/AppView'
import { getPersistableView } from '@clients/extension/src/navigation/persistableViews'

const mnemonic = 'test mnemonic that must never reach extension storage'
const password = 'fast-vault-password'

const vaultView: AppView = { id: 'vault' }
const ethereum = { chain: Chain.Ethereum, id: 'ETH' }
const keysignView: AppView = {
  id: 'keysign',
  state: {
    securityType: 'fast',
    keysignPayload: { keysign: create(KeysignPayloadSchema) },
    password,
  },
}
const keyImportInput = { mnemonic, chains: [Chain.Arbitrum] }

describe('getPersistableView', () => {
  it('keeps only the current view', () => {
    const history: AppView[] = [
      vaultView,
      { id: 'vaultChainDetail', state: { chain: Chain.Solana } },
      { id: 'settings' },
    ]

    expect(getPersistableView(history)).toEqual({ id: 'settings' })
  })

  it('drops send form input and keeps the chain', () => {
    const history: AppView[] = [
      vaultView,
      {
        id: 'send',
        state: {
          fromChain: Chain.Solana,
          address: 'recipient',
          amount: 10n,
          memo: 'memo',
          skipToVerify: true,
        },
      },
    ]

    expect(getPersistableView(history)).toEqual({
      id: 'send',
      state: { fromChain: Chain.Solana },
    })
  })

  it('drops the deposit form', () => {
    const history: AppView[] = [
      vaultView,
      {
        id: 'deposit',
        state: {
          coin: ethereum,
          action: 'delegate',
          form: { amount: '1', validator: 'validator' },
        },
      },
    ]

    expect(getPersistableView(history)).toEqual({
      id: 'deposit',
      state: { coin: ethereum, action: 'delegate' },
    })
  })

  it('drops the swap amount and auto-submit', () => {
    const history: AppView[] = [
      vaultView,
      {
        id: 'swap',
        state: { fromCoin: ethereum, fromAmount: 5n, autoSubmit: true },
      },
    ]

    expect(getPersistableView(history)).toEqual({
      id: 'swap',
      state: { fromCoin: ethereum },
    })
  })

  it('persists nothing while the current view is not persistable', () => {
    expect(getPersistableView([vaultView, keysignView])).toBeNull()
  })

  it('persists nothing while setting up a vault from imported keys', () => {
    expect(
      getPersistableView([
        vaultView,
        { id: 'importSeedphrase' },
        { id: 'setupVault', state: { keyImportInput } },
      ])
    ).toBeNull()
  })

  it('keeps a plain vault setup view', () => {
    expect(
      getPersistableView([vaultView, { id: 'setupVault', state: { type: 'fast' } }])
    ).toEqual({ id: 'setupVault', state: { type: 'fast' } })
  })

  it('persists no credentials from earlier flows once back home', () => {
    const history: AppView[] = [
      vaultView,
      { id: 'setupFastVault', state: { keyImportInput } },
      keysignView,
      vaultView,
    ]

    const persisted = JSON.stringify(getPersistableView(history))

    expect(persisted).not.toContain(mnemonic)
    expect(persisted).not.toContain(password)
  })
})
