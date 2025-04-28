import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

const initialValue: VaultCoinsRecord = {}

const vaultCoinsQueryKey = 'VaultCoins'

export const getVaultsCoins = async () =>
  getPersistentState(vaultCoinsQueryKey, initialValue)

export const useVaultCoinsMutation = () => {
  const { mutateAsync: setVaultCoins } =
    usePersistentStateMutation<VaultCoinsRecord>(vaultCoinsQueryKey)

  const updateVaultCoins = async (vaultId: string, coins: AccountCoin[]) => {
    const currentVaultCoins = await getVaultsCoins()

    const updatedVaultCoins = {
      ...currentVaultCoins,
      [vaultId]: coins,
    }

    await setVaultCoins(updatedVaultCoins)
  }

  return { mutateAsync: updateVaultCoins }
}

type VaultCoinsRecord = Record<string, AccountCoin[]>
