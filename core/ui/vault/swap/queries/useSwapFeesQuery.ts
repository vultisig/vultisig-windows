import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import {
  SwapQuote,
  SwapQuoteResult,
} from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFees } from '@vultisig/core-chain/swap/SwapFee'
import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { useCallback, useMemo } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultPublicKey } from '../../state/currentVault'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { useSwapKeysignPayloadQuery } from '../keysignPayload/query'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

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

        return matchRecordUnion<SwapQuoteResult, SwapFees>(swapQuote.quote, {
          native: ({ fees }) => {
            const swapAmount = BigInt(fees.total)

            return {
              swap: {
                ...toCoinKey,
                amount: swapAmount,
                decimals: getNativeSwapDecimals(toCoinKey),
              },
              network,
            }
          },
          general: ({ tx }) => {
            return matchRecordUnion(tx, {
              evm: ({ affiliateFee }) => ({
                network,
                ...(affiliateFee ? { swap: affiliateFee } : {}),
              }),
              solana: ({ networkFee, swapFee }) => ({
                network: {
                  chain: chain,
                  amount: BigInt(networkFee),
                  decimals: fromFeeCoin.decimals,
                },
                swap: swapFee,
              }),
              transfer: () => ({ network }),
              cowswap_order: ({ feeAmount }) => {
                const swapAmount = BigInt(feeAmount)

                return {
                  network,
                  ...(swapAmount > 0n && fromCoin
                    ? {
                        swap: {
                          chain: fromCoin.chain,
                          id: fromCoin.id,
                          amount: swapAmount,
                          decimals: fromCoin.decimals,
                        },
                      }
                    : {}),
                }
              },
            })
          },
        })
      },
      [fromCoin, fromCoinKey, publicKey, swapQuote.quote, toCoinKey, walletCore]
    ),
    ['swapFees', fromCoinKey, toCoinKey, fromCoin, swapQuote.quote]
  )
}
