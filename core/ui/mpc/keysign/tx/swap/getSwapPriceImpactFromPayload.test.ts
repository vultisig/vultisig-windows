import { create } from '@bufbuild/protobuf'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { getSwapPriceImpactFromPayload } from './getSwapPriceImpactFromPayload'

// `slippage_bps` is field 14, added in vultisig/commondata#104. Until the SDK
// publishes the regenerated type, `create` does not accept it by name, so the
// fixture attaches it the way a decoded payload carries it.
const nativePayload = (slippageBps: number | undefined) =>
  create(KeysignPayloadSchema, {
    swapPayload: {
      case: 'thorchainSwapPayload',
      value: Object.assign(
        create(THORChainSwapPayloadSchema, { fromAmount: '1000' }),
        slippageBps === undefined ? {} : { slippageBps }
      ),
    },
  })

describe('getSwapPriceImpactFromPayload', () => {
  it('reads a native payload as a fraction, matching what the quote produces', () => {
    // The live ETH.ETH -> BTC.BTC quote the initiator saw: 19 bps.
    expect(getSwapPriceImpactFromPayload(nativePayload(19))).toBeCloseTo(
      0.0019,
      10
    )
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
    const payload = create(KeysignPayloadSchema, {
      swapPayload: {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, { fromAmount: '1000' }),
      },
    })

    expect(getSwapPriceImpactFromPayload(payload)).toBeUndefined()
  })

  it('reports nothing for a payload that is not a swap at all', () => {
    expect(
      getSwapPriceImpactFromPayload(create(KeysignPayloadSchema, {}))
    ).toBeUndefined()
  })
})
