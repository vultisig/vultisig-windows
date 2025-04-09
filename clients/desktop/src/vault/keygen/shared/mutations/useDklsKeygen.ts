import { DKLS } from '@core/mpc/dkls/dkls'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { waitForKeygenComplete } from '@core/mpc/keygenComplete'
import { setKeygenComplete } from '@core/mpc/keygenComplete'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import {
  assertKeygenReshareFields,
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { Vault } from '@core/ui/vault/Vault'
import { match } from '@lib/utils/match'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback, useMemo } from 'react'

import {
  GetLocalUIEcdsa,
  GetLocalUIEdDSA,
} from '../../../../../wailsjs/go/tss/TssService'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentHexChainCode } from '../../../setup/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { KeygenResolver } from './KeygenResolver'

export const useDklsKeygen = (): KeygenResolver => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useMpcServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useMpcSessionId()

  const keygenVault = useKeygenVault()
  const vaultName = useKeygenVaultName()

  const localPartyId = useMpcLocalPartyId()
  const hexChainCode = useCurrentHexChainCode()

  const peers = useMpcPeers()

  const isInitiatingDevice = useIsInitiatingDevice()

  const vaults = useVaults()

  const vaultOrders = useMemo(() => vaults.map(vault => vault.order), [vaults])

  return useCallback(
    async ({ onStepChange }) => {
      onStepChange('ecdsa')

      const signers = [localPartyId, ...peers]

      const sharedFinalVaultFields: Pick<
        Vault,
        'signers' | 'libType' | 'isBackedUp' | 'localPartyId'
      > = {
        signers,
        localPartyId,
        libType: 'DKLS',
        isBackedUp: false,
      }

      const vault = await match<KeygenType, Promise<Vault>>(keygenType, {
        create: async () => {
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

          return {
            name: vaultName,
            publicKeys,
            createdAt: Date.now(),
            hexChainCode: dklsResult.chaincode,
            keyShares,
            order: getLastItemOrder(vaultOrders),
            ...sharedFinalVaultFields,
          }
        },
        reshare: async () => {
          const { oldParties } = assertKeygenReshareFields(keygenVault)

          const oldCommittee = oldParties.filter(party =>
            signers.includes(party)
          )

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

          if ('existingVault' in keygenVault) {
            return {
              ...keygenVault.existingVault,
              ...newVaultFields,
            }
          }

          return {
            ...newVaultFields,
            name: vaultName,
            order: getLastItemOrder(vaultOrders),
          }
        },
        migrate: async () => {
          const existingVault = getRecordUnionValue(
            keygenVault,
            'existingVault'
          )

          const localUIEcdsa = await GetLocalUIEcdsa(
            existingVault.keyShares.ecdsa
          )
          const localUIEddsa = await GetLocalUIEdDSA(
            existingVault.keyShares.eddsa
          )

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

          return {
            ...existingVault,
            publicKeys,
            hexChainCode: dklsResult.chaincode,
            keyShares,
            ...sharedFinalVaultFields,
          }
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
    [
      encryptionKeyHex,
      hexChainCode,
      isInitiatingDevice,
      keygenType,
      keygenVault,
      localPartyId,
      peers,
      serverUrl,
      sessionId,
      vaultName,
      vaultOrders,
    ]
  )
}
