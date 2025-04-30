import {
  CoreStorage,
  CoreStorageProvider,
  CreateVaultCoinsFunction,
  CreateVaultFunction,
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

  const prevVaultCoinis = prevVaultsCoins[vaultId] ?? []

  await updateVaultsCoins({
    ...prevVaultsCoins,
    [vaultId]: [...prevVaultCoinis, ...coins],
  })
}

const writeStorage: CoreStorage = {
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
}

export const StorageProvider = ({ children }: ChildrenProp) => {
  return (
    <CoreStorageProvider value={writeStorage}>{children}</CoreStorageProvider>
  )
}
