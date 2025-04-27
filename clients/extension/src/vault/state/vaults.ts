import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { getVaultId, Vault } from '@core/ui/vault/Vault'

import { getVaultsCoins } from './coins'

const initialValue: Vault[] = []

const [key] = vaultsQueryKey

export const getVaults = async (): Promise<
  (Vault & { coins: AccountCoin[] })[]
> => {
  const vaults = await getPersistentState<Vault[]>(key, initialValue)

  if (!vaults.length) {
    return []
  }

  const vaultCoins = await getVaultsCoins()

  const vaultsWithCoins = vaults.map(vault => ({
    ...vault,
    coins: vaultCoins[getVaultId(vault)] ?? [],
  }))

  return vaultsWithCoins
}

export const useVaultsMutation = () => {
  return usePersistentStateMutation<Vault[]>(key)
}
