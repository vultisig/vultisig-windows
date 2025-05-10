import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/ChainSpecificResolver'
import { getChainSpecificQueryKey } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useToCoin } from '../state/toCoin'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapChainSpecificQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const walletCore = useAssertWalletCore()

  const vault = useCurrentVault()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ swapQuote, fromAmount }) => {
      const fromPublicKey = getPublicKey({
        chain: fromCoin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      const toPublicKey = getPublicKey({
        chain: toCoin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

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
