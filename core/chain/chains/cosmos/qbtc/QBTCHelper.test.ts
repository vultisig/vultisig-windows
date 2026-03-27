import { create } from '@bufbuild/protobuf'
import {
  CosmosSpecific,
  CosmosSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { sha256 } from '@noble/hashes/sha2.js'
import { describe, expect, it } from 'vitest'

import {
  getQBTCPreSignedImageHash,
  getQBTCSignedTransaction,
} from './QBTCHelper'

const makeMockPayload = (): {
  payload: KeysignPayload
  cosmosSpecific: CosmosSpecific
} => {
  const cosmosSpecific = create(CosmosSpecificSchema, {
    accountNumber: 42n,
    sequence: 5n,
    gas: 2000n,
    transactionType: 0,
  })

  const payload = create(KeysignPayloadSchema, {
    coin: {
      ticker: 'QBTC',
      address: 'qbtc1abc123',
      hexPublicKey: 'aa'.repeat(32),
      isNativeToken: true,
      contractAddress: '',
    },
    toAddress: 'qbtc1def456',
    toAmount: '1000000',
    blockchainSpecific: {
      case: 'cosmosSpecific',
      value: cosmosSpecific,
    },
  })

  return { payload, cosmosSpecific }
}

describe('QBTCHelper', () => {
  describe('getQBTCPreSignedImageHash', () => {
    it('returns a single hex hash string', () => {
      const { payload, cosmosSpecific } = makeMockPayload()

      const hashes = getQBTCPreSignedImageHash({
        keysignPayload: payload,
        cosmosSpecific,
      })

      expect(hashes).toHaveLength(1)
      expect(hashes[0]).toMatch(/^[0-9a-f]{64}$/)
    })

    it('produces deterministic hashes', () => {
      const { payload, cosmosSpecific } = makeMockPayload()

      const hash1 = getQBTCPreSignedImageHash({
        keysignPayload: payload,
        cosmosSpecific,
      })
      const hash2 = getQBTCPreSignedImageHash({
        keysignPayload: payload,
        cosmosSpecific,
      })

      expect(hash1[0]).toBe(hash2[0])
    })
  })

  describe('getQBTCSignedTransaction', () => {
    it('assembles a signed transaction with correct format', () => {
      const { payload, cosmosSpecific } = makeMockPayload()

      const [hashHex] = getQBTCPreSignedImageHash({
        keysignPayload: payload,
        cosmosSpecific,
      })

      const fakeSig = 'cc'.repeat(64)
      const signatures = {
        [hashHex]: {
          msg: Buffer.from(hashHex, 'hex').toString('base64'),
          r: 'aa'.repeat(32),
          s: 'bb'.repeat(32),
          der_signature: fakeSig,
        },
      }

      const result = getQBTCSignedTransaction({
        keysignPayload: payload,
        cosmosSpecific,
        signatures,
      })

      expect(result.serialized).toBeTruthy()
      const parsed = JSON.parse(result.serialized)
      expect(parsed.mode).toBe('BROADCAST_MODE_SYNC')
      expect(parsed.tx_bytes).toBeTruthy()

      // tx_bytes should be valid base64
      const decoded = Buffer.from(parsed.tx_bytes, 'base64')
      expect(decoded.length).toBeGreaterThan(0)

      // transactionHash should be SHA256 of the TxRaw bytes
      const expectedHash = Buffer.from(sha256(decoded))
        .toString('hex')
        .toUpperCase()
      expect(result.transactionHash).toBe(expectedHash)
    })
  })
})
