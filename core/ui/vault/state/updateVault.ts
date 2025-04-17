import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { Vault } from '../Vault'

export type UpdateVaultInput = {
  vaultId: string
  fields: Partial<Vault>
}

export type UpdateVaultFunction = (input: UpdateVaultInput) => Promise<Vault>

export const { useValue: useUpdateVault, provider: UpdateVaultProvider } =
  getValueProviderSetup<UpdateVaultFunction>('UpdateVault')
