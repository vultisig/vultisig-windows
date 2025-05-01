import { keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { MpcLib } from '@core/mpc/mpcLib'
import {
  KeygenAction,
  KeygenActionProvider,
} from '@core/ui/mpc/keygen/state/keygenAction'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { EventsOff, EventsOn } from '@wailsapp/runtime'
import { useCallback } from 'react'

import { StartKeygen } from '../../../../wailsjs/go/tss/TssService'
import { fromStorageVault } from '../../utils/storageVault'

export const CreateVaultLegacyKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const keygenVault = useKeygenVault()
  const localPartyId = useMpcLocalPartyId()
  const hexChainCode = useCurrentHexChainCode()

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
      } finally {
        keygenSteps.forEach(step => {
          EventsOff(step)
        })
      }
    },
    [
      encryptionKeyHex,
      hexChainCode,
      keygenVault,
      localPartyId,
      serverUrl,
      sessionId,
      vaultOrders,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
