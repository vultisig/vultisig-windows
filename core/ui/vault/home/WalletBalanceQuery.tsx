import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'

import { RenderHomeBalance } from './renderHomeBalance'

type WalletBalanceQueryProps = {
  children: RenderHomeBalance
}

/** Hands the wallet total to `children`. */
export const WalletBalanceQuery = ({ children }: WalletBalanceQueryProps) => (
  <>{children(useVaultTotalBalanceQuery())}</>
)
