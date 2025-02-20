import { startDklsKeygen } from '@core/keygen/dkls/startDklsKeygen'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { Reshare, StartKeygen } from '../../../../../wailsjs/go/tss/TssService'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
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

  const { name, local_party_id, hex_chain_code, signers } = vault

  const mpcLib = useMpcLib()

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
              await startDklsKeygen({
                isInitiatingDevice,
                signers,
                sessionId,
                hexEncryptionKey: encryptionKeyHex,
                serverUrl,
              })

              throw new Error('DKLS is not supported yet')
            },
          })
        },
        [KeygenType.Reshare]: () =>
          Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
      }),
  })
}
