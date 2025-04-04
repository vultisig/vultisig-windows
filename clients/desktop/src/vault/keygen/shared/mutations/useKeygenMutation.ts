import { DKLS } from '@core/mpc/dkls/dkls'
import { KeygenStep, keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { waitForKeygenComplete } from '@core/mpc/keygenComplete'
import { setKeygenComplete } from '@core/mpc/keygenComplete'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { useKeygenVaultId } from '@core/ui/mpc/keygen/state/keygenVaultId'
import { getVaultId, getVaultKeyshare, Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { pick } from '@lib/utils/record/pick'
import { useMutation } from '@tanstack/react-query'
import { EventsOff, EventsOn } from '@wailsapp/runtime'
import { useMemo, useState } from 'react'

import { storage } from '../../../../../wailsjs/go/models'
import {
  GetLocalUIEcdsa,
  GetLocalUIEdDSA,
  Reshare,
  StartKeygen,
} from '../../../../../wailsjs/go/tss/TssService'
import { useMpcLocalPartyId } from '../../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentHexChainCode } from '../../../setup/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { fromStorageVault, toStorageVault } from '../../../utils/storageVault'
import { useCurrentKeygenType } from '../../state/currentKeygenType'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useMpcServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useMpcSessionId()

  const vault = useCurrentVault()
  const keygenVaultId = useKeygenVaultId()

  const localPartyId = useMpcLocalPartyId()
  const hexChainCode = useCurrentHexChainCode()

  const { name } = vault

  const mpcLib = useMpcLib()

  const peers = useMpcPeers()

  const isInitiatingDevice = useIsInitiatingDevice()

  const [step, setStep] = useState<KeygenStep | null>(null)

  const vaults = useVaults()

  const vaultOrders = useMemo(() => vaults.map(vault => vault.order), [vaults])

  const mutation = useMutation({
    mutationFn: async () => {
      const newVault = await match(
        keygenType === KeygenType.Migrate ? 'DKLS' : mpcLib,
        {
          GG20: async () => {
            keygenSteps.forEach(step => {
              EventsOn(step, () => setStep(step))
            })

            try {
              const storageVault = await match(keygenType, {
                [KeygenType.Keygen]: () => {
                  return StartKeygen(
                    name,
                    localPartyId,
                    sessionId,
                    hexChainCode,
                    encryptionKeyHex,
                    serverUrl
                  )
                },
                [KeygenType.Reshare]: () => {
                  return Reshare(
                    toStorageVault(vault),
                    sessionId,
                    encryptionKeyHex,
                    serverUrl
                  )
                },
                [KeygenType.Migrate]: () => {
                  throw new Error('Migrate is not supported for GG20')
                },
              })

              return fromStorageVault(storageVault)
            } finally {
              keygenSteps.forEach(step => {
                EventsOff(step)
              })
            }
          },
          DKLS: async () => {
            setStep('ecdsa')

            const keygenCommittee = [localPartyId, ...peers]

            const vault = await match(keygenType, {
              [KeygenType.Keygen]: async () => {
                const dklsKeygen = new DKLS(
                  KeygenType.Keygen,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  localPartyId,
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
                  localPartyId,
                  keygenCommittee,
                  [],
                  encryptionKeyHex,
                  dklsKeygen.getSetupMessage()
                )
                const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

                const vault: Vault = {
                  name,
                  publicKeyEcdsa: dklsResult.publicKey,
                  publicKeyEddsa: schnorrResult.publicKey,
                  signers: [localPartyId, ...peers],
                  createdAt: Date.now(),
                  hexChainCode: dklsResult.chaincode,
                  keyShares: [dklsResult, schnorrResult].map(result =>
                    pick(result, ['publicKey', 'keyshare'])
                  ),
                  localPartyId,
                  order: getLastItemOrder(vaultOrders),
                  isBackedUp: false,
                  libType: 'DKLS',
                  resharePrefix: '',
                }

                return vault
              },
              [KeygenType.Reshare]: async () => {
                const oldVault = shouldBePresent(
                  vaults.find(vault => getVaultId(vault) === keygenVaultId),
                  'old vault'
                )
                const ecdsaKeyshare = getVaultKeyshare(
                  oldVault,
                  vault.publicKeyEcdsa
                )
                const eddsaKeyshare = getVaultKeyshare(
                  oldVault,
                  vault.publicKeyEddsa
                )

                const oldCommittee = oldVault.signers.filter(party =>
                  keygenCommittee.includes(party)
                )

                const dklsKeygen = new DKLS(
                  KeygenType.Reshare,
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  localPartyId,
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
                  localPartyId,
                  keygenCommittee,
                  oldCommittee,
                  encryptionKeyHex,
                  new Uint8Array(0)
                )
                const schnorrResult =
                  await schnorrKeygen.startReshareWithRetry(eddsaKeyshare)

                const vault: Vault = {
                  ...oldVault,
                  publicKeyEcdsa: dklsResult.publicKey,
                  publicKeyEddsa: schnorrResult.publicKey,
                  hexChainCode: dklsResult.chaincode,
                  keyShares: [dklsResult, schnorrResult].map(result =>
                    pick(result, ['publicKey', 'keyshare'])
                  ),
                  isBackedUp: false,
                  libType: 'DKLS',
                  resharePrefix: '',
                }

                return vault
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
                  localPartyId,
                  keygenCommittee,
                  oldKeygenCommittee,
                  encryptionKeyHex,
                  dklsKeygen.getSetupMessage(),
                  localUIEddsa,
                  vault.publicKeys.eddsa,
                  hexChainCode
                )
                const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

                return storage.Vault.createFrom({
                  name,
                  public_key_ecdsa: dklsResult.publicKey,
                  public_key_eddsa: schnorrResult.publicKey,
                  signers: [localPartyId, ...peers],
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
                  localPartyId,
                  resharePrefix: '',
                  order: 0,
                  isBackedUp: false,
                  coins: [],
                  libType: 'DKLS',
                })
              },
            })

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
        }
      )

      return newVault
    },
  })

  return {
    ...mutation,
    step,
  }
}
