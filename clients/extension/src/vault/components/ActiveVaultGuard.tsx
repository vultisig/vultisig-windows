import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { CurrentVaultCoinsProvider } from '@core/ui/vault/state/currentVaultCoins'
import { useCurrentVaultId } from '@core/ui/vault/state/currentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { FC, useEffect, useState } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

export const ActiveVaultGuard: FC<ChildrenProp> = ({ children }) => {
  const currentVaultId = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  const navigate = useAppNavigate()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkVault = async () => {
      if (isEmpty(vaults)) {
        navigate('landing')
        return
      }
      const foundVault = vaults.find(v => getVaultId(v) === currentVaultId)

      if (!foundVault) {
        navigate('landing')
      }
      setChecked(true)
    }
    checkVault()
  }, [currentVaultId, navigate, vaults])

  if (!checked || !vault) return null

  return (
    <CurrentVaultProvider value={vault}>
      <CurrentVaultCoinsProvider value={vault.coins}>
        {children}
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
