import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'

export const VaultOverviewPrimaryActions = () => {
  const chains = useCurrentVaultChains()

  if (isEmpty(chains)) {
    return null
  }

  return <VaultPrimaryActions fromChain={chains[0]} />
}
