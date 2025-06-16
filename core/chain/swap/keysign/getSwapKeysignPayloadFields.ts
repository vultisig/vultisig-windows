import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
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
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { EvmChain } from '../../Chain'
import { isFeeCoin } from '../../coin/utils/isFeeCoin'
import { GeneralSwapTx } from '../general/GeneralSwapQuote'
import { thorchainSwapQuoteToSwapPayload } from '../native/thor/utils/thorchainSwapQuoteToSwapPayload'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

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
      const swapPayload = thorchainSwapQuoteToSwapPayload({
        quote,
        fromCoin,
        amount,
        toCoin,
      })

      const isErc20 =
        isOneOf(fromCoin.chain, Object.values(EvmChain)) && !isFeeCoin(fromCoin)

      const toAddress = (isErc20 ? quote.router : quote.inbound_address) || ''

      const result: Output = {
        toAddress,
        swapPayload,
        memo: quote.memo,
      }

      if (isErc20) {
        result.erc20ApprovePayload = create(Erc20ApprovePayloadSchema, {
          amount: amount.toString(),
          spender: toAddress,
        })
      }

      return result
    },
  })
}
