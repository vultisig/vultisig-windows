import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MldsaKeygen } from '@core/mpc/mldsa/mldsaKeygen'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { featureFlags } from '@core/ui/featureFlags'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useIsMLDSAEnabled } from '@core/ui/storage/mldsaEnabled'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'

export const CreateVaultKeygenActionProvider = ({ children }: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const isMLDSAEnabled = useIsMLDSAEnabled()
  const isTssBatchingEnabled = useIsTssBatchingEnabled()

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = async ({
    onStepChange,
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    const sharedFinalVaultFields = {
      signers,
      localPartyId,
      libType: 'DKLS' as MpcLib,
      isBackedUp: false,
    }

    let dklsResult: { publicKey: string; keyshare: string; chaincode: string }
    let schnorrResult: {
      publicKey: string
      keyshare: string
      chaincode: string
    }
    let publicKeyMldsa: string | undefined
    let keyShareMldsa: string | undefined

    if (isTssBatchingEnabled) {
      onStepStart('prepareVault')

      const dklsKeygen = new DKLS(
        { create: true },
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex
      )

      await dklsKeygen.prepareKeygenSetup()

      const schnorrKeygen = new Schnorr(
        { create: true },
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex,
        dklsKeygen.getSetupMessage()
      )

      const includeMldsa = featureFlags.mldsaKeygen && isMLDSAEnabled

      onStepComplete('prepareVault')
      onStepStart('ecdsa')
      onStepStart('eddsa')
      if (includeMldsa) {
        onStepStart('mldsa')
      }

      const mldsaPromise = includeMldsa
        ? new MldsaKeygen(
            isInitiatingDevice,
            serverUrl,
            sessionId,
            localPartyId,
            signers,
            encryptionKeyHex,
            { messageId: 'p-mldsa', setupMessageId: 'p-mldsa-setup' }
          )
            .startKeygenWithRetry()
            .then(r => {
              onStepComplete('mldsa')
              return r
            })
        : Promise.resolve(undefined)

      const [ecdsaResult, eddsaResult, mldsaResult] = await Promise.all([
        dklsKeygen.startKeygenWithRetry('p-ecdsa').then(r => {
          onStepComplete('ecdsa')
          return r
        }),
        schnorrKeygen.startKeygenWithRetry('p-eddsa').then(r => {
          onStepComplete('eddsa')
          return r
        }),
        mldsaPromise,
      ])

      dklsResult = ecdsaResult
      schnorrResult = eddsaResult
      publicKeyMldsa = mldsaResult?.publicKey
      keyShareMldsa = mldsaResult?.keyshare
    } else {
      onStepChange('ecdsa')

      const dklsKeygen = new DKLS(
        { create: true },
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex
      )
      dklsResult = await dklsKeygen.startKeygenWithRetry()

      onStepChange('eddsa')

      const schnorrKeygen = new Schnorr(
        { create: true },
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        [],
        encryptionKeyHex,
        dklsKeygen.getSetupMessage()
      )
      schnorrResult = await schnorrKeygen.startKeygenWithRetry()

      if (featureFlags.mldsaKeygen && isMLDSAEnabled) {
        onStepChange('mldsa')

        const mldsaKeygen = new MldsaKeygen(
          isInitiatingDevice,
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          encryptionKeyHex
        )
        const mldsaResult = await mldsaKeygen.startKeygenWithRetry()
        publicKeyMldsa = mldsaResult.publicKey
        keyShareMldsa = mldsaResult.keyshare
      }
    }

    const publicKeys = {
      ecdsa: dklsResult.publicKey,
      eddsa: schnorrResult.publicKey,
    }

    const keyShares = {
      ecdsa: dklsResult.keyshare,
      eddsa: schnorrResult.keyshare,
    }

    const vault = {
      name: vaultName,
      publicKeys,
      createdAt: Date.now(),
      hexChainCode: dklsResult.chaincode,
      keyShares,
      publicKeyMldsa,
      keyShareMldsa,
      order: getLastItemOrder(vaultOrders),
      lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
      ...sharedFinalVaultFields,
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
