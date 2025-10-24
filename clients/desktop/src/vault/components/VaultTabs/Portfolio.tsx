import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { List } from '@lib/ui/list'

import { VaultChainItem } from '../VaultChainItem'

export const Portfolio = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()

  return (
    <List>
      {vaultChainBalances.map(balance => (
        <VaultChainItem key={balance.chain} balance={balance} />
      ))}
    </List>
  )
}
