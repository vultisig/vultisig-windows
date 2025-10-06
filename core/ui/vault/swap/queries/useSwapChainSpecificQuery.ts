import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { byteFeeMultiplier } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { getChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapChainSpecificQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const queryInput: ChainSpecificResolverInput | undefined = useMemo(() => {
    const { data: swapQuote } = swapQuoteQuery

    if (!swapQuote) {
      return
    }

    if (!fromAmount) {
      return
    }

    const destinationAddress = getSwapDestinationAddress({
      quote: swapQuote,
      fromCoin,
    })

    const input: ChainSpecificResolverInput = {
      coin: fromCoin,
      amount: toChainAmount(fromAmount, fromCoin.decimals),
      receiver: destinationAddress,
      data: matchRecordUnion<SwapQuote, string | undefined>(swapQuote, {
        native: () => undefined,
        general: ({ tx }) => getRecordUnionValue(tx).data,
      }),
      isDeposit: matchRecordUnion<SwapQuote, boolean>(swapQuote, {
        native: ({ swapChain }) =>
          areEqualCoins(fromCoinKey, chainFeeCoin[swapChain]),
        general: () => false,
      }),
      byteFeeMultiplier: isChainOfKind(fromCoin.chain, 'utxo')
        ? byteFeeMultiplier.fast
        : undefined,
      feeQuote: matchRecordUnion<
        SwapQuote,
        Partial<EvmFeeSettings> | undefined
      >(swapQuote, {
        native: () => undefined,
        general: ({ tx }) =>
          matchRecordUnion(tx, {
            evm: ({ feeQuote }) => feeQuote,
            solana: () => undefined,
          }),
      }),
    }

    return input
  }, [fromAmount, fromCoin, fromCoinKey, swapQuoteQuery])

  return usePotentialQuery(queryInput, getChainSpecificQuery)
}
