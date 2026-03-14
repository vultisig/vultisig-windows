import { Chain } from '@core/chain/Chain'
import { DKLS } from '@core/mpc/dkls/dkls'
import {
  type FromtReshareResult,
  packFromtReshareBundle,
} from '@core/mpc/fromt/fromtBundle'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtReshareSession } from '@core/mpc/fromt/fromtSessionFactory'
import {
  type FroztReshareResult,
  packFroztReshareBundle,
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

    const oldFroztBundleBase64 =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainKeyShares?.[Chain.ZcashSapling]
        : undefined
    const oldFroztBundle = oldFroztBundleBase64
      ? new Uint8Array(Buffer.from(oldFroztBundleBase64, 'base64'))
      : new Uint8Array()

    const froztSession = await createFroztReshareSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'frozt',
      isInitiatingDevice,
      signers,
      oldBundle: oldFroztBundle,
      oldParties,
    })

    const oldFromtBundleBase64 =
      'existingVault' in keygenVault
        ? keygenVault.existingVault.chainKeyShares?.[Chain.Monero]
        : undefined
    const oldFromtBundle = oldFromtBundleBase64
      ? new Uint8Array(Buffer.from(oldFromtBundleBase64, 'base64'))
      : new Uint8Array()

    const fromtSession = await createFromtReshareSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'fromt',
      isInitiatingDevice,
      signers,
      oldKeyShare: oldFromtBundle,
      oldParties,
    })

    onStepChange('frozt')

    const [dklsResult, schnorrResult, froztReshareResult, fromtReshareResult] =
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

    const froztBundle = packFroztReshareBundle(
      froztReshareResult as unknown as FroztReshareResult,
      oldFroztBundle
    )
    const fromtBundle = packFromtReshareBundle(
      fromtReshareResult as unknown as FromtReshareResult,
      oldFromtBundle
    )

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
        [Chain.ZcashSapling]: froztResult.pubKeyPackage,
        [Chain.Monero]: fromtResult.pubKey,
      },
      chainKeyShares: {
        [Chain.ZcashSapling]: froztResult.bundle,
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
