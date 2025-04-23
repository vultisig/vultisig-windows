import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useEffect, useState } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '../state/currentVaultId'
import { getVaults } from '../state/vaults'

export const ActiveVaultGuard: React.FC<ChildrenProp> = ({ children }) => {
  const [currentVaultId, , loading] = useCurrentVaultId()
  const navigate = useAppNavigate()
  const [vault, setVault] = useState<Vault | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkVault = async () => {
      if (loading) return
      const vaults = await getVaults()

      if (isEmpty(vaults)) {
        navigate('landing')
        return
      }
      const foundVault = vaults.find(v => getVaultId(v) === currentVaultId)

      if (!foundVault) {
        navigate('landing')
      } else {
        setVault(foundVault)
      }

      setChecked(true)
    }

    checkVault()
  }, [currentVaultId, navigate, loading])

  if (loading || !checked || !vault) return null

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}
