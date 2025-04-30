import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { vaultsCoinsQueryKey } from '@core/ui/query/keys'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

type VaultsCoins = Record<string, AccountCoin[]>

const initialValue: VaultsCoins = {}

const [key] = vaultsCoinsQueryKey

export const getVaultsCoins = async () => getPersistentState(key, initialValue)

export const updateVaultsCoins = async (vaultsCoins: VaultsCoins) => {
  await setPersistentState(key, vaultsCoins)
}
