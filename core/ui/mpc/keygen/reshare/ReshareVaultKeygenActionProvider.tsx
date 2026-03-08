import { Chain } from '@core/chain/Chain'
import { DKLS } from '@core/mpc/dkls/dkls'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtReshareSession } from '@core/mpc/fromt/fromtSessionFactory'
import {
  parseFroztBundleResult,
  runFroztSession,
} from '@core/mpc/frozt/froztSession'
import { createFroztReshareSession } from '@core/mpc/frozt/froztSessionFactory'
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
import { useCore } from '@core/ui/state/core'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'

import { frozt_keyshare_bundle_key_package } from '../../../../../lib/frozt/frozt_wasm'
import { useKeygenOperation } from '../state/currentKeygenOperationType'
import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import {
  assertKeygenReshareFields,
  useKeygenVault,
  useKeygenVaultName,
} from '../state/keygenVault'
import { useDklsInboundSequenceNoState } from './state/dklsInboundSequenceNo'

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
  const operation = useKeygenOperation()
  const { getDeveloperOptions } = useCore()
  const [, setDklsInboundSequenceNo] = useDklsInboundSequenceNoState()

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = async ({ onStepChange, signers }) => {
    let timeoutMs = 60000
    if (getDeveloperOptions) {
      const { appInstallTimeout } = await getDeveloperOptions()
      timeoutMs = appInstallTimeout
    }
    onStepChange('ecdsa')
    setDklsInboundSequenceNo(0)
    const sharedFinalVaultFields = {
      signers,
      localPartyId,
      libType: 'DKLS' as MpcLib,
      isBackedUp: false,
    }
    const { oldParties } = assertKeygenReshareFields(keygenVault)
    const oldCommittee = oldParties.filter(party => signers.includes(party))
    const dklsKeygen = new DKLS(
      operation,
      isInitiatingDevice,
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      oldCommittee,
      encryptionKeyHex,
      { timeoutMs, onInboundSequenceNoChange: setDklsInboundSequenceNo }
    )
    const oldEcdsaKeyshare =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.keyShares.ecdsa
        : undefined

    const schnorrKeygen = new Schnorr(
      operation,
      isInitiatingDevice,
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      oldCommittee,
      encryptionKeyHex,
      new Uint8Array(0),
      { timeoutMs }
    )
    const oldEddsaKeyshare =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.keyShares.eddsa
        : undefined

    const oldFroztBundle =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainKeyShares?.[Chain.ZcashShielded]
        : undefined

    const oldFroztPubKeyPackage =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainPublicKeys?.[Chain.ZcashShielded]
        : undefined

    let oldKeyPackage = new Uint8Array()
    if (oldFroztBundle) {
      const bundleBytes = Buffer.from(oldFroztBundle, 'base64')
      oldKeyPackage = new Uint8Array(
        frozt_keyshare_bundle_key_package(bundleBytes)
      )
    }

    const oldPubKeyPackage = oldFroztPubKeyPackage
      ? new Uint8Array(Buffer.from(oldFroztPubKeyPackage, 'base64'))
      : undefined

    const froztSession = await createFroztReshareSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'frozt',
      isInitiatingDevice,
      signers,
      oldKeyPackage,
      oldPubKeyPackage,
    })

    const oldFromtBundle =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainKeyShares?.[Chain.Monero]
        : undefined

    const oldFromtPubKey =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainPublicKeys?.[Chain.Monero]
        : undefined

    let oldFromtKeyPackage = new Uint8Array()
    if (oldFromtBundle) {
      oldFromtKeyPackage = new Uint8Array(Buffer.from(oldFromtBundle, 'base64'))
    }

    const oldFromtPubKeyBytes = oldFromtPubKey
      ? new Uint8Array(Buffer.from(oldFromtPubKey, 'base64'))
      : undefined

    const fromtSession = await createFromtReshareSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'fromt',
      isInitiatingDevice,
      signers,
      oldKeyPackage: oldFromtKeyPackage,
      oldPubKey: oldFromtPubKeyBytes,
    })

    onStepChange('frozt')

    const [dklsResult, schnorrResult, froztBundle, fromtBundle] =
      await Promise.all([
        dklsKeygen.startReshareWithRetry(oldEcdsaKeyshare, 'p-ecdsa'),
        schnorrKeygen.startReshareWithRetry(oldEddsaKeyshare, 'p-eddsa'),
        runFroztSession({
          session: froztSession,
          messageId: 'p-frozt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
          timeoutMs,
        }),
        runFroztSession({
          session: fromtSession,
          messageId: 'p-fromt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
          timeoutMs,
        }),
      ])

    const froztResult = parseFroztBundleResult(froztBundle)
    const fromtResult = parseFromtBundleResult(fromtBundle)

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
      chainPublicKeys: {
        [Chain.ZcashShielded]: froztResult.pubKeyPackage,
        [Chain.Monero]: fromtResult.pubKey,
      },
      chainKeyShares: {
        [Chain.ZcashShielded]: froztResult.bundle,
        [Chain.Monero]: fromtResult.keyShare,
      },
      saplingExtras: froztResult.saplingExtras || undefined,
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
      peers: without(signers, localPartyId),
    })

    return vault
  }

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
