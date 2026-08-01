import { create } from '@bufbuild/protobuf'
import {
  CosmosSpecificSchema,
  RippleSpecificSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it } from 'vitest'

import {
  getRippleDisplay,
  getRippleKeysignDisplay,
} from './getRippleKeysignDisplay'

describe('getRippleDisplay', () => {
  it.each([0, 12345, 4_294_967_295])(
    'returns the destination tag %s and preserves a distinct memo',
    destinationTag => {
      expect(
        getRippleDisplay({ destinationTag, memo: 'invoice-4300' })
      ).toEqual({ destinationTag, memo: 'invoice-4300' })
    }
  )

  it('hides a tag-only compatibility memo', () => {
    expect(getRippleDisplay({ destinationTag: 12345, memo: '12345' })).toEqual({
      destinationTag: 12345,
      memo: undefined,
    })
  })

  it.each([
    ['0', 0],
    ['12345', 12345],
    ['4294967295', 4_294_967_295],
  ])('recognizes the legacy memo carrier %s', (memo, destinationTag) => {
    expect(getRippleDisplay({ memo })).toEqual({
      destinationTag,
      memo: undefined,
    })
  })

  it('preserves a distinct numeric memo when a typed tag is present', () => {
    expect(getRippleDisplay({ destinationTag: 12345, memo: '67890' })).toEqual({
      destinationTag: 12345,
      memo: '67890',
    })
  })
})

describe('getRippleKeysignDisplay', () => {
  it('reads the typed Ripple-specific destination tag', () => {
    const payload = create(KeysignPayloadSchema, {
      memo: 'invoice-4300',
      blockchainSpecific: {
        case: 'rippleSpecific',
        value: create(RippleSpecificSchema, { destinationTag: 12345 }),
      },
    })

    expect(getRippleKeysignDisplay(payload)).toEqual({
      destinationTag: 12345,
      memo: 'invoice-4300',
    })
  })

  it('does not treat another chain-specific payload as a destination tag carrier', () => {
    const payload = create(KeysignPayloadSchema, {
      memo: '12345',
      blockchainSpecific: {
        case: 'cosmosSpecific',
        value: create(CosmosSpecificSchema),
      },
    })

    expect(getRippleKeysignDisplay(payload)).toEqual({
      destinationTag: undefined,
      memo: '12345',
    })
  })
})
