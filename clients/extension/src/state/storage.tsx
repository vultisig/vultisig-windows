import { Chain } from '@core/chain/chain'
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
import { getInitialView } from '../navigation/state'
import { getFiatCurrency, setFiatCurrency } from '../preferences/fiatCurrency'
import {
  getAddressBookItems,
  updateAddressBookItems,
} from '../storage/addressBook'
import { getLanguage, setLanguage } from '../storage/language'
import {
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
} from '../storage/onboarding'
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

  // Default chains that should be visible on import
  // Set new coins as visible only if they are default chains
  const defaultChains = [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.THORChain,
    Chain.Solana,
    Chain.BSC,
  ]
  const newCoins = coins.map(coin => {
    const prev = prevVaultsCoins[vaultId]?.find(c => areEqualCoins(c, coin))
    return {
      ...coin,
      hidden: prev?.hidden ?? !defaultChains.includes(coin.chain), // fall back to default rule
    }
  })

  await updateVaultsCoins({
    ...prevVaultsCoins,
    [vaultId]: [...prevCoins, ...newCoins],
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
  const vaults = await getVaults()

  // Update vaults to remove folder reference
  const updatedVaults = vaults.map(vault =>
    vault.folderId === folderId ? { ...vault, folderId: undefined } : vault
  )

  await updateVaults(updatedVaults)
  await updateVaultFolders(folders.filter(folder => folder.id !== folderId))
}

const createVaultCoin: CreateVaultCoinFunction = async ({ vaultId, coin }) => {
  const prevVaultsCoins = await getVaultsCoins()
  const prevCoins = prevVaultsCoins[vaultId] ?? []

  const existingCoin = prevCoins.find(c => areEqualCoins(c, coin))
  if (existingCoin) {
    // If coin exists but is hidden make it visible
    if (existingCoin.hidden) {
      const updatedCoins = prevCoins.map(c =>
        areEqualCoins(c, coin) ? { ...c, hidden: false } : c
      )
      await updateVaultsCoins({
        ...prevVaultsCoins,
        [vaultId]: updatedCoins,
      })
    }
    return
  }

  const newCoin = { ...coin, hidden: false }
  await updateVaultsCoins({
    ...prevVaultsCoins,
    [vaultId]: [...prevCoins, newCoin],
  })
}

const deleteVaultCoin: DeleteVaultCoinFunction = async ({
  vaultId,
  coinKey,
}) => {
  const vaultsCoins = await getVaultsCoins()

  const updatedCoins = vaultsCoins[vaultId].map(coin => {
    if (areEqualCoins(coin, coinKey)) {
      return {
        ...coin,
        hidden: true, // Mark coin as hidden
      }
    }
    return coin
  })

  await updateVaultsCoins({
    ...vaultsCoins,
    [vaultId]: updatedCoins,
  })
}

const createVaultFolder: CreateVaultFolderFunction = async folder => {
  const folders = await getVaultFolders()
  await updateVaultFolders([...folders, folder])
  if (folder.vaultIds?.length) {
    const vaults = await getVaults()
    const updatedVaults = vaults.map(vault => {
      if (folder.vaultIds?.includes(getVaultId(vault))) {
        return { ...vault, folderId: folder.id }
      }
      return vault
    })
    await updateVaults(updatedVaults)
  }
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
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
  getInitialView,
}
