import { Chain } from '@core/chain/Chain'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtKeygenSession } from '@core/mpc/fromt/fromtSessionFactory'
import {
  parseFroztBundleResult,
  runFroztSession,
} from '@core/mpc/frozt/froztSession'
import { createFroztKeygenSession } from '@core/mpc/frozt/froztSessionFactory'
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

  const vaultOrders = useVaultOrders()

  const keygenAction: KeygenAction = async ({ onStepChange, signers }) => {
    onStepChange('ecdsa')

    const sharedFinalVaultFields = {
      signers,
      localPartyId,
      libType: 'DKLS' as MpcLib,
      isBackedUp: false,
    }

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

    const froztSession = await createFroztKeygenSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'frozt',
      isInitiatingDevice,
      signers,
      birthday: 0,
    })

    const fromtSession = await createFromtKeygenSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'fromt',
      isInitiatingDevice,
      signers,
      birthday: 0,
    })

    onStepChange('frozt')

    const [dklsResult, schnorrResult, froztBundle, fromtBundle] =
      await Promise.all([
        dklsKeygen.startKeygenWithRetry('p-ecdsa'),
        schnorrKeygen.startKeygenWithRetry('p-eddsa'),
        runFroztSession({
          session: froztSession,
          messageId: 'p-frozt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }),
        runFroztSession({
          session: fromtSession,
          messageId: 'p-fromt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }),
      ])

    const froztResult = parseFroztBundleResult(froztBundle)
    const fromtResult = parseFromtBundleResult(fromtBundle)

    let publicKeyMldsa: string | undefined
    let keyShareMldsa: string | undefined

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
      chainPublicKeys: {
        [Chain.ZcashShielded]: froztResult.pubKeyPackage,
        [Chain.Monero]: fromtResult.pubKey,
      },
      chainKeyShares: {
        [Chain.ZcashShielded]: froztResult.bundle,
        [Chain.Monero]: fromtResult.keyShare,
      },
      saplingExtras: froztResult.saplingExtras || undefined,
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
