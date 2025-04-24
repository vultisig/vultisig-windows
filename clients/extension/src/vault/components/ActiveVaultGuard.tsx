import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { FC, useEffect } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '../state/currentVaultId'

export const ActiveVaultGuard: FC<ChildrenProp> = ({ children }) => {
  const [currentVaultId] = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  const navigate = useAppNavigate()

  const isDisabled = !vault

  useEffect(() => {
    if (isDisabled) {
      navigate('setupVault', { params: {} })
    }
  }, [isDisabled, navigate])

  if (isDisabled) {
    return null
  }

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}
