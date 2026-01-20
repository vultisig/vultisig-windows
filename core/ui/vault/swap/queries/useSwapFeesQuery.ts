import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getNativeSwapDecimals } from '@core/chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuote, SwapQuoteResult } from '@core/chain/swap/quote/SwapQuote'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { getFeeAmount } from '@core/mpc/keysign/fee'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultPublicKey } from '../../state/currentVault'
import { useSwapKeysignPayloadQuery } from '../keysignPayload/query'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

export const useSwapFeesQuery = (swapQuote: SwapQuote) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const keysignPayloadQuery = useSwapKeysignPayloadQuery(swapQuote)
  const publicKey = useCurrentVaultPublicKey(fromCoinKey.chain)
  const walletCore = useAssertWalletCore()

  return useTransformQueryData(
    keysignPayloadQuery,
    (keysignPayload): SwapFees => {
      const { chain } = fromCoinKey
      const fromFeeCoin = chainFeeCoin[chain]

      const network = {
        ...fromFeeCoin,
        amount: getFeeAmount({
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
            evm: () => ({
              network,
            }),
            solana: ({ networkFee, swapFee }) => ({
              network: {
                chain: chain,
                amount: BigInt(networkFee),
                decimals: fromFeeCoin.decimals,
              },
              swap: swapFee,
            }),
          })
        },
      })
    }
  )
}
