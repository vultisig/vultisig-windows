import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { FC, useEffect } from 'react'

import { useCoreNavigate } from '../navigation/hooks/useCoreNavigate'

export const ActiveVaultGuard: FC<ChildrenProp> = ({ children }) => {
  const currentVaultId = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  const navigate = useCoreNavigate()

  const isDisabled = !vault

  useEffect(() => {
    if (isDisabled) {
      // TODO: replace with 'newVault' route after @ehsanst rearranges routes
      navigate('setupVault', { params: {} })
    }
  }, [isDisabled, navigate])

  if (isDisabled) {
    return null
  }

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}
