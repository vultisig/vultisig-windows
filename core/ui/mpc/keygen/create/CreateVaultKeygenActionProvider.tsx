import { Chain } from '@core/chain/Chain'
import { getChainHeight } from '@core/chain/chains/monero/daemonRpc'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
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

  const keygenAction: KeygenAction = async ({
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    onStepStart('prepareVault')

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

    let zcashBirthday = 0
    try {
      const latestBlock = await getLatestBlock()
      zcashBirthday = latestBlock.height
    } catch {
      // lightwalletd unavailable, use 0
    }

    const froztSession = await createFroztKeygenSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'frozt',
      isInitiatingDevice,
      signers,
      birthday: zcashBirthday,
    })

    let moneroBirthday = 0
    try {
      moneroBirthday = await getChainHeight()
    } catch {
      // monero daemon unavailable, use 0
    }

    const fromtSession = await createFromtKeygenSession({
      serverUrl,
      sessionId,
      localPartyId,
      hexEncryptionKey: encryptionKeyHex,
      setupMessageId: 'fromt',
      isInitiatingDevice,
      signers,
      birthday: moneroBirthday,
    })

    onStepComplete('prepareVault')
    onStepStart('ecdsa')
    onStepStart('eddsa')
    onStepStart('frozt')
    onStepStart('fromt')

    const [dklsResult, schnorrResult, froztBundle, fromtBundle] =
      await Promise.all([
        dklsKeygen.startKeygenWithRetry('p-ecdsa').then(r => {
          onStepComplete('ecdsa')
          return r
        }),
        schnorrKeygen.startKeygenWithRetry('p-eddsa').then(r => {
          onStepComplete('eddsa')
          return r
        }),
        runFroztSession({
          session: froztSession,
          messageId: 'p-frozt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }).then(r => {
          onStepComplete('frozt')
          return r
        }),
        runFroztSession({
          session: fromtSession,
          messageId: 'p-fromt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }).then(r => {
          onStepComplete('fromt')
          return r
        }),
      ])

    const froztResult = parseFroztBundleResult(froztBundle)
    const fromtResult = parseFromtBundleResult(fromtBundle)

    let publicKeyMldsa: string | undefined
    let keyShareMldsa: string | undefined

    if (featureFlags.mldsaKeygen && isMLDSAEnabled) {
      onStepStart('mldsa')

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
      onStepComplete('mldsa')
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
        [Chain.ZcashSapling]: froztResult.pubKeyPackage,
        [Chain.Monero]: fromtResult.pubKey,
      },
      chainKeyShares: {
        [Chain.ZcashSapling]: froztResult.bundle,
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
