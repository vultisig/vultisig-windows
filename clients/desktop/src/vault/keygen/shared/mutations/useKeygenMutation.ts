import { MPC } from '@core/mpc/mpc'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../../../wailsjs/go/models'
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
              const mpcKeygen = new MPC(
                KeygenType.Keygen,
                isInitiatingDevice,
                serverUrl,
                sessionId,
                local_party_id,
                [local_party_id, ...peers],
                [],
                encryptionKeyHex
              )
              const result = await mpcKeygen.startKeygen()
              if (!result) {
                throw new Error('DKLS keygen failed')
              }
              const vault = storage.Vault.createFrom({
                name,
                public_key_ecdsa: result.dkls.publicKey,
                public_key_eddsa: result.schnorr.publicKey,
                signers: [local_party_id, ...peers],
                created_at: new Date().toISOString(),
                hex_chain_code: result.dkls.chaincode,
                keyshares: [
                  storage.KeyShare.createFrom({
                    public_key: result.dkls.publicKey,
                    keyshare: result.dkls.keyshare,
                  }),
                  storage.KeyShare.createFrom({
                    public_key: result.schnorr.publicKey,
                    keyshare: result.schnorr.keyshare,
                  }),
                ],
                local_party_id,
                reshare_prefix: '',
                order: 0,
                is_backed_up: false,
                coins: [],
                lib_type: 'DKLS',
              })
              return vault
            },
          })
        },
        [KeygenType.Reshare]: () =>
          Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
      }),
  })
}
