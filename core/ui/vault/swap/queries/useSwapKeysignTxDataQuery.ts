import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { useKeysignTxDataQuery } from '@core/ui/mpc/keysign/txData/query'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useFromAmount } from '../state/fromAmount'
import { useSwapQuote } from './useSwapQuoteQuery'

export const useSwapKeysignTxDataQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const [fromAmount] = useFromAmount()
  const swapQuote = useSwapQuote()

  const input = useMemo(() => {
    const amount = toChainAmount(
      shouldBePresent(fromAmount, 'swap from amount'),
      fromCoin.decimals
    )

    const receiver = getSwapDestinationAddress({ quote: swapQuote, fromCoin })

    return {
      coin: fromCoin,
      receiver,
      amount,
      isDeposit: matchRecordUnion<SwapQuote, boolean>(swapQuote, {
        native: ({ swapChain }) =>
          areEqualCoins(fromCoinKey, chainFeeCoin[swapChain]),
        general: () => false,
      }),
    }
  }, [fromAmount, fromCoin, fromCoinKey, swapQuote])

  return useKeysignTxDataQuery(input)
}
