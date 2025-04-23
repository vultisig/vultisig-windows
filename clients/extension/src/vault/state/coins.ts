import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

const initialValue: VaultCoinsRecord = {}

export const vaultCoinsQueryKey = 'VaultCoins'

export const getVaultCoins = async () =>
  getPersistentState(vaultCoinsQueryKey, initialValue)

export const useVaultCoinsMutation = () => {
  return usePersistentStateMutation<VaultCoinsRecord>(vaultCoinsQueryKey)
}

export const useVaultCoinsQuery = () => {
  return usePersistentStateQuery<VaultCoinsRecord>(vaultCoinsQueryKey, {})
}

export type VaultCoinsRecord = Record<string, AccountCoin[]>
