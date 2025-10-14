import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { useChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useSwapQuote } from './useSwapQuoteQuery'

export const useSwapChainSpecificQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuote = useSwapQuote()

  const amount = shouldBePresent(fromAmount, 'swap from amount')

  const queryInput: ChainSpecificResolverInput = useMemo(() => {
    const destinationAddress = getSwapDestinationAddress({
      quote: swapQuote,
      fromCoin,
    })

    const input: ChainSpecificResolverInput = {
      coin: fromCoin,
      amount: toChainAmount(amount, fromCoin.decimals),
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
      isComplexTx: isChainOfKind(fromCoin.chain, 'utxo') ? true : undefined,
      feeQuote: matchRecordUnion<
        SwapQuote,
        Partial<EvmFeeSettings> | undefined
      >(swapQuote, {
        native: () => undefined,
        general: ({ tx }) =>
          matchRecordUnion(tx, {
            evm: ({ gasLimit }) => ({
              gasLimit,
            }),
            solana: () => undefined,
          }),
      }),
    }

    return input
  }, [amount, fromCoin, fromCoinKey, swapQuote])

  return useChainSpecificQuery(queryInput)
}
