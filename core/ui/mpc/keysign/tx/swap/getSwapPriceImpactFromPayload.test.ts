import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { getSwapPriceImpactFromPayload } from './getSwapPriceImpactFromPayload'

// A co-signer never builds this message — it decodes one off the relay. Every
// fixture therefore goes through the wire, because an in-memory message can
// carry a property the schema does not: against a `@vultisig/core-mpc` that
// predates `slippage_bps` (field 14), `fromBinary` parks the value in
// `$unknown` and leaves `slippageBps` undefined, which is exactly how this
// read once passed its tests while showing the co-signer nothing.
const throughTheWire = (payload: KeysignPayload) =>
  fromBinary(KeysignPayloadSchema, toBinary(KeysignPayloadSchema, payload))

const nativePayload = (slippageBps: number | undefined) =>
  throughTheWire(
    create(KeysignPayloadSchema, {
      swapPayload: {
        case: 'thorchainSwapPayload',
        value: create(THORChainSwapPayloadSchema, {
          fromAmount: '1000',
          slippageBps,
        }),
      },
    })
  )

describe('getSwapPriceImpactFromPayload', () => {
  it('reads a native payload as a fraction, matching what the quote produces', () => {
    // The live ETH.ETH -> BTC.BTC quote the initiator saw: 19 bps.
    expect(getSwapPriceImpactFromPayload(nativePayload(19))).toBeCloseTo(
      0.0019,
      10
    )
  })

  it('carries the field on the wire rather than parking it in $unknown', () => {
    const payload = nativePayload(19)
    const swapPayload = payload.swapPayload

    expect(swapPayload.case).toBe('thorchainSwapPayload')
    expect(
      swapPayload.case === 'thorchainSwapPayload' && swapPayload.value.$unknown
    ).toBeUndefined()
  })

  it('reports nothing when the payload omits the field', () => {
    // An initiator on an older build, or on a platform that has not shipped
    // the field yet. The row has to hide rather than read absence as zero.
    expect(
      getSwapPriceImpactFromPayload(nativePayload(undefined))
    ).toBeUndefined()
  })

  it('separates an absent impact from a zero one', () => {
    expect(getSwapPriceImpactFromPayload(nativePayload(0))).toBe(0)
  })

  it('reports nothing for a general swap, which carries no impact field', () => {
    const payload = throughTheWire(
      create(KeysignPayloadSchema, {
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: create(OneInchSwapPayloadSchema, { fromAmount: '1000' }),
        },
      })
    )

    expect(getSwapPriceImpactFromPayload(payload)).toBeUndefined()
  })

  it('reports nothing for a payload that is not a swap at all', () => {
    expect(
      getSwapPriceImpactFromPayload(
        throughTheWire(create(KeysignPayloadSchema, {}))
      )
    ).toBeUndefined()
  })
})
