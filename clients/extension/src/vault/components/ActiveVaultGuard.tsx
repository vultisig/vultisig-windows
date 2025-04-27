import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { CurrentVaultCoinsProvider } from '@core/ui/vault/state/currentVaultCoins'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useEffect, useState } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { CoinFinder } from '../chain/coin/finder/CoinFinder'
import { useVaultCoinsQuery } from '../state/coins'
import { useCurrentVaultId } from '../state/currentVaultId'

export const ActiveVaultGuard: React.FC<ChildrenProp> = ({ children }) => {
  const [currentVaultId, , loading, ready] = useCurrentVaultId()
  const navigate = useAppNavigate()
  const vaults = useVaults()
  const [vault, setVault] = useState<Vault | null>(null)
  const [checked, setChecked] = useState(false)
  const { data: vaultCoinsRecord = {} } = useVaultCoinsQuery()
  const coins = (vault && vaultCoinsRecord[getVaultId(vault)]) ?? []
  useEffect(() => {
    const checkVault = async () => {
      if (loading || !ready) return

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
  }, [currentVaultId, navigate, loading, ready, vaults])

  if (loading || !checked || !vault) return null

  return (
    <CurrentVaultProvider value={vault}>
      <CurrentVaultCoinsProvider value={coins}>
        <CoinFinder />
        {children}
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
