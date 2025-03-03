import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransactionSchema,
} from '@core/communication/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { isNativeSwapDeposit } from '../native/utils/isNativeSwapDeposit'
import { nativeSwapQuoteToSwapPayload } from '../native/utils/nativeSwapQuoteToSwapPayload'
import { SwapQuote } from '../quote/SwapQuote'

type Input = {
  amount: bigint
  quote: SwapQuote
  fromCoin: AccountCoin
  toCoin: Coin
}

type Output = Pick<KeysignPayload, 'toAddress' | 'memo'> &
  Partial<Pick<KeysignPayload, 'swapPayload'>>

export const getSwapKeysignPayloadFields = ({
  amount,
  quote,
  fromCoin,
  toCoin,
}: Input): Output => {
  return matchRecordUnion(quote, {
    general: quote => {
      const swapPayload = create(OneInchSwapPayloadSchema, {
        fromCoin,
        toCoin,
        fromAmount: amount.toString(),
        toAmountDecimal: fromChainAmount(
          quote.dstAmount,
          toCoin.decimals
        ).toFixed(toCoin.decimals),
        quote: create(OneInchQuoteSchema, {
          dstAmount: quote.dstAmount,
          tx: create(OneInchTransactionSchema, {
            ...quote.tx,
            gas: BigInt(quote.tx.gas),
          }),
        }),
      })

      return {
        toAddress: quote.tx.to,
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: swapPayload,
        },
      }
    },
    native: quote => {
      const { memo, swapChain } = quote

      if (isNativeSwapDeposit({ fromCoin, swapChain })) {
        return {
          memo,
          toAddress: '',
        }
      }

      const swapPayload = nativeSwapQuoteToSwapPayload({
        quote,
        fromCoin,
        amount,
        toCoin,
      })

      const toAddress = shouldBePresent(quote.router || quote.inbound_address)

      return {
        toAddress,
        swapPayload,
        memo,
      }
    },
  })
}
