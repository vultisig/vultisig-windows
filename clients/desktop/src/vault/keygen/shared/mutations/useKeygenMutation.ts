import { DKLSKeygen } from '@core/mpc/dkls/dklsKeygen'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { Reshare, StartKeygen } from '../../../../../wailsjs/go/tss/TssService'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useSelectedPeers } from '../../../keysign/shared/state/selectedPeers'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { KeygenType } from '../../KeygenType'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { useCurrentKeygenVault } from '../../state/currentKeygenVault'
import { useCurrentServerUrl } from '../../state/currentServerUrl'
import { useCurrentSessionId } from '../state/currentSessionId'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useCurrentServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useCurrentSessionId()

  const vault = useCurrentKeygenVault()

  const { name, local_party_id, hex_chain_code } = vault

  const mpcLib = useMpcLib()

  const peers = useSelectedPeers()

  const isInitiatingDevice = useIsInitiatingDevice()

  return useMutation({
    mutationFn: async () =>
      match(keygenType, {
        [KeygenType.Keygen]: () => {
          return match(mpcLib, {
            GG20: () =>
              StartKeygen(
                name,
                local_party_id,
                sessionId,
                hex_chain_code,
                encryptionKeyHex,
                serverUrl
              ),
            DKLS: async () => {
              const dklsKeygen = new DKLSKeygen(
                KeygenType.Keygen,
                isInitiatingDevice,
                serverUrl,
                sessionId,
                local_party_id,
                [local_party_id, ...peers],
                [],
                encryptionKeyHex
              )
              const result = await dklsKeygen.startKeygenWithRetry()
              console.log('DKLS keygen result:', result)
              // await startDklsKeygen({
              //   isInitiatingDevice,
              //   peers,
              //   sessionId,
              //   hexEncryptionKey: encryptionKeyHex,
              //   serverUrl,
              //   localPartyId: local_party_id,
              // })

              throw new Error('DKLS is not supported yet')
            },
          })
        },
        [KeygenType.Reshare]: () =>
          Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
      }),
  })
}
