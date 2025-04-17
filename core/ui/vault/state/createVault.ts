import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { Vault } from '../Vault'

export type CreateVaultFunction = (vault: Vault) => Promise<Vault>

export const { useValue: useCreateVault, provider: CreateVaultProvider } =
  getValueProviderSetup<CreateVaultFunction>('CreateVault')
