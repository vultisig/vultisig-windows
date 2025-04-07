import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { pick } from '@lib/utils/record/pick'

type KeygenReshareFields = {
  oldResharePrefix: string
  oldParties: string[]
  publicKeyEcdsa: string
}

export type KeygenVault =
  | {
      existingVault: Vault
    }
  | {
      newReshareVault: KeygenReshareFields & {
        name: string
      }
    }
  | {
      newVault: {
        name: string
      }
    }

export const { useValue: useKeygenVault, provider: KeygenVaultProvider } =
  getValueProviderSetup<KeygenVault>('KeygenVault')

export const useKeygenVaultName = () => {
  const keygenVault = useKeygenVault()

  return Object.values(keygenVault)[0].name
}

export const assertKeygenReshareFields = (
  keygenVault: KeygenVault
): KeygenReshareFields => {
  if ('newVault' in keygenVault) {
    throw new Error('keygen vault is not a reshare vault')
  }

  return matchRecordUnion(keygenVault, {
    existingVault: vault => ({
      publicKeyEcdsa: vault.publicKeys.ecdsa,
      oldResharePrefix: vault.resharePrefix,
      oldParties: vault.signers,
    }),
    newReshareVault: vault =>
      pick(vault, ['oldResharePrefix', 'oldParties', 'publicKeyEcdsa']),
  })
}
