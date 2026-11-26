import { create } from '@bufbuild/protobuf'
import {
  fromStorableValue,
  toStorableValue,
} from '@clients/extension/src/storage/storableValue'
import { EthereumSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SwapKitSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/swapkit_swap_payload_pb'
import { Buffer } from 'buffer'
import { describe, expect, it } from 'vitest'

describe('storable value', () => {
  it('round-trips bigint and byte fields through plain JSON', () => {
    const value = {
      amount: 12345678901234567890n,
      nested: [{ fee: 0n, data: new Uint8Array([1, 2, 3]) }],
      buffer: Buffer.from([4, 5]),
      label: 'kept',
    }

    const stored = toStorableValue(value)

    expect(JSON.parse(JSON.stringify(stored))).toEqual(stored)
    expect(fromStorableValue(stored)).toEqual({
      ...value,
      buffer: new Uint8Array([4, 5]),
    })
  })

  it('passes plain values through unchanged', () => {
    const value = { id: 'vault', state: { title: 'x', count: 1 } }

    expect(fromStorableValue(toStorableValue(value))).toEqual(value)
    expect(fromStorableValue(value)).toEqual(value)
  })

  it('keeps ordinary records that look like markers intact', () => {
    const value = {
      exact: { __storable: 'bigint', value: '1' },
      partial: { __storable: 'bytes', value: 'AQID', label: 'kept' },
      escapedLookalike: { '~__storable': 'x', '~~__storable': 'y' },
      list: [{ __storable: 'invoice', value: 'abc' }],
      amount: 7n,
    }

    expect(fromStorableValue(toStorableValue(value))).toEqual(value)
  })

  it('keeps the JSON form of values with toJSON', () => {
    const date = new Date('2026-01-02T03:04:05.000Z')

    expect(toStorableValue({ date })).toEqual({ date: date.toISOString() })
  })

  it('round-trips a keysign payload with bigint and bytes fields', () => {
    const txPayload = new Uint8Array([0, 1, 127, 128, 255])
    const nonce = 18446744073709551615n
    const payload = {
      keysign: create(KeysignPayloadSchema, {
        toAmount: '1000000000000000000',
        blockchainSpecific: {
          case: 'ethereumSpecific',
          value: create(EthereumSpecificSchema, { nonce, gasLimit: '21000' }),
        },
        swapPayload: {
          case: 'swapkitSwapPayload',
          value: create(SwapKitSwapPayloadSchema, { txPayload }),
        },
      }),
    }

    const restored = fromStorableValue<typeof payload>(
      JSON.parse(JSON.stringify(toStorableValue(payload)))
    )

    expect(restored).toEqual(payload)
    const { blockchainSpecific, swapPayload } = restored.keysign
    expect(blockchainSpecific.case).toBe('ethereumSpecific')
    expect(blockchainSpecific.value?.nonce).toBe(nonce)
    expect(swapPayload.case).toBe('swapkitSwapPayload')
    expect(swapPayload.value?.txPayload).toBeInstanceOf(Uint8Array)
    expect(swapPayload.value?.txPayload).toEqual(txPayload)
  })

  it('round-trips a custom message payload', () => {
    const payload = {
      custom: create(CustomMessagePayloadSchema, {
        method: 'personal_sign',
        message: '0x48656c6c6f',
        vaultPublicKeyEcdsa: 'ecdsa-public-key',
        vaultLocalPartyId: 'local-party',
        chain: 'Ethereum',
      }),
    }

    expect(
      fromStorableValue(JSON.parse(JSON.stringify(toStorableValue(payload))))
    ).toEqual(payload)
  })
})
