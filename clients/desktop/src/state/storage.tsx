import { Chain } from '@core/chain/Chain'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { FiatCurrency } from '@core/config/FiatCurrency'
import {
  CoreStorage,
  CoreStorageProvider,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  CreateVaultFunction,
  DeleteVaultCoinFunction,
  DeleteVaultFolderFunction,
  DeleteVaultFunction,
  GetVaultFoldersFunction,
  GetVaultsCoinsFunction,
  GetVaultsFunction,
  UpdateVaultFolderFunction,
  UpdateVaultFunction,
} from '@core/ui/state/storage'
import { initialCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { initialDefaultChains } from '@core/ui/storage/defaultChains'
import { ChildrenProp } from '@lib/ui/props'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMemo } from 'react'

import {
  DeleteCoin,
  DeleteVault,
  DeleteVaultFolder,
  GetCoins,
  GetVault,
  GetVaultFolder,
  GetVaultFolders,
  GetVaults,
  SaveCoin,
  SaveCoins,
  SaveVault,
  SaveVaultFolder,
} from '../../wailsjs/go/storage/Store'
import { fromStorageCoin, toStorageCoin } from '../storage/storageCoin'
import { fromStorageVault, toStorageVault } from '../vault/utils/storageVault'
import { PersistentStateKey } from './persistentState'
import { usePersistentState } from './persistentState'

const updateVault: UpdateVaultFunction = async ({ vaultId, fields }) => {
  const oldStorageVault = await GetVault(vaultId)
  const oldVault = fromStorageVault(oldStorageVault)

  const newVault = { ...oldVault, ...fields }
  const newStorageVault = toStorageVault(newVault)

  await SaveVault(newStorageVault)

  return newVault
}

const createVault: CreateVaultFunction = async vault => {
  const storageVault = toStorageVault(vault)

  await SaveVault(storageVault)

  return vault
}

const createVaultCoins: CreateVaultCoinsFunction = async ({
  vaultId,
  coins,
}) => {
  await SaveCoins(vaultId, coins.map(toStorageCoin))
}

const getVaults: GetVaultsFunction = async () => {
  const storageVaults = (await GetVaults()) ?? []
  return storageVaults.map(fromStorageVault)
}

const getVaultsCoins: GetVaultsCoinsFunction = async () => {
  const coins = (await GetCoins()) ?? {}
  return recordMap(coins, coins => coins.map(fromStorageCoin))
}

const getVaultFolders: GetVaultFoldersFunction = async () => {
  const storageVaultFolders = (await GetVaultFolders()) ?? []
  return storageVaultFolders
}

const deleteVault: DeleteVaultFunction = async vaultId => {
  await DeleteVault(vaultId)
}

const deleteVaultFolder: DeleteVaultFolderFunction = async folderId => {
  await DeleteVaultFolder(folderId)
}

const createVaultCoin: CreateVaultCoinFunction = async ({ vaultId, coin }) => {
  await SaveCoin(vaultId, toStorageCoin(coin))
}

const updateVaultFolder: UpdateVaultFolderFunction = async ({ id, fields }) => {
  const folder = await GetVaultFolder(id)

  const updatedFolder = {
    ...folder,
    ...fields,
  }

  await SaveVaultFolder(updatedFolder)
}

const deleteVaultCoin: DeleteVaultCoinFunction = async ({
  vaultId,
  coinKey,
}) => {
  await DeleteCoin(vaultId, coinKeyToString(coinKey))
}

export const StorageProvider = ({ children }: ChildrenProp) => {
  const [fiatCurrency, setFiatCurrency] = usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
  const [currentVaultId, setCurrentVaultId] =
    usePersistentState<CurrentVaultId>(
      PersistentStateKey.CurrentVaultId,
      initialCurrentVaultId
    )
  const [defaultChains, setDefaultChains] = usePersistentState<Chain[]>(
    PersistentStateKey.DefaultChains,
    initialDefaultChains
  )

  const value: CoreStorage = useMemo(
    () => ({
      setFiatCurrency,
      setCurrentVaultId,
      updateVault,
      createVault,
      createVaultCoins,
      setDefaultChains,
      getDefaultChains: () => defaultChains,
      getFiatCurrency: () => fiatCurrency,
      getCurrentVaultId: () => currentVaultId,
      getVaults,
      getVaultsCoins,
      getVaultFolders,
      deleteVault,
      deleteVaultFolder,
      createVaultCoin,
      updateVaultFolder,
      deleteVaultCoin,
    }),
    [
      currentVaultId,
      defaultChains,
      fiatCurrency,
      setCurrentVaultId,
      setDefaultChains,
      setFiatCurrency,
    ]
  )

  return <CoreStorageProvider value={value}>{children}</CoreStorageProvider>
}
