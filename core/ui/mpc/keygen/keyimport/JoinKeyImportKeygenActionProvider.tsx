import { featureFlags } from '@core/ui/featureFlags'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useIsTssBatching } from '@core/ui/mpc/state/isTssBatching'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useIsMLDSAEnabled } from '@core/ui/storage/mldsaEnabled'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { signatureAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { DKLS } from '@vultisig/core-mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@vultisig/core-mpc/keygenComplete'
import { MldsaKeygen } from '@vultisig/core-mpc/mldsa/mldsaKeygen'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Schnorr } from '@vultisig/core-mpc/schnorr/schnorrKeygen'
import { Vault, VaultKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { without } from '@vultisig/lib-utils/array/without'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'

import {
  MldsaProtocolSpec,
  SharedMpcParams,
} from '../../worker/keygenWorkerProtocol'
import { runKeyImportViaWorkers } from '../../worker/runKeyImportViaWorkers'
import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import {
  parseKeyImportChains,
  useKeyImportChains,
} from './state/keyImportChains'
import { buildKeyImportProtocolSpecs } from './utils/buildKeyImportProtocolSpecs'
import { getKeyImportDerivationGroups } from './utils/getKeyImportDerivationGroups'
import { withKeyImportServerChains } from './utils/keyImportServerChains'

export const JoinKeyImportKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const vaultOrders = useVaultOrders()
  const keyImportChainsRaw = useKeyImportChains()
  const isTssBatchingEnabled = useIsTssBatching()
  const isMLDSAEnabled = useIsMLDSAEnabled()

  const keygenAction: KeygenAction = async ({
    onStepChange,
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    const chains = parseKeyImportChains(shouldBePresent(keyImportChainsRaw))

    const sharedDklsParams = {
      isInitiateDevice: isInitiatingDevice,
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      oldKeygenCommittee: [] as string[],
      hexEncryptionKey: encryptionKeyHex,
    }

    if (isTssBatchingEnabled) {
      onStepStart('prepareVault')

      const shared: SharedMpcParams = {
        isInitiateDevice: sharedDklsParams.isInitiateDevice,
        serverUrl: sharedDklsParams.serverUrl,
        sessionId: sharedDklsParams.sessionId,
        localPartyId: sharedDklsParams.localPartyId,
        signers: sharedDklsParams.signers,
        oldKeygenCommittee: sharedDklsParams.oldKeygenCommittee,
        hexEncryptionKey: sharedDklsParams.hexEncryptionKey,
      }

      const derivationGroups = getKeyImportDerivationGroups(chains)

      // Joiners have no mnemonic: every private key is empty and setups are
      // received from the relay rather than uploaded. Grouping by derivation
      // path keeps the message IDs identical to the initiator's
      // (`p-${representativeChain}`) — iterating raw chains would request
      // setups the initiator never creates for same-path chains and hang.
      const { specs, chainsById } = buildKeyImportProtocolSpecs({
        shared,
        hexChainCode,
        derivationGroups,
        uploadSetup: false,
        rootEcdsaPrivateKeyHex: '',
        rootEddsaPrivateKeyHex: '',
        getChainPrivateKeyHex: () => '',
      })

      const includeMldsa = featureFlags.mldsaKeygen && isMLDSAEnabled

      const mldsaSpec: MldsaProtocolSpec | undefined = includeMldsa
        ? {
            id: 'p-mldsa',
            shared,
            messageId: 'p-mldsa',
            setupMessageId: 'p-mldsa-setup',
          }
        : undefined

      onStepComplete('prepareVault')
      onStepStart('ecdsa')
      onStepStart('eddsa')
      if (derivationGroups.length > 0) {
        onStepStart('chainKeys')
      }
      if (includeMldsa) {
        onStepStart('mldsa')
      }

      const completedChainIds = new Set<string>()
      const { resultsById, mldsaResult } = await runKeyImportViaWorkers({
        keyImportSpecs: specs,
        mldsaSpec,
        onExchangeComplete: id => {
          if (id === 'p-ecdsa') {
            onStepComplete('ecdsa')
          } else if (id === 'p-eddsa') {
            onStepComplete('eddsa')
          } else {
            completedChainIds.add(id)
            if (completedChainIds.size === chainsById.size) {
              onStepComplete('chainKeys')
            }
          }
        },
        onMldsaComplete: () => onStepComplete('mldsa'),
      })

      const rootEcdsaResult = shouldBePresent(resultsById.get('p-ecdsa'))
      const rootEddsaResult = shouldBePresent(resultsById.get('p-eddsa'))

      const chainPublicKeys: Partial<Record<Chain, string>> = {}
      const chainKeyShares: Partial<Record<Chain, string>> = {}
      const keyShares: VaultKeyShares = {
        ecdsa: rootEcdsaResult.keyshare,
        eddsa: rootEddsaResult.keyshare,
      }

      for (const [id, groupChains] of chainsById) {
        const result = shouldBePresent(resultsById.get(id))
        for (const chain of groupChains) {
          chainPublicKeys[chain] = result.publicKey
          chainKeyShares[chain] = result.keyshare
        }
      }

      const baseVault: Vault = {
        name: vaultName,
        publicKeys: {
          ecdsa: rootEcdsaResult.publicKey,
          eddsa: rootEddsaResult.publicKey,
        },
        signers,
        createdAt: Date.now(),
        hexChainCode: rootEcdsaResult.chaincode,
        keyShares,
        localPartyId,
        libType: 'KeyImport' as MpcLib,
        isBackedUp: false,
        order: getLastItemOrder(vaultOrders),
        lastPasswordVerificationTime: hasServer(signers)
          ? Date.now()
          : undefined,
        chainPublicKeys,
        chainKeyShares,
        publicKeyMldsa: mldsaResult?.publicKey,
        keyShareMldsa: mldsaResult?.keyshare,
      }
      const vault = withKeyImportServerChains(
        baseVault,
        derivationGroups.map(g => g.representativeChain)
      )

      await setKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        localPartyId,
      })

      await waitForKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        peers: without(signers, localPartyId),
      })

      return vault
    } else {
      onStepChange('ecdsa')

      const dklsKeygen = new DKLS(
        { keyimport: true },
        sharedDklsParams.isInitiateDevice,
        sharedDklsParams.serverUrl,
        sharedDklsParams.sessionId,
        sharedDklsParams.localPartyId,
        sharedDklsParams.signers,
        sharedDklsParams.oldKeygenCommittee,
        sharedDklsParams.hexEncryptionKey
      )

      const rootEcdsaResult = await dklsKeygen.startKeyImportWithRetry(
        '',
        hexChainCode
      )

      onStepChange('eddsa')

      const schnorrKeygen = new Schnorr(
        { keyimport: true },
        sharedDklsParams.isInitiateDevice,
        sharedDklsParams.serverUrl,
        sharedDklsParams.sessionId,
        sharedDklsParams.localPartyId,
        sharedDklsParams.signers,
        sharedDklsParams.oldKeygenCommittee,
        sharedDklsParams.hexEncryptionKey,
        new Uint8Array()
      )

      const rootEddsaResult = await schnorrKeygen.startKeyImportWithRetry(
        '',
        hexChainCode
      )

      const chainPublicKeys: Partial<Record<Chain, string>> = {}
      const chainKeyShares: Partial<Record<Chain, string>> = {}
      const keyShares: VaultKeyShares = {
        ecdsa: rootEcdsaResult.keyshare,
        eddsa: rootEddsaResult.keyshare,
      }

      const derivationGroups = getKeyImportDerivationGroups(chains)

      for (const {
        representativeChain,
        chains: groupChains,
      } of derivationGroups) {
        const chainKind = getChainKind(representativeChain)
        const algorithm = signatureAlgorithms[chainKind]

        let chainResult: {
          keyshare: string
          publicKey: string
          chaincode: string
        }
        if (algorithm === 'ecdsa') {
          const chainDkls = new DKLS(
            { keyimport: true },
            sharedDklsParams.isInitiateDevice,
            sharedDklsParams.serverUrl,
            sharedDklsParams.sessionId,
            sharedDklsParams.localPartyId,
            sharedDklsParams.signers,
            sharedDklsParams.oldKeygenCommittee,
            sharedDklsParams.hexEncryptionKey
          )
          chainResult = await chainDkls.startKeyImportWithRetry(
            '',
            rootEcdsaResult.chaincode,
            representativeChain
          )
        } else {
          const chainSchnorr = new Schnorr(
            { keyimport: true },
            sharedDklsParams.isInitiateDevice,
            sharedDklsParams.serverUrl,
            sharedDklsParams.sessionId,
            sharedDklsParams.localPartyId,
            sharedDklsParams.signers,
            sharedDklsParams.oldKeygenCommittee,
            sharedDklsParams.hexEncryptionKey,
            new Uint8Array()
          )
          chainResult = await chainSchnorr.startKeyImportWithRetry(
            '',
            rootEddsaResult.chaincode,
            representativeChain
          )
        }

        for (const chain of groupChains) {
          chainPublicKeys[chain] = chainResult.publicKey
          chainKeyShares[chain] = chainResult.keyshare
        }
      }

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
        const seqMldsaResult = await mldsaKeygen.startKeygenWithRetry()
        publicKeyMldsa = seqMldsaResult.publicKey
        keyShareMldsa = seqMldsaResult.keyshare
      }

      const baseVault: Vault = {
        name: vaultName,
        publicKeys: {
          ecdsa: rootEcdsaResult.publicKey,
          eddsa: rootEddsaResult.publicKey,
        },
        signers,
        createdAt: Date.now(),
        hexChainCode: rootEcdsaResult.chaincode,
        keyShares,
        localPartyId,
        libType: 'KeyImport' as MpcLib,
        isBackedUp: false,
        order: getLastItemOrder(vaultOrders),
        lastPasswordVerificationTime: hasServer(signers)
          ? Date.now()
          : undefined,
        chainPublicKeys,
        chainKeyShares,
        publicKeyMldsa,
        keyShareMldsa,
      }
      const vault = withKeyImportServerChains(
        baseVault,
        derivationGroups.map(g => g.representativeChain)
      )

      await setKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        localPartyId,
      })

      await waitForKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        peers: without(signers, localPartyId),
      })

      return vault
    }
  }

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
