import { hexToU8a } from '@polkadot/util'
import { describe, expect, it } from 'vitest'

import { getPolkadotSignedExtrinsicHash } from './getPolkadotSignedExtrinsicHash'
import { PolkadotSignerPayloadJSON } from './PolkadotSignerPayload'

// A taostats stake signed by a Vultisig vault and submitted by the dApp:
// Bittensor finney extrinsic 9586426-17 (subtensorModule.addStakeLimit).
const stake: PolkadotSignerPayloadJSON = {
  address: '5CgmCqcFp162d82n7LDqkqtFZbTgaTXFovHbWUnQWgfZaF5E',
  blockHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  blockNumber: '0x00000000',
  era: '0x3401',
  genesisHash:
    '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03',
  method:
    '0x0758bc0e6b701243978c1fe73d721c7b157943a713fca9f3c88cad7a9f7799bc6b260200404b4c00000000009bfa30000000000000',
  nonce: '0x00000001',
  specVersion: '0x000001ef',
  tip: '0x00000000000000000000000000000000',
  transactionVersion: '0x00000002',
  signedExtensions: [],
  version: 4,
  mode: 0,
  metadataHash: null,
}

const publicKey = hexToU8a(
  '0x1b801aa7eb49dc3a7b6bf90e892ed4650c761e5c77e0b1ec9b2ef609db62bc23'
)
const signature = hexToU8a(
  '0x6c084f6ac3c54a0a9a1ff72f45f5de141ebebe034a5bdc613254b07e2610e32fafad7e3269093f3d13f63f9037c36b821144b4b35a07613c5b57d2c85854a104'
)

describe('getPolkadotSignedExtrinsicHash', () => {
  it('matches the hash of the extrinsic the dApp submitted', () => {
    expect(
      getPolkadotSignedExtrinsicHash({ payload: stake, publicKey, signature })
    ).toBe('0x240bdd3b33ae241e7c3e5ee3cb55cfe95ac9d7acb43496d98645b00f68f13954')
  })

  it('ignores the fields the extrinsic does not carry', () => {
    const otherBlock = {
      ...stake,
      blockHash: `0x${'11'.repeat(32)}`,
      specVersion: '0x00000001',
    }

    expect(
      getPolkadotSignedExtrinsicHash({
        payload: otherBlock,
        publicKey,
        signature,
      })
    ).toBe(
      getPolkadotSignedExtrinsicHash({ payload: stake, publicKey, signature })
    )
  })
})
