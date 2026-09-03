import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SwapKitSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/swapkit_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { getSwapFeeFromPayload } from './getSwapFeeFromPayload'

const swapkitPayload = (
  value: Partial<{
    swapFee: string
    swapFeeChain: string
    swapFeeTokenId: string
    swapFeeDecimals: number
  }>
) =>
  create(KeysignPayloadSchema, {
    swapPayload: {
      case: 'swapkitSwapPayload',
      value: create(SwapKitSwapPayloadSchema, {
        fromAmount: '9332136',
        toAmountDecimal: '144.490532',
        txType: 'TRANSFER',
        targetAddress: 't1Deposit',
        subProvider: 'NEAR',
        ...value,
      }),
    },
  })

describe('getSwapFeeFromPayload', () => {
  it('reads the fee a SwapKit transfer route carries on the payload itself', () => {
    // These routes quote no transaction, so a joiner reading only
    // `quote.tx` saw no fee at all and totalled the swap over gas alone
    // (#4362).
    const payload = swapkitPayload({
      swapFee: '250000',
      swapFeeChain: Chain.Zcash,
      swapFeeDecimals: 8,
    })

    expect(getSwapFeeFromPayload(payload)).toEqual({
      chain: Chain.Zcash,
      amount: 250_000n,
      decimals: 8,
    })
  })

  it('keeps the token id off a native fee coin', () => {
    // `coinKeyToString` turns an empty id into "Zcash:", which misses the
    // vault coin and prices the fee at zero.
    const fee = getSwapFeeFromPayload(
      swapkitPayload({
        swapFee: '250000',
        swapFeeChain: Chain.Zcash,
        swapFeeDecimals: 8,
      })
    )

    expect(fee && 'id' in fee).toBe(false)
  })

  it('reports no fee when the payload states none', () => {
    expect(getSwapFeeFromPayload(swapkitPayload({}))).toBeUndefined()
  })

  it('reports no fee when the coin context is missing', () => {
    // A sender that predates the coin context leaves the chain empty. Pricing
    // the amount against a guessed coin is worse than showing no row.
    expect(
      getSwapFeeFromPayload(swapkitPayload({ swapFee: '250000' }))
    ).toBeUndefined()
  })

  it('reports no fee when the coin context names an unknown chain', () => {
    expect(
      getSwapFeeFromPayload(
        swapkitPayload({
          swapFee: '250000',
          swapFeeChain: 'Neverchain',
          swapFeeDecimals: 8,
        })
      )
    ).toBeUndefined()
  })

  it('reads the fee a 1inch-shaped payload carries on its quoted transaction', () => {
    const payload = create(KeysignPayloadSchema, {
      swapPayload: {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, {
          provider: 'li.fi',
          quote: {
            dstAmount: '0',
            tx: {
              swapFee: '40000',
              swapFeeChain: Chain.Ethereum,
              swapFeeTokenId: '0xusdc',
              swapFeeDecimals: 6,
            },
          },
        }),
      },
    })

    expect(getSwapFeeFromPayload(payload)).toEqual({
      chain: Chain.Ethereum,
      id: '0xusdc',
      amount: 40_000n,
      decimals: 6,
    })
  })
})
