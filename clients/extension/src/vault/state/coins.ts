import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

const initialValue: VaultCoinsRecord = {}

export const vaultCoinsQueryKey = 'VaultCoins'

export const getVaultCoins = async () =>
  getPersistentState(vaultCoinsQueryKey, initialValue)

export const useVaultCoinsMutation = () => {
  const { mutateAsync: setVaultCoins } =
    usePersistentStateMutation<VaultCoinsRecord>(vaultCoinsQueryKey)

  const updateVaultCoins = async (vaultId: string, coins: AccountCoin[]) => {
    const currentVaultCoins = await getVaultCoins()

    const updatedVaultCoins = {
      ...currentVaultCoins,
      [vaultId]: coins,
    }

    await setVaultCoins(updatedVaultCoins)
  }

  return { mutateAsync: updateVaultCoins }
}

export const useVaultCoinsQuery = () => {
  return usePersistentStateQuery<VaultCoinsRecord>(vaultCoinsQueryKey, {})
}

export type VaultCoinsRecord = Record<string, AccountCoin[]>
