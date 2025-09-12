import { EvmChain } from '@core/chain/Chain'
import { toChainKindRecordUnion } from '@core/chain/ChainKind'
import { cardanoDefaultFee } from '@core/chain/chains/cardano/config'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { tonConfig } from '@core/chain/chains/ton/config'
import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { FeeQuote } from '@core/chain/tx/fee/quote/core'
import { getCosmosFeeQuote } from '@core/chain/tx/fee/quote/cosmos'
import { EvmFeeQuoteInput, getEvmFeeQuote } from '@core/chain/tx/fee/quote/evm'
import {
  getSolanaFeeQuote,
  GetSolanaFeeQuoteInput,
} from '@core/chain/tx/fee/quote/solana'
import { getSuiFeeQuote } from '@core/chain/tx/fee/quote/sui'
import {
  getTronFeeQuote,
  GetTronFeeQuoteInput,
} from '@core/chain/tx/fee/quote/tron'
import { getUtxoFeeQuote } from '@core/chain/tx/fee/quote/utxo'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { QueryKey, useQuery } from '@tanstack/react-query'

type TxFeeQuoteQueryInput = {
  coin: AccountCoin
  receiver?: string
  amount?: number
  data?: string
}

type TxFeeQuoteQuery = {
  queryKey: QueryKey
  queryFn: () => Promise<FeeQuote>
}

const queryKeyPrefix = 'txFeeQuote'

const getTxFeeQuoteQuery = ({
  coin,
  receiver,
  amount,
  data,
}: TxFeeQuoteQueryInput): TxFeeQuoteQuery => {
  const { chain } = coin
  return matchRecordUnion(toChainKindRecordUnion(chain), {
    evm: () => {
      const input: EvmFeeQuoteInput = {
        coin: coin as AccountCoinKey<EvmChain>,
        amount,
        data,
        receiver,
      }

      return {
        queryKey: [queryKeyPrefix, input],
        queryFn: async () => getEvmFeeQuote(input),
      }
    },
    utxo: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => getUtxoFeeQuote(chain),
    }),
    cosmos: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => getCosmosFeeQuote(chain),
    }),
    solana: () => {
      const input: GetSolanaFeeQuoteInput = {
        sender: coin.address,
      }

      return {
        queryKey: [queryKeyPrefix, input],
        queryFn: async () => getSolanaFeeQuote(input),
      }
    },
    sui: () => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => getSuiFeeQuote(),
    }),
    tron: () => {
      const input: GetTronFeeQuoteInput = {
        coin,
      }

      return {
        queryKey: [queryKeyPrefix, input],
        queryFn: async () => getTronFeeQuote(input),
      }
    },
    polkadot: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => polkadotConfig.fee,
    }),
    ton: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => tonConfig.fee,
    }),
    ripple: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => rippleTxFee,
    }),
    cardano: chain => ({
      queryKey: [queryKeyPrefix, chain],
      queryFn: async () => cardanoDefaultFee,
    }),
  })
}

export const useTxFeeQuoteQuery = (input: TxFeeQuoteQueryInput) => {
  return useQuery(getTxFeeQuoteQuery(input))
}
