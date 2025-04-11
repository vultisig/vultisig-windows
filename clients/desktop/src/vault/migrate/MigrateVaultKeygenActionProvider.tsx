import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import {
  KeygenAction,
  KeygenActionProvider,
} from '@core/ui/mpc/keygen/state/keygenAction'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import {
  GetLocalUIEcdsa,
  GetLocalUIEdDSA,
} from '../../../wailsjs/go/tss/TssService'

export const MigrateVaultKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const localPartyId = useMpcLocalPartyId()
  const hexChainCode = useCurrentHexChainCode()
  const peers = useMpcPeers()
  const isInitiatingDevice = useIsInitiatingDevice()
  const keygenVault = useKeygenVault()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange }) => {
      onStepChange('ecdsa')

      const signers = [localPartyId, ...peers]

      const sharedFinalVaultFields = {
        signers,
        localPartyId,
        libType: 'DKLS' as MpcLib,
        isBackedUp: false,
      }

      const existingVault = getRecordUnionValue(keygenVault, 'existingVault')

      const localUIEcdsa = await GetLocalUIEcdsa(existingVault.keyShares.ecdsa)
      const localUIEddsa = await GetLocalUIEdDSA(existingVault.keyShares.eddsa)

      const dklsKeygen = new DKLS(
        'migrate',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        existingVault.signers,
        encryptionKeyHex,
        localUIEcdsa,
        existingVault.publicKeys.ecdsa,
        hexChainCode
      )
      const dklsResult = await dklsKeygen.startKeygenWithRetry()

      onStepChange('eddsa')
      const schnorrKeygen = new Schnorr(
        'migrate',
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        existingVault.signers,
        encryptionKeyHex,
        dklsKeygen.getSetupMessage(),
        localUIEddsa,
        existingVault.publicKeys.eddsa,
        hexChainCode
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
        ...existingVault,
        publicKeys,
        hexChainCode: dklsResult.chaincode,
        keyShares,
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
      hexChainCode,
      isInitiatingDevice,
      keygenVault,
      localPartyId,
      peers,
      serverUrl,
      sessionId,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
