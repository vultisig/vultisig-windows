import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFees } from '@vultisig/core-chain/swap/SwapFee'
import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { useCallback, useMemo } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultPublicKey } from '../../state/currentVault'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { useSwapKeysignPayloadQuery } from '../keysignPayload/query'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { resolveSwapFees } from './resolveSwapFees'

export const useSwapFeesQuery = (swapQuote: SwapQuote) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const vaultCoins = useCurrentVaultCoins()
  const fromCoin = useMemo(
    () => vaultCoins.find(coin => areEqualCoins(coin, fromCoinKey)),
    [fromCoinKey, vaultCoins]
  )
  const keysignPayloadQuery = useSwapKeysignPayloadQuery(swapQuote)
  const publicKey = useCurrentVaultPublicKey(fromCoinKey.chain)
  const walletCore = useAssertWalletCore()

  return useTransformQueryDataAsync(
    keysignPayloadQuery,
    useCallback(
      async (keysignPayload): Promise<SwapFees> => {
        const { chain } = fromCoinKey
        const fromFeeCoin = chainFeeCoin[chain]

        const network = {
          ...fromFeeCoin,
          amount: await getFeeAmount({
            keysignPayload,
            walletCore,
            publicKey,
          }),
          decimals: fromFeeCoin.decimals,
        }

        return resolveSwapFees({
          quote: swapQuote.quote,
          network,
          toCoinKey,
          fromCoin,
        })
      },
      [fromCoin, fromCoinKey, publicKey, swapQuote.quote, toCoinKey, walletCore]
    ),
    ['swapFees', fromCoinKey, toCoinKey, fromCoin, swapQuote.quote]
  )
}
