import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { useFeeQuoteQuery } from '@core/ui/chain/feeQuote/query'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapQuote } from './useSwapQuoteQuery'

export const useSwapFeeQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const [fromAmount] = useFromAmount()
  const swapQuote = useSwapQuote()

  const input = useMemo(() => {
    const amount = toChainAmount(
      shouldBePresent(fromAmount, 'swap from amount'),
      fromCoin.decimals
    )

    const receiver = getSwapDestinationAddress({ quote: swapQuote, fromCoin })

    const thirdPartyGasLimitEstimation = matchRecordUnion(swapQuote, {
      native: () => undefined,
      general: ({ tx }) =>
        matchRecordUnion(tx, {
          evm: ({ gasLimit }) => gasLimit,
          solana: () => undefined,
        }),
    })

    return {
      coin: fromCoin,
      amount,
      receiver,
      data: matchRecordUnion(swapQuote, {
        native: ({ memo }) => memo,
        general: ({ tx }) => getRecordUnionValue(tx).data,
      }),
      thirdPartyGasLimitEstimation,
      isComplexTx: isChainOfKind(fromCoin.chain, 'utxo') ? true : undefined,
    }
  }, [fromAmount, fromCoin, swapQuote])

  return useFeeQuoteQuery(input)
}
