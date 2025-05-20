import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useCallback } from 'react'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'

export const CreateVaultKeygenActionProvider = ({ children }: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, peers }) => {
      onStepChange('ecdsa')

      const signers = [localPartyId, ...peers]

      const sharedFinalVaultFields = {
        signers,
        localPartyId,
        libType: 'DKLS' as MpcLib,
        isBackedUp: false,
      }

      const dklsKeygen = new DKLS(
        'create',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex
      )
      const dklsResult = await dklsKeygen.startKeygenWithRetry()

      onStepChange('eddsa')

      const schnorrKeygen = new Schnorr(
        'create',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex,
        dklsKeygen.getSetupMessage()
      )
      const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

      const publicKeys = {
        ecdsa: dklsResult.publicKey,
        eddsa: schnorrResult.publicKey,
      }

      const keyShares = {
        ecdsa: dklsResult.keyshare,
        eddsa: schnorrResult.keyshare,
      }

      const vault = {
        name: vaultName,
        publicKeys,
        createdAt: Date.now(),
        hexChainCode: dklsResult.chaincode,
        keyShares,
        order: getLastItemOrder(vaultOrders),
        ...sharedFinalVaultFields,
      }

      await setKeygenComplete({
        serverURL: serverUrl,
        sessionId: sessionId,
        localPartyId,
      })

      await waitForKeygenComplete({
        serverURL: serverUrl,
        sessionId: sessionId,
        peers,
      })

      return vault
    },
    [
      encryptionKeyHex,
      isInitiatingDevice,
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
