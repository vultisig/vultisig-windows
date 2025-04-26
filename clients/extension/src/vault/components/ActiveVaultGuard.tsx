import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useEffect, useState } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '../state/currentVaultId'

import { CurrentVaultCoinsProvider } from '@clients/desktop/src/vault/state/currentVaultCoins'
import { useVaults } from '@core/ui/vault/state/vaults'

import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CoinFinder } from '../chain/coin/finder/CoinFinder'
export const ActiveVaultGuard: React.FC<ChildrenProp> = ({ children }) => {
  const [currentVaultId, , loading, ready] = useCurrentVaultId()
  const navigate = useAppNavigate()
  const vaults = useVaults()
  const [vault, setVault] = useState<
    | (Vault & {
        coins: AccountCoin[]
      })
    | null
  >(null)
  const [checked, setChecked] = useState(false)

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
      <CurrentVaultCoinsProvider value={vault.coins}>
        <CoinFinder />
        {children}
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
