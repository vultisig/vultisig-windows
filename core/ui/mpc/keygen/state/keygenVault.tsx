import { Vault } from '@core/mpc/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

import { useCurrentVault } from '../../../vault/state/currentVault'

type KeygenReshareFields = {
  oldResharePrefix: string
  oldParties: string[]
  publicKeyEcdsa: string
  hexChainCode: string
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

export const [KeygenVaultProvider, useKeygenVault] =
  setupValueProvider<KeygenVault>('KeygenVault')

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
      oldResharePrefix: vault.resharePrefix ?? '',
      oldParties: vault.signers,
      hexChainCode: vault.hexChainCode,
    }),
    newReshareVault: vault =>
      pick(vault, [
        'oldResharePrefix',
        'oldParties',
        'publicKeyEcdsa',
        'hexChainCode',
      ]),
  })
}

export const CurrentKeygenVaultProvider = ({ children }: ChildrenProp) => {
  const vault = useCurrentVault()

  const keygenVault: KeygenVault = useMemo(
    () => ({
      existingVault: vault,
    }),
    [vault]
  )

  return (
    <KeygenVaultProvider value={keygenVault}>{children}</KeygenVaultProvider>
  )
}
