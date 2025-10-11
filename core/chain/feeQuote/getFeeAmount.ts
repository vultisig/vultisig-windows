import { Chain } from '@core/chain/Chain'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { suiAverageSendGas } from '../chains/sui/config'
import { FeeQuoteForChain, toFeeQuoteRecordUnion } from './core'

export const getFeeAmount = (
  chain: Chain,
  quote: FeeQuoteForChain<Chain>
): bigint =>
  matchRecordUnion(toFeeQuoteRecordUnion(chain, quote), {
    evm: ({ baseFeePerGas, maxPriorityFeePerGas, gasLimit }) =>
      (baseFeePerGas + maxPriorityFeePerGas) * gasLimit,
    utxo: ({ byteFee, txSize }) => byteFee * txSize,
    cosmos: ({ gas }) => gas,
    sui: ({ gas }) => gas * suiAverageSendGas,
    solana: ({ priorityFee }) => priorityFee,
    polkadot: ({ gas }) => gas,
    ton: ({ gas }) => gas,
    tron: ({ gas }) => gas,
    ripple: ({ gas }) => gas,
    cardano: ({ byteFee }) => byteFee,
  })
