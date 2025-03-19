import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { MPC } from '@core/mpc/mpc'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../../../wailsjs/go/models'
import {
  GetLocalUIEcdsa,
  GetLocalUIEdDSA,
  Reshare,
  StartKeygen,
} from '../../../../../wailsjs/go/tss/TssService'
import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { useCurrentKeygenType } from '../../state/currentKeygenType'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useMpcServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useMpcSessionId()

  const vault = useCurrentVault()

  const { name, local_party_id, hex_chain_code } = vault

  const mpcLib = useMpcLib()

  const peers = useMpcPeers()

  const isInitiatingDevice = useIsInitiatingDevice()

  return useMutation({
    mutationFn: async () => {
      const partialVault = await match(keygenType, {
        [KeygenType.Keygen]: () => {
          return match(mpcLib, {
            GG20: () => {
              return StartKeygen(
                name,
                local_party_id,
                sessionId,
                hex_chain_code,
                encryptionKeyHex,
                serverUrl
              )
            },
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
        [KeygenType.Reshare]: () => {
          const ecdsaKeyshare = vault.keyshares.find(
            keyshare => keyshare.public_key === vault.public_key_ecdsa
          )?.keyshare
          const eddsaKeyshare = vault.keyshares.find(
            keyshare => keyshare.public_key === vault.public_key_eddsa
          )?.keyshare

          const oldKeygenCommittee = vault.signers
          return match(mpcLib, {
            GG20: () => Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
            DKLS: async () => {
              const mpcKeygen = new MPC(
                KeygenType.Keygen,
                isInitiatingDevice,
                serverUrl,
                sessionId,
                local_party_id,
                [local_party_id, ...peers],
                oldKeygenCommittee,
                encryptionKeyHex
              )

              const result = await mpcKeygen.startReshare(
                ecdsaKeyshare,
                eddsaKeyshare
              )
              if (!result) {
                throw new Error('DKLS keygen failed')
              }
              const newVault = storage.Vault.createFrom({
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
              return newVault
            },
          })
        },
        [KeygenType.Migrate]: async () => {
          const ecdsaKeyshare = vault.keyshares.find(
            keyshare => keyshare.public_key === vault.public_key_ecdsa
          )?.keyshare
          const eddsaKeyshare = vault.keyshares.find(
            keyshare => keyshare.public_key === vault.public_key_eddsa
          )?.keyshare
          if (!ecdsaKeyshare || !eddsaKeyshare) {
            throw new Error('Keyshare not found')
          }
          const oldKeygenCommittee = vault.signers

          const mpcKeygen = new MPC(
            KeygenType.Migrate,
            isInitiatingDevice,
            serverUrl,
            sessionId,
            local_party_id,
            [local_party_id, ...peers],
            oldKeygenCommittee,
            encryptionKeyHex
          )
          const localUIEcdsa = await GetLocalUIEcdsa(ecdsaKeyshare)
          const localUIEddsa = await GetLocalUIEdDSA(eddsaKeyshare)
          const result = await mpcKeygen.startMigrate(
            vault.public_key_ecdsa,
            vault.public_key_eddsa,
            localUIEcdsa,
            localUIEddsa,
            vault.hex_chain_code
          )
          if (!result) {
            throw new Error('DKLS keygen failed')
          }
          const newVault = storage.Vault.createFrom({
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
          return newVault
        },
      })

      return {
        ...partialVault,
        convertValues: () => {},
      }
    },
  })
}
