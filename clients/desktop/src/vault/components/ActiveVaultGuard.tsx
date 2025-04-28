import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { CurrentVaultCoinsProvider } from '@core/ui/vault/state/currentVaultCoins'
import { useCurrentVaultId } from '@core/ui/vault/state/currentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { CoinFinder } from '../chain/coin/finder/CoinFinder'

export const ActiveVaultGuard: React.FC<ChildrenProp> = ({ children }) => {
  const currentVaultId = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  const navigate = useAppNavigate()

  const isDisabled = !vault

  useEffect(() => {
    if (isDisabled) {
      navigate('root')
    }
  }, [isDisabled, navigate])

  if (isDisabled) {
    return null
  }

  return (
    <CurrentVaultProvider value={vault}>
      <CurrentVaultCoinsProvider value={vault.coins}>
        <CoinFinder />
        {children}
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
