import { Chain } from '@core/chain/Chain'
import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { FiatCurrency } from '@core/config/FiatCurrency'
import {
  CoreStorage,
  CoreStorageProvider,
  CreateVaultCoinsFunction,
  CreateVaultFunction,
  UpdateVaultFunction,
} from '@core/ui/state/storage'
import { initialDefaultChains } from '@core/ui/vault/state/defaultChains'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { GetVault, SaveCoins, SaveVault } from '../../wailsjs/go/storage/Store'
import { toStorageCoin } from '../storage/storageCoin'
import { useCurrentVaultId } from '../vault/state/currentVaultId'
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

export const StorageProvider = ({ children }: ChildrenProp) => {
  const [fiatCurrency, setFiatCurrency] = usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
  const [, setCurrentVaultId] = useCurrentVaultId()
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
    }),
    [
      setFiatCurrency,
      setCurrentVaultId,
      setDefaultChains,
      defaultChains,
      fiatCurrency,
    ]
  )

  return <CoreStorageProvider value={value}>{children}</CoreStorageProvider>
}
