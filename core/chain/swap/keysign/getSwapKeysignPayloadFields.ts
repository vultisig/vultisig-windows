import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransaction,
  OneInchTransactionSchema,
} from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { GeneralSwapTx } from '../general/GeneralSwapQuote'
import { thorchainSwapQuoteToSwapPayload } from '../native/thor/utils/thorchainSwapQuoteToSwapPayload'

type Input = {
  amount: bigint
  quote: SwapQuote
  fromCoin: AccountCoin & { hexPublicKey: string }
  toCoin: AccountCoin & { hexPublicKey: string }
}

type Output = Pick<KeysignPayload, 'toAddress' | 'memo'> &
  Partial<Pick<KeysignPayload, 'swapPayload' | 'erc20ApprovePayload'>>

export const getSwapKeysignPayloadFields = ({
  amount,
  quote,
  fromCoin,
  toCoin,
}: Input): Output => {
  return matchRecordUnion<SwapQuote, Output>(quote, {
    general: quote => {
      const txMsg = matchRecordUnion<
        GeneralSwapTx,
        Omit<OneInchTransaction, '$typeName' | 'swapFee'>
      >(quote.tx, {
        evm: ({ gas, ...tx }) => ({ ...tx, gas: BigInt(gas) }),
        solana: ({ data }) => ({
          from: '',
          to: '',
          data,
          value: '',
          gasPrice: '',
          gas: BigInt(0),
        }),
      })

      const tx = create(OneInchTransactionSchema, txMsg)

      const swapPayload = create(OneInchSwapPayloadSchema, {
        fromCoin: toCommCoin(fromCoin),
        toCoin: toCommCoin(toCoin),
        fromAmount: amount.toString(),
        toAmountDecimal: fromChainAmount(
          quote.dstAmount,
          toCoin.decimals
        ).toFixed(toCoin.decimals),
        quote: create(OneInchQuoteSchema, {
          dstAmount: quote.dstAmount,
          tx,
        }),
      })

      return {
        toAddress: txMsg.to,
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: swapPayload,
        },
      }
    },
    native: quote => {
      const { memo } = quote
      if (
        isOneOf(fromCoin.chain, Object.values(EvmChain)) &&
        !isFeeCoin(fromCoin)
      ) {
        const swapPayload = thorchainSwapQuoteToSwapPayload({
          quote,
          fromCoin,
          amount,
          toCoin,
        })

        const toAddress = shouldBePresent(quote.router)

        return {
          toAddress,
          swapPayload,
          memo: quote.memo,
          erc20ApprovePayload: create(Erc20ApprovePayloadSchema, {
            amount: amount.toString(),
            spender: toAddress,
          }),
        }
      }

      const isDeposit =
        isFeeCoin(fromCoin) && fromCoin.chain === quote.swapChain

      return {
        toAddress: isDeposit ? '' : shouldBePresent(quote.inbound_address),
        memo,
      }
    },
  })
}
