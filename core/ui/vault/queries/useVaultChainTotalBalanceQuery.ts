import { usePortfolioVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'

import {
  TotalBalanceQuery,
  useCoinsTotalBalanceQuery,
} from './useCoinsTotalBalanceQuery'

/**
 * Total fiat balance for a single chain's portfolio coins, resolved
 * progressively. See {@link useCoinsTotalBalanceQuery} for the partial-sum /
 * `isUpdating` semantics.
 */
export const useVaultChainTotalBalanceQuery = (
  chain: Chain
): TotalBalanceQuery =>
  useCoinsTotalBalanceQuery(usePortfolioVaultChainCoins(chain))
