import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { useCallback, useMemo } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { getKeysignFeeAmount } from '../../../mpc/keysign/fee/tronMemoFee'
import { useCurrentVaultPublicKey } from '../../state/currentVault'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { getSwapQuoteAffiliateBps } from '../affiliate/affiliateBps'
import { useSwapKeysignPayloadQuery } from '../keysignPayload/query'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { resolveSwapFees, SwapFeesBreakdown } from './resolveSwapFees'

export const useSwapFeesQuery = (swapQuote: SwapQuote) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const vaultCoins = useCurrentVaultCoins()
  const fromCoin = useMemo(
    () => vaultCoins.find(coin => areEqualCoins(coin, fromCoinKey)),
    [fromCoinKey, vaultCoins]
  )
  const toCoin = useMemo(
    () => vaultCoins.find(coin => areEqualCoins(coin, toCoinKey)),
    [toCoinKey, vaultCoins]
  )
  const keysignPayloadQuery = useSwapKeysignPayloadQuery(swapQuote)
  const publicKey = useCurrentVaultPublicKey(fromCoinKey.chain)
  const walletCore = useAssertWalletCore()
  const affiliateBps = getSwapQuoteAffiliateBps(swapQuote.discounts)

  return useTransformQueryDataAsync(
    keysignPayloadQuery,
    useCallback(
      async (keysignPayload): Promise<SwapFeesBreakdown> => {
        const { chain } = fromCoinKey
        const fromFeeCoin = chainFeeCoin[chain]

        const network = {
          ...fromFeeCoin,
          amount: await getKeysignFeeAmount({
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
          toCoin,
          fromCoin,
          affiliateBps,
        })
      },
      [
        affiliateBps,
        fromCoin,
        fromCoinKey,
        publicKey,
        swapQuote.quote,
        toCoin,
        toCoinKey,
        walletCore,
      ]
    ),
    [
      'swapFees',
      fromCoinKey,
      toCoinKey,
      fromCoin,
      toCoin,
      swapQuote.quote,
      affiliateBps,
    ]
  )
}
