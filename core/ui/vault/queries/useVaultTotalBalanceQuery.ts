import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'

import {
  TotalBalanceQuery,
  useCoinsTotalBalanceQuery,
} from './useCoinsTotalBalanceQuery'

/**
 * Vault total balance, resolved progressively across every portfolio coin. See
 * {@link useCoinsTotalBalanceQuery} for the partial-sum / `isUpdating` semantics.
 */
export const useVaultTotalBalanceQuery = (): TotalBalanceQuery =>
  useCoinsTotalBalanceQuery(usePortfolioVaultCoins())
