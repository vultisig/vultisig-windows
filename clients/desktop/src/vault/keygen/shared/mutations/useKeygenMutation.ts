import { DKLS } from '@core/mpc/dkls/dkls'
import { KeygenStep, keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { waitForKeygenComplete } from '@core/mpc/keygenComplete'
import { setKeygenComplete } from '@core/mpc/keygenComplete'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'
import { EventsOff, EventsOn } from '@wailsapp/runtime'
import { useState } from 'react'

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

  const [step, setStep] = useState<KeygenStep | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const partialVault = await match(
        keygenType === KeygenType.Migrate ? 'DKLS' : mpcLib,
        {
          GG20: async () => {
            keygenSteps.forEach(step => {
              EventsOn(step, () => setStep(step))
            })

            try {
              return await match(keygenType, {
                [KeygenType.Keygen]: () => {
                  return StartKeygen(
                    name,
                    local_party_id,
                    sessionId,
                    hex_chain_code,
                    encryptionKeyHex,
                    serverUrl
                  )
                },
                [KeygenType.Reshare]: () => {
                  return Reshare(vault, sessionId, encryptionKeyHex, serverUrl)
                },
                [KeygenType.Migrate]: () => {
                  throw new Error('Migrate is not supported for GG20')
                },
              })
            } finally {
              keygenSteps.forEach(step => {
                EventsOff(step)
              })
            }
          },
          DKLS: async () => {
            setStep('ecdsa')

            const keygenCommittee = [local_party_id, ...peers]

            const newVault = await match(keygenType, {
              [KeygenType.Keygen]: async () => {
                const dklsKeygen = new DKLS(
                  KeygenType.Keygen,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  [],
                  encryptionKeyHex
                )
                const dklsResult = await dklsKeygen.startKeygenWithRetry()

                setStep('eddsa')

                const schnorrKeygen = new Schnorr(
                  KeygenType.Keygen,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  [],
                  encryptionKeyHex,
                  dklsKeygen.getSetupMessage()
                )
                const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

                return storage.Vault.createFrom({
                  name,
                  public_key_ecdsa: dklsResult.publicKey,
                  public_key_eddsa: schnorrResult.publicKey,
                  signers: [local_party_id, ...peers],
                  created_at: new Date().toISOString(),
                  hex_chain_code: dklsResult.chaincode,
                  keyshares: [
                    storage.KeyShare.createFrom({
                      public_key: dklsResult.publicKey,
                      keyshare: dklsResult.keyshare,
                    }),
                    storage.KeyShare.createFrom({
                      public_key: schnorrResult.publicKey,
                      keyshare: schnorrResult.keyshare,
                    }),
                  ],
                  local_party_id,
                  reshare_prefix: '',
                  order: 0,
                  is_backed_up: false,
                  coins: [],
                  lib_type: 'DKLS',
                })
              },
              [KeygenType.Reshare]: async () => {
                const ecdsaKeyshare = shouldBePresent(
                  vault.keyshares.find(
                    keyshare => keyshare.public_key === vault.public_key_ecdsa
                  ),
                  'ecdsa keyshare'
                ).keyshare
                const eddsaKeyshare = shouldBePresent(
                  vault.keyshares.find(
                    keyshare => keyshare.public_key === vault.public_key_eddsa
                  ),
                  'eddsa keyshare'
                ).keyshare

                const oldKeygenCommittee = vault.signers

                const oldCommittee = oldKeygenCommittee.filter(party =>
                  keygenCommittee.includes(party)
                )
                const dklsKeygen = new DKLS(
                  KeygenType.Reshare,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  oldCommittee,
                  encryptionKeyHex
                )
                const dklsResult =
                  await dklsKeygen.startReshareWithRetry(ecdsaKeyshare)

                setStep('eddsa')

                const schnorrKeygen = new Schnorr(
                  KeygenType.Reshare,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  oldCommittee,
                  encryptionKeyHex,
                  new Uint8Array(0)
                )
                const schnorrResult =
                  await schnorrKeygen.startReshareWithRetry(eddsaKeyshare)

                const newVault = storage.Vault.createFrom({
                  name,
                  public_key_ecdsa: dklsResult.publicKey,
                  public_key_eddsa: schnorrResult.publicKey,
                  signers: [local_party_id, ...peers],
                  created_at: new Date().toISOString(),
                  hex_chain_code: dklsResult.chaincode,
                  keyshares: [
                    storage.KeyShare.createFrom({
                      public_key: dklsResult.publicKey,
                      keyshare: dklsResult.keyshare,
                    }),
                    storage.KeyShare.createFrom({
                      public_key: schnorrResult.publicKey,
                      keyshare: schnorrResult.keyshare,
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
              [KeygenType.Migrate]: async () => {
                const ecdsaKeyshare = shouldBePresent(
                  vault.keyshares.find(
                    keyshare => keyshare.public_key === vault.public_key_ecdsa
                  ),
                  'ecdsa keyshare'
                ).keyshare
                const eddsaKeyshare = shouldBePresent(
                  vault.keyshares.find(
                    keyshare => keyshare.public_key === vault.public_key_eddsa
                  ),
                  'eddsa keyshare'
                ).keyshare

                const oldKeygenCommittee = vault.signers

                const localUIEcdsa = await GetLocalUIEcdsa(ecdsaKeyshare)
                const localUIEddsa = await GetLocalUIEdDSA(eddsaKeyshare)
                const dklsKeygen = new DKLS(
                  KeygenType.Migrate,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  oldKeygenCommittee,
                  encryptionKeyHex,
                  localUIEcdsa,
                  vault.public_key_ecdsa,
                  hex_chain_code
                )
                const dklsResult = await dklsKeygen.startKeygenWithRetry()

                setStep('eddsa')
                const schnorrKeygen = new Schnorr(
                  KeygenType.Migrate,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  local_party_id,
                  keygenCommittee,
                  oldKeygenCommittee,
                  encryptionKeyHex,
                  dklsKeygen.getSetupMessage(),
                  localUIEddsa,
                  vault.public_key_eddsa,
                  hex_chain_code
                )
                const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

                const newVault = storage.Vault.createFrom({
                  name,
                  public_key_ecdsa: dklsResult.publicKey,
                  public_key_eddsa: schnorrResult.publicKey,
                  signers: [local_party_id, ...peers],
                  created_at: new Date().toISOString(),
                  hex_chain_code: dklsResult.chaincode,
                  keyshares: [
                    storage.KeyShare.createFrom({
                      public_key: dklsResult.publicKey,
                      keyshare: dklsResult.keyshare,
                    }),
                    storage.KeyShare.createFrom({
                      public_key: schnorrResult.publicKey,
                      keyshare: schnorrResult.keyshare,
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

            await setKeygenComplete({
              serverURL: serverUrl,
              sessionId: sessionId,
              localPartyId: local_party_id,
            })

            await waitForKeygenComplete({
              serverURL: serverUrl,
              sessionId: sessionId,
              peers,
            })

            return newVault
          },
        }
      )

      return {
        ...partialVault,
        convertValues: () => {},
      }
    },
  })

  return {
    ...mutation,
    step,
  }
}
