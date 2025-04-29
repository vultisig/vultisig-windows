import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
  UpdateVaultFunction,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { GetVault, SaveVault } from '../../../wailsjs/go/storage/Store'
import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
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

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  const [, setFiatCurrency] = useFiatCurrency()
  const [, setCurrentVaultId] = useCurrentVaultId()

  const value: CoreWriteStorage = useMemo(
    () => ({ setFiatCurrency, setCurrentVaultId, updateVault }),
    [setFiatCurrency, setCurrentVaultId]
  )

  return (
    <CoreWriteStorageProvider value={value}>
      {children}
    </CoreWriteStorageProvider>
  )
}
