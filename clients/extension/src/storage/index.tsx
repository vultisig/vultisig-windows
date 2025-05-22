import { areEqualCoins } from '@core/chain/coin/Coin'
import {
  CoreStorage,
  CreateAddressBookItemFunction,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  DeleteAddressBookItemFunction,
  DeleteVaultCoinFunction,
  UpdateAddressBookItemFunction,
} from '@core/ui/storage/CoreStorage'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getDefaultChains } from '../chain/state/defaultChains'
import { getInitialView } from '../navigation/state'
import { getVaultsCoins } from '../vault/state/vaultsCoins'
import { updateVaultsCoins } from '../vault/state/vaultsCoins'
import { getAddressBookItems, updateAddressBookItems } from './addressBook'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { currentVaultIdStorage } from './currentVaultId'
import { fiatCurrencyStorage } from './fiatCurrency'
import { getLanguage, setLanguage } from './language'
import {
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
} from './onboarding'
import {
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
} from './vaultBalanceVisibility'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

const createVaultCoins: CreateVaultCoinsFunction = async ({
  vaultId,
  coins,
}) => {
  const prevVaultsCoins = await getVaultsCoins()

  const prevCoins = (prevVaultsCoins[vaultId] ?? []).filter(existingCoin =>
    coins.every(coin => !areEqualCoins(existingCoin, coin))
  )

  await updateVaultsCoins({
    ...prevVaultsCoins,
    [vaultId]: [...prevCoins, ...coins],
  })
}

const createVaultCoin: CreateVaultCoinFunction = async ({ vaultId, coin }) => {
  await createVaultCoins({ vaultId, coins: [coin] })
}

const deleteVaultCoin: DeleteVaultCoinFunction = async ({
  vaultId,
  coinKey,
}) => {
  const vaultsCoins = await getVaultsCoins()

  await updateVaultsCoins({
    ...vaultsCoins,
    [vaultId]: vaultsCoins[vaultId].filter(
      coin => !areEqualCoins(coin, coinKey)
    ),
  })
}

const createAddressBookItem: CreateAddressBookItemFunction = async item => {
  const items = await getAddressBookItems()
  await updateAddressBookItems([...items, item])
}

const updateAddressBookItem: UpdateAddressBookItemFunction = async ({
  id,
  fields,
}) => {
  const items = await getAddressBookItems()
  const itemIndex = shouldBePresent(items.findIndex(item => item.id === id))

  const updatedAddressBookItems = updateAtIndex(items, itemIndex, item => ({
    ...item,
    ...fields,
  }))

  await updateAddressBookItems(updatedAddressBookItems)
}

const deleteAddressBookItem: DeleteAddressBookItemFunction = async itemId => {
  const items = await getAddressBookItems()
  await updateAddressBookItems(items.filter(i => i.id !== itemId))
}

export const storage: CoreStorage = {
  ...coinFinderIgnoreStorage,
  ...fiatCurrencyStorage,
  ...currentVaultIdStorage,
  ...vaultsStorage,
  ...vaultFoldersStorage,
  createVaultCoins,
  getDefaultChains,
  getVaultsCoins,
  createVaultCoin,
  deleteVaultCoin,
  getAddressBookItems,
  createAddressBookItem,
  updateAddressBookItem,
  deleteAddressBookItem,
  getLanguage,
  setLanguage,
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
  getInitialView,
}
