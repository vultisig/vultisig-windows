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
import {
  assertKeygenReshareFields,
  useKeygenVault,
  useKeygenVaultName,
} from '../state/keygenVault'

export const ReshareVaultKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const keygenVault = useKeygenVault()

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

      const { oldParties } = assertKeygenReshareFields(keygenVault)

      const oldCommittee = oldParties.filter(party => signers.includes(party))

      const dklsKeygen = new DKLS(
        'reshare',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        oldCommittee,
        encryptionKeyHex
      )

      const oldEcdsaKeyshare =
        'existingVault' in keygenVault
          ? keygenVault.existingVault.keyShares.ecdsa
          : undefined

      const dklsResult =
        await dklsKeygen.startReshareWithRetry(oldEcdsaKeyshare)

      onStepChange('eddsa')

      const schnorrKeygen = new Schnorr(
        'reshare',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        oldCommittee,
        encryptionKeyHex,
        new Uint8Array(0)
      )

      const oldEddsaKeyshare =
        'existingVault' in keygenVault
          ? keygenVault.existingVault.keyShares.eddsa
          : undefined

      const schnorrResult =
        await schnorrKeygen.startReshareWithRetry(oldEddsaKeyshare)

      const publicKeys = {
        ecdsa: dklsResult.publicKey,
        eddsa: schnorrResult.publicKey,
      }

      const keyShares = {
        ecdsa: dklsResult.keyshare,
        eddsa: schnorrResult.keyshare,
      }

      const newVaultFields = {
        publicKeys,
        keyShares,
        hexChainCode: dklsResult.chaincode,
        ...sharedFinalVaultFields,
      }

      const vault =
        'existingVault' in keygenVault
          ? {
              ...keygenVault.existingVault,
              ...newVaultFields,
            }
          : {
              ...newVaultFields,
              name: vaultName,
              order: getLastItemOrder(vaultOrders),
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
