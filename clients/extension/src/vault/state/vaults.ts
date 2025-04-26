import { vaultsQueryKey } from '@core/ui/query/keys'
import { getVaultId, Vault } from '@core/ui/vault/Vault'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'
import { getVaultCoins } from './coins'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

const initialValue: Vault[] = []

const [key] = vaultsQueryKey

export const getVaults = async (): Promise<(Vault & { coins: AccountCoin[] })[]> => {
  const vaults = await getPersistentState<Vault[]>(key, initialValue)

  if (!vaults.length) {
    return []
  }

  const vaultCoins = await getVaultCoins()

  const vaultsWithCoins = vaults.map(vault => ({
    ...vault,
    coins: vaultCoins[getVaultId(vault)] ?? [],
  }))

  return vaultsWithCoins
}
// export const getVaults = async (): Promise<Vault[]> => {
//   const vaults = await getPersistentState<Vault[]>(key, initialValue)
//   console.log('getPersistentState:vaults:', vaults)
//   if (vaults.length === 0) {
//     return vaults
//   }
//   const vaultCoins = await getVaultCoins()
//   const vaultsWithCoins = vaults.map(vault => ({
//     ...vault,
//     coins: vaultCoins[getVaultId(vault)] ?? [],
//   }))

//   return vaultsWithCoins
// }

export const useVaultsMutation = () => {
  return usePersistentStateMutation<Vault[]>(key)
}

export const useVaultsQuery = () => {
  return usePersistentStateQuery<Vault[]>(key, [])
}
