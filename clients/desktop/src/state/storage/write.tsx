import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
  CreateVaultCoinsFunction,
  CreateVaultFunction,
  UpdateVaultFunction,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import {
  GetVault,
  SaveCoins,
  SaveVault,
} from '../../../wailsjs/go/storage/Store'
import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
import { toStorageCoin } from '../../storage/storageCoin'
import { useCurrentVaultId } from '../../vault/state/currentVaultId'
import {
  fromStorageVault,
  toStorageVault,
} from '../../vault/utils/storageVault'

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

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  const [, setFiatCurrency] = useFiatCurrency()
  const [, setCurrentVaultId] = useCurrentVaultId()

  const value: CoreWriteStorage = useMemo(
    () => ({
      setFiatCurrency,
      setCurrentVaultId,
      updateVault,
      createVault,
      createVaultCoins,
    }),
    [setFiatCurrency, setCurrentVaultId]
  )

  return (
    <CoreWriteStorageProvider value={value}>
      {children}
    </CoreWriteStorageProvider>
  )
}
