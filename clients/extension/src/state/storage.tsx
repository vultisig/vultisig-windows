import { areEqualCoins } from '@core/chain/coin/Coin'
import {
  CoreStorage,
  CoreStorageProvider,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  CreateVaultFunction,
  DeleteVaultFolderFunction,
  DeleteVaultFunction,
  UpdateVaultFolderFunction,
  UpdateVaultFunction,
} from '@core/ui/state/storage'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import {
  getDefaultChains,
  setDefaultChains,
} from '../chain/state/defaultChains'
import { getFiatCurrency, setFiatCurrency } from '../preferences/fiatCurrency'
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
    coins.some(coin => areEqualCoins(existingCoin, coin))
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

const storage: CoreStorage = {
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
}

export const StorageProvider = ({ children }: ChildrenProp) => {
  return <CoreStorageProvider value={storage}>{children}</CoreStorageProvider>
}
