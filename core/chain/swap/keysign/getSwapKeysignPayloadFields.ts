import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { CommKeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
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
import { nativeSwapQuoteToSwapPayload } from '../native/utils/nativeSwapQuoteToSwapPayload'

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
  const result = matchRecordUnion<SwapQuote, Output>(quote, {
    general: quote => {
      const toAddress = matchRecordUnion<GeneralSwapTx, string>(quote.tx, {
        evm: ({ to }) => to,
        solana: () => '',
      })

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

      const swapPayload: CommKeysignSwapPayload = {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, {
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
          provider: quote.provider,
        }),
      }

      return {
        toAddress,
        swapPayload,
      }
    },
    native: quote => {
      const swapPayload = nativeSwapQuoteToSwapPayload({
        quote,
        fromCoin,
        amount,
        toCoin,
      })

      const isErc20 =
        isOneOf(fromCoin.chain, Object.values(EvmChain)) && !isFeeCoin(fromCoin)

      const toAddress =
        (isErc20 ? quote.router : quote.inbound_address) || fromCoin.address

      return {
        toAddress,
        swapPayload,
        memo: quote.memo,
      }
    },
  })

  const isErc20 =
    isOneOf(fromCoin.chain, Object.values(EvmChain)) && !isFeeCoin(fromCoin)

  if (isErc20) {
    result.erc20ApprovePayload = create(Erc20ApprovePayloadSchema, {
      amount: amount.toString(),
      spender: result.toAddress,
    })
  }

  return result
}
