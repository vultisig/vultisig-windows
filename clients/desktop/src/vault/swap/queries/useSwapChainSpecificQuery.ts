import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/ChainSpecificResolver'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields'
import { toHexPublicKey } from '../../../chain/utils/toHexPublicKey'
import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery'
import { useVaultPublicKeyQuery } from '../../publicKey/queries/useVaultPublicKeyQuery'
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

  const fromCoinPublicKeyQuery = useVaultPublicKeyQuery(fromCoin.chain)
  const toCoinPublicKeyQuery = useVaultPublicKeyQuery(toCoin.chain)

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
      fromPublicKey: fromCoinPublicKeyQuery.data,
      toPublicKey: toCoinPublicKeyQuery.data,
    },
    getQuery: ({ swapQuote, fromAmount, fromPublicKey, toPublicKey }) => {
      const { toAddress } = getSwapKeysignPayloadFields({
        amount: toChainAmount(fromAmount, fromCoin.decimals),
        quote: swapQuote,
        fromCoin: {
          ...fromCoin,
          hexPublicKey: toHexPublicKey({
            publicKey: fromPublicKey,
            walletCore,
          }),
        },
        toCoin: {
          ...toCoin,
          hexPublicKey: toHexPublicKey({
            publicKey: toPublicKey,
            walletCore,
          }),
        },
      })

      const input: ChainSpecificResolverInput = {
        coin: fromCoin,
        amount: fromAmount,
        receiver: toAddress,
      }

      if ('native' in swapQuote) {
        const { swapChain } = swapQuote.native
        const nativeFeeCoin = chainFeeCoin[swapChain]

        input.isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin)
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
