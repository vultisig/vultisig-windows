import {
  KeygenAction,
  KeygenActionProvider,
} from '@core/ui/mpc/keygen/state/keygenAction'
import {
  KeygenVault,
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { getLastItemOrder } from '@core/ui/utils/order/getLastItemOrder'
import { ChildrenProp } from '@lib/ui/props'
import { keygenSteps } from '@vultisig/core-mpc/keygen/KeygenStep'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { EventsOff, EventsOn } from '@wailsapp/runtime'
import { useCallback } from 'react'

import { storage } from '../../../../wailsjs/go/models'
import { Reshare } from '../../../../wailsjs/go/tss/TssService'
import { fromStorageVault, toStorageVault } from '../../utils/storageVault'

export const ReshareVaultLegacyKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const keygenVault = useKeygenVault()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange }) => {
      keygenSteps.forEach(step => {
        EventsOn(step, () => onStepChange(step))
      })

      const libType: MpcLib = 'GG20'

      const sharedFinalVaultFields = {
        localPartyId,
        libType,
        isBackedUp: false,
      }

      try {
        return matchRecordUnion<KeygenVault, Promise<Vault>>(keygenVault, {
          existingVault: async existingVault => {
            const storageVault = await Reshare(
              toStorageVault(existingVault),
              sessionId,
              encryptionKeyHex,
              serverUrl
            )

            return {
              ...existingVault,
              ...fromStorageVault(storageVault),
              ...sharedFinalVaultFields,
            }
          },
          newReshareVault: async ({
            oldResharePrefix,
            oldParties,
            publicKeyEcdsa,
            hexChainCode,
          }) => {
            const storageVault = await Reshare(
              {
                public_key_ecdsa: publicKeyEcdsa,
                signers: oldParties,
                reshare_prefix: oldResharePrefix,
                hex_chain_code: hexChainCode,
                local_party_id: localPartyId,
                name: vaultName,
              } as storage.Vault,
              sessionId,
              encryptionKeyHex,
              serverUrl
            )

            return {
              ...fromStorageVault(storageVault),
              ...sharedFinalVaultFields,
              order: getLastItemOrder(vaultOrders),
            }
          },
          newVault: () => {
            throw new Error('new vault is not expected for Reshare')
          },
        })
      } finally {
        keygenSteps.forEach(step => {
          EventsOff(step)
        })
      }
    },
    [
      encryptionKeyHex,
      keygenVault,
      localPartyId,
      serverUrl,
      sessionId,
      vaultName,
      vaultOrders,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
