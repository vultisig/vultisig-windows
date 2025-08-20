import { areEqualCoins } from '@core/chain/coin/Coin'
import {
  CoinsRecord,
  CoinsStorage,
  CreateCoinsFunction,
  initialCoinsRecord,
} from '@core/ui/storage/coins'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const getCoins = async () =>
  getStorageValue(StorageKey.vaultsCoins, initialCoinsRecord)

export const updateCoins = async (coins: CoinsRecord) => {
  await setStorageValue(StorageKey.vaultsCoins, coins)
}

const createCoins: CreateCoinsFunction = async ({ vaultId, coins }) => {
  const prevCoinsRecord = await getCoins()

  const prevCoins = (prevCoinsRecord[vaultId] ?? []).filter(existingCoin =>
    coins.every(coin => !areEqualCoins(existingCoin, coin))
  )

  await updateCoins({
    ...prevCoinsRecord,
    [vaultId]: [...prevCoins, ...coins],
  })
}

export const coinsStorage: CoinsStorage = {
  createCoins,
  createCoin: async ({ vaultId, coin }) => {
    await createCoins({ vaultId, coins: [coin] })
  },
  deleteCoin: async ({ vaultId, coinKey }) => {
    const coins = await getCoins()

    await updateCoins({
      ...coins,
      [vaultId]: coins[vaultId].filter(coin => !areEqualCoins(coin, coinKey)),
    })
  },
  getCoins,
}
