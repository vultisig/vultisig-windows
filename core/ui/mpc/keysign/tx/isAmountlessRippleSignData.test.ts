import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignRippleSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { describe, expect, it } from 'vitest'

import { isAmountlessRippleSignData } from './isAmountlessRippleSignData'

const rippleCoin = create(CoinSchema, {
  chain: Chain.Ripple,
  ticker: 'XRP',
  address: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
  decimals: 6,
  isNativeToken: true,
})

type RipplePayloadInput = {
  transaction: Record<string, unknown>
  toAmount: string
}

const ripplePayload = ({ transaction, toAmount }: RipplePayloadInput) =>
  create(KeysignPayloadSchema, {
    coin: rippleCoin,
    toAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    toAmount,
    signData: {
      case: 'signRipple',
      value: create(SignRippleSchema, {
        rawJson: JSON.stringify(transaction),
      }),
    },
  })

describe('isAmountlessRippleSignData', () => {
  it('keeps the hero amount of a dApp XRPL Payment', () => {
    expect(
      isAmountlessRippleSignData(
        ripplePayload({
          transaction: {
            TransactionType: 'Payment',
            Destination: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
            Amount: '1000000',
          },
          toAmount: '1000000',
        })
      )
    ).toBe(false)
  })

  it.each([
    {
      name: 'OfferCreate',
      transaction: {
        TransactionType: 'OfferCreate',
        TakerGets: '1000000',
        TakerPays: { currency: 'USD', value: '1' },
      },
    },
    {
      name: 'TrustSet',
      transaction: {
        TransactionType: 'TrustSet',
        LimitAmount: { currency: 'USD', value: '10' },
      },
    },
  ])('hides the hero amount of a two-sided $name', ({ transaction }) => {
    expect(
      isAmountlessRippleSignData(ripplePayload({ transaction, toAmount: '0' }))
    ).toBe(true)
  })

  it('treats an unparsable scalar as no amount at all', () => {
    expect(
      isAmountlessRippleSignData(
        ripplePayload({
          transaction: { TransactionType: 'Payment' },
          toAmount: 'not-a-number',
        })
      )
    ).toBe(true)
  })

  it('leaves a non-XRPL payload alone', () => {
    expect(
      isAmountlessRippleSignData(
        create(KeysignPayloadSchema, {
          coin: create(CoinSchema, {
            chain: Chain.Ethereum,
            ticker: 'ETH',
            address: '0x1111111111111111111111111111111111111111',
            decimals: 18,
            isNativeToken: true,
          }),
          toAmount: '0',
        })
      )
    ).toBe(false)
  })
})
