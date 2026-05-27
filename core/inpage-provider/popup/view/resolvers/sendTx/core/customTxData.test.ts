import type { WalletCore } from '@trustwallet/wallet-core'
import { OtherChain } from '@vultisig/core-chain/Chain'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it, vi } from 'vitest'

import { getCustomTxData } from './customTxData'

const bittensorGenesisHash =
  '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03'
const polkadotGenesisHash =
  '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'

const signerPayload = {
  address: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
  blockHash: '0xabc',
  blockNumber: '0x1',
  era: '0x00',
  method: '0x0500',
  nonce: '0x0',
  signedExtensions: [],
  specVersion: '0x1',
  tip: '0x0',
  transactionVersion: '0x1',
  version: 4,
}

const getSerializedSubstrateTxData = (genesisHash?: string) =>
  getCustomTxData({
    walletCore: null as unknown as WalletCore,
    vault: null as unknown as Vault,
    transactionPayload: {
      serialized: {
        chain: OtherChain.Polkadot,
        data: [JSON.stringify({ ...signerPayload, genesisHash })],
      },
    },
    getCoin: vi.fn(),
    requestOrigin: 'https://taostats.io',
  })

describe('getCustomTxData Substrate dApp transactions', () => {
  it('corrects a Bittensor payload routed through the Polkadot provider', async () => {
    await expect(
      getSerializedSubstrateTxData(bittensorGenesisHash)
    ).resolves.toMatchObject({
      polkadot: {
        chain: OtherChain.Bittensor,
        signerPayload: { genesisHash: bittensorGenesisHash },
      },
    })
  })

  it('preserves a Polkadot payload routed through the Polkadot provider', async () => {
    await expect(
      getSerializedSubstrateTxData(polkadotGenesisHash)
    ).resolves.toMatchObject({
      polkadot: {
        chain: OtherChain.Polkadot,
        signerPayload: { genesisHash: polkadotGenesisHash },
      },
    })
  })

  it('rejects unsupported Substrate networks', async () => {
    await expect(getSerializedSubstrateTxData('0xunsupported')).rejects.toThrow(
      'Unsupported Substrate genesis hash'
    )
  })

  it('rejects payloads without a genesis hash', async () => {
    await expect(getSerializedSubstrateTxData()).rejects.toThrow(
      'Missing Substrate genesis hash'
    )
  })
})
