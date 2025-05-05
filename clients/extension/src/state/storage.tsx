import { areEqualCoins } from '@core/chain/coin/Coin'
import {
  CoreStorage,
  CreateAddressBookItemFunction,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  CreateVaultFolderFunction,
  CreateVaultFunction,
  DeleteAddressBookItemFunction,
  DeleteVaultCoinFunction,
  DeleteVaultFolderFunction,
  DeleteVaultFunction,
  UpdateAddressBookItemFunction,
  UpdateVaultFolderFunction,
  UpdateVaultFunction,
} from '@core/ui/storage/CoreStorage'
import { getVaultId } from '@core/ui/vault/Vault'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import {
  getDefaultChains,
  setDefaultChains,
} from '../chain/state/defaultChains'
import { getFiatCurrency, setFiatCurrency } from '../preferences/fiatCurrency'
import {
  getAddressBookItems,
  updateAddressBookItems,
} from '../storage/addressBook'
import { getLanguage, setLanguage } from '../storage/language'
import {
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
} from '../storage/vaultBalanceVisibility'
import {
  getCurrentVaultId,
  setCurrentVaultId,
} from '../vault/state/currentVaultId'
import {
  getVaultFolders,
  updateVaultFolders,
} from '../vault/state/vaultFolders'
import { updateVaults } from '../vault/state/vaults'
import { getVaults } from '../vault/state/vaults'
import { getVaultsCoins } from '../vault/state/vaultsCoins'
import { updateVaultsCoins } from '../vault/state/vaultsCoins'

const updateVault: UpdateVaultFunction = async ({ vaultId, fields }) => {
  const vaults = await getVaults()
  const vaultIndex = shouldBePresent(
    vaults.findIndex(vault => getVaultId(vault) === vaultId)
  )

  const updatedVaults = updateAtIndex(vaults, vaultIndex, vault => ({
    ...vault,
    ...fields,
  }))

  await updateVaults(updatedVaults)

  return updatedVaults[vaultIndex]
}

const deleteVault: DeleteVaultFunction = async vaultId => {
  const vaults = await getVaults()

  await updateVaults(vaults.filter(v => getVaultId(v) !== vaultId))
}

const createVault: CreateVaultFunction = async vault => {
  const prevVaults = await getVaults()

  await updateVaults([
    ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
    vault,
  ])

  return vault
}

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

const updateVaultFolder: UpdateVaultFolderFunction = async ({ id, fields }) => {
  const vaultFolders = await getVaultFolders()
  const vaultFolderIndex = shouldBePresent(
    vaultFolders.findIndex(vaultFolder => vaultFolder.id === id)
  )

  const updatedVaultFolders = updateAtIndex(
    vaultFolders,
    vaultFolderIndex,
    vaultFolder => ({
      ...vaultFolder,
      ...fields,
    })
  )

  await updateVaultFolders(updatedVaultFolders)
}

const deleteVaultFolder: DeleteVaultFolderFunction = async folderId => {
  const folders = await getVaultFolders()
  await updateVaultFolders(folders.filter(folder => folder.id !== folderId))
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

const createVaultFolder: CreateVaultFolderFunction = async folder => {
  const folders = await getVaultFolders()
  await updateVaultFolders([...folders, folder])
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
  setFiatCurrency,
  setCurrentVaultId,
  getCurrentVaultId,
  updateVault,
  createVault,
  createVaultCoins,
  setDefaultChains,
  getDefaultChains,
  getFiatCurrency,
  getVaults,
  getVaultsCoins,
  getVaultFolders,
  deleteVault,
  deleteVaultFolder,
  createVaultCoin,
  updateVaultFolder,
  deleteVaultCoin,
  createVaultFolder,
  getAddressBookItems,
  createAddressBookItem,
  updateAddressBookItem,
  deleteAddressBookItem,
  getLanguage,
  setLanguage,
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
}
