import { useDefiChains } from '@core/ui/storage/defiChains'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { areEqualCoins, Coin } from '@vultisig/core-chain/coin/Coin'
import { sum } from '@vultisig/lib-utils/array/sum'

import { thorchainTokens } from '../chain/queries/tokens'
import { useThorchainDefiPositionsQuery } from '../chain/queries/useThorchainDefiPositionsQuery'

/**
 * THORChain stake positions read straight from a receipt token's bank
 * balance. When the vault also holds that token as a wallet coin, the wallet
 * total already counts it.
 */
const walletReceiptCoinByPositionId: Record<string, Coin> = {
  'thor-stake-stcy': thorchainTokens.stcy,
  'thor-stake-yrune': thorchainTokens.yRune,
  'thor-stake-ytcy': thorchainTokens.yTcy,
}

/**
 * The part of the DeFi total, in fiat, that the wallet total already counts:
 * selected receipt-token positions whose token is one of the vault's
 * portfolio coins. Mirrors the selection `aggregateDefiPositions` sums.
 */
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
