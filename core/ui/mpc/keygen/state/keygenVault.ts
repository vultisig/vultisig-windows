import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export type KeygenVault =
  | {
      existingVault: Vault
    }
  | {
      newReshareVault: {
        oldResharePrefix: string
        oldParties: string[]
      }
    }

export const { useValue: useKeygenVault, provider: KeygenVaultProvider } =
  getValueProviderSetup<KeygenVault | null>('KeygenVault')
