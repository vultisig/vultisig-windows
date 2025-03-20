import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useVaults } from '../queries/useVaultsQuery'
import { CurrentVaultProvider } from '../state/currentVault'
import { useCurrentVaultId } from '../state/currentVaultId'
import { getStorageVaultId } from '../utils/storageVault'

export const ActiveVaultGuard: React.FC<ChildrenProp> = ({ children }) => {
  const [currentVaultId] = useCurrentVaultId()
  const vaults = useVaults()

  const navigate = useAppNavigate()

  const vault = vaults.find(
    vault => getStorageVaultId(vault) === currentVaultId
  )

  const isDisabled = !vault

  useEffect(() => {
    if (isDisabled) {
      navigate('root')
    }
  }, [isDisabled, navigate])

  if (isDisabled) {
    return null
  }

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}
