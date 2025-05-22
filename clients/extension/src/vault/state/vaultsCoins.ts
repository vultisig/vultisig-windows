import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

type VaultsCoins = Record<string, AccountCoin[]>

const initialValue: VaultsCoins = {}

export const getVaultsCoins = async () =>
  getPersistentState(StorageKey.vaultsCoins, initialValue)

export const updateVaultsCoins = async (vaultsCoins: VaultsCoins) => {
  await setPersistentState(StorageKey.vaultsCoins, vaultsCoins)
}
