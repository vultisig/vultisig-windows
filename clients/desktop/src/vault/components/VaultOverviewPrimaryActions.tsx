import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { depositEnabledChains } from '@core/ui/vault/deposit/DepositEnabledChain'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'

export const VaultOverviewPrimaryActions = () => {
  const chains = useCurrentVaultChains()
  // @tony: favour deposit enabled chain as a default to show more primary actions
  const depositEnabledChain = chains.find(chain =>
    depositEnabledChains.includes(chain)
  )

  if (isEmpty(chains)) {
    return null
  }

  return <VaultPrimaryActions fromChain={depositEnabledChain || chains[0]} />
}
