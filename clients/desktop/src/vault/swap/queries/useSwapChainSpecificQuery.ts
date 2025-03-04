import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoChain } from '@core/chain/Chain'
import { getChainSpecific } from '@core/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/keysign/chainSpecific/ChainSpecificResolver'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields'
import { isNativeSwapDeposit } from '../../../chain/swap/native/utils/isNativeSwapDeposit'
import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery'
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { useFromAmount } from '../state/fromAmount'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapChainSpecificQuery = () => {
  const [fromCoinKey] = useFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ swapQuote, fromAmount }) => {
      const { toAddress } = getSwapKeysignPayloadFields({
        amount: toChainAmount(fromAmount, fromCoin.decimals),
        quote: swapQuote,
        fromCoin,
        toCoin: toCoin,
      })

      const input: ChainSpecificResolverInput = {
        coin: fromCoin,
        amount: fromAmount,
        receiver: toAddress,
      }

      if ('native' in swapQuote) {
        const { swapChain } = swapQuote.native

        input.isDeposit = isNativeSwapDeposit({
          fromCoin,
          swapChain,
        })
      }

      if (isOneOf(fromCoin.chain, Object.values(UtxoChain))) {
        input.feeSettings = {
          priority: 'fast',
        }
      }

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: () => getChainSpecific(input),
      }
    },
  })
}
