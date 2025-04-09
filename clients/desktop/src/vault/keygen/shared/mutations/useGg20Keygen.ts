import { keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import {
  KeygenVault,
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { Vault } from '@core/ui/vault/Vault'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { EventsOff, EventsOn } from '@wailsapp/runtime'
import { useCallback, useMemo } from 'react'

import { storage } from '../../../../../wailsjs/go/models'
import { Reshare, StartKeygen } from '../../../../../wailsjs/go/tss/TssService'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentHexChainCode } from '../../../setup/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { fromStorageVault, toStorageVault } from '../../../utils/storageVault'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { KeygenResolver } from './KeygenResolver'

export const useGg20Keygen = (): KeygenResolver => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useMpcServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useMpcSessionId()

  const keygenVault = useKeygenVault()
  const vaultName = useKeygenVaultName()

  const localPartyId = useMpcLocalPartyId()
  const hexChainCode = useCurrentHexChainCode()

  const vaults = useVaults()

  const vaultOrders = useMemo(() => vaults.map(vault => vault.order), [vaults])

  return useCallback(
    async ({ onStepChange }) => {
      keygenSteps.forEach(step => {
        EventsOn(step, () => onStepChange(step))
      })

      const sharedFinalVaultFields: Pick<
        Vault,
        'libType' | 'isBackedUp' | 'localPartyId'
      > = {
        localPartyId,
        libType: 'GG20',
        isBackedUp: false,
      }

      try {
        return match<KeygenType, Promise<Vault>>(keygenType, {
          create: async () => {
            const { name } = getRecordUnionValue(keygenVault, 'newVault')

            const storageVault = await StartKeygen(
              name,
              localPartyId,
              sessionId,
              hexChainCode,
              encryptionKeyHex,
              serverUrl
            )

            return {
              ...fromStorageVault(storageVault),
              ...sharedFinalVaultFields,
              order: getLastItemOrder(vaultOrders),
            }
          },
          reshare: async () => {
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
          },
          migrate: () => {
            throw new Error('Migrate is not supported for GG20')
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
      hexChainCode,
      keygenType,
      keygenVault,
      localPartyId,
      serverUrl,
      sessionId,
      vaultName,
      vaultOrders,
    ]
  )
}
