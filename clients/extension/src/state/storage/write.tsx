import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
  CreateVaultFunction,
  UpdateVaultFunction,
} from '@core/ui/state/storage/write'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { setFiatCurrency } from '../../preferences/fiatCurrency'
import { setCurrentVaultId } from '../../vault/state/currentVaultId'
import { updateVaults } from '../../vault/state/vaults'
import { getVaults } from '../../vault/state/vaults'

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

const createVault: CreateVaultFunction = async vault => {
  const prevVaults = await getVaults()

  await updateVaults([
    ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
    vault,
  ])

  return vault
}

const writeStorage: CoreWriteStorage = {
  setFiatCurrency,
  setCurrentVaultId,
  updateVault,
  createVault,
}

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  return (
    <CoreWriteStorageProvider value={writeStorage}>
      {children}
    </CoreWriteStorageProvider>
  )
}
