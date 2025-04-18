import {
  UpdateVaultFunction,
  UpdateVaultProvider as UpdateVaultProviderBase,
} from '@core/ui/vault/state/updateVault'
import { ChildrenProp } from '@lib/ui/props'

import { GetVault, SaveVault } from '../../../wailsjs/go/storage/Store'
import { fromStorageVault, toStorageVault } from '../utils/storageVault'

const updateVault: UpdateVaultFunction = async ({ vaultId, fields }) => {
  const oldStorageVault = await GetVault(vaultId)
  const oldVault = fromStorageVault(oldStorageVault)

  const newVault = { ...oldVault, ...fields }
  const newStorageVault = toStorageVault(newVault)

  await SaveVault(newStorageVault)

  return newVault
}

export const UpdateVaultProvider = ({ children }: ChildrenProp) => {
  return (
    <UpdateVaultProviderBase value={updateVault}>
      {children}
    </UpdateVaultProviderBase>
  )
}
