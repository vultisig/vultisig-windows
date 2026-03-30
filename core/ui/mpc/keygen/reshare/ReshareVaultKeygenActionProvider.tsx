import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCore } from '@core/ui/state/core'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { DKLS } from '@vultisig/core-mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@vultisig/core-mpc/keygenComplete'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Schnorr } from '@vultisig/core-mpc/schnorr/schnorrKeygen'
import { without } from '@vultisig/lib-utils/array/without'

import { getLastItemOrder } from '../../../utils/order/getLastItemOrder'
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
  const isTssBatchingEnabled = useIsTssBatchingEnabled()

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = async ({
    onStepChange,
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    let timeoutMs = 60000
    if (getDeveloperOptions) {
      const { appInstallTimeout } = await getDeveloperOptions()
      timeoutMs = appInstallTimeout
    }

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

    let dklsResult: { publicKey: string; keyshare: string; chaincode: string }
    let schnorrResult: {
      publicKey: string
      keyshare: string
      chaincode: string
    }

    if (isTssBatchingEnabled) {
      onStepStart('ecdsa')
      onStepStart('eddsa')
      ;[dklsResult, schnorrResult] = await Promise.all([
        dklsKeygen
          .startReshareWithRetry(oldEcdsaKeyshare, 'p-ecdsa')
          .then(r => {
            onStepComplete('ecdsa')
            return r
          }),
        schnorrKeygen
          .startReshareWithRetry(oldEddsaKeyshare, 'p-eddsa')
          .then(r => {
            onStepComplete('eddsa')
            return r
          }),
      ])
    } else {
      onStepChange('ecdsa')
      dklsResult = await dklsKeygen.startReshareWithRetry(oldEcdsaKeyshare)

      onStepChange('eddsa')
      schnorrResult =
        await schnorrKeygen.startReshareWithRetry(oldEddsaKeyshare)
    }

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
