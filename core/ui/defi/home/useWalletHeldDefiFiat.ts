import { useDefiChains } from '@core/ui/storage/defiChains'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { areEqualCoins, Coin } from '@vultisig/core-chain/coin/Coin'
import { sum } from '@vultisig/lib-utils/array/sum'

import { thorchainTokens } from '../chain/queries/tokens'
import { useThorchainDefiPositionsQuery } from '../chain/queries/useThorchainDefiPositionsQuery'

/** Positions read from a receipt token's bank balance, which the wallet total already counts when held as a coin. */
const walletReceiptCoinByPositionId: Record<string, Coin> = {
  'thor-stake-stcy': thorchainTokens.stcy,
  'thor-stake-yrune': thorchainTokens.yRune,
  'thor-stake-ytcy': thorchainTokens.yTcy,
}

/** Fiat the wallet total already counts; mirrors the selection `aggregateDefiPositions` sums. */
export const useWalletHeldDefiFiat = () => {
  const enabledChains = useDefiChains()
  const selectedPositionIds = useDefiPositions(Chain.THORChain)
  const { data } = useThorchainDefiPositionsQuery()
  const portfolioCoins = usePortfolioVaultCoins()

  if (!enabledChains.includes(Chain.THORChain) || !data?.stake) return 0

  return sum(
    data.stake.positions
      .filter(({ id, amount }) => {
        const receiptCoin = walletReceiptCoinByPositionId[id]

        return (
          receiptCoin !== undefined &&
          amount > 0n &&
          selectedPositionIds.includes(id) &&
          portfolioCoins.some(coin => areEqualCoins(coin, receiptCoin))
        )
      })
      .map(({ fiatValue }) => fiatValue)
  )
}
