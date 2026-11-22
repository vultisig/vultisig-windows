import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
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
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { phantomSolanaPath } from '@vultisig/core-chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { DKLS } from '@vultisig/core-mpc/dkls/dkls'
import { KeygenStep } from '@vultisig/core-mpc/keygen/KeygenStep'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@vultisig/core-mpc/keygenComplete'
import { initializeMpcLib } from '@vultisig/core-mpc/lib/initialize'
import { MldsaKeygen } from '@vultisig/core-mpc/mldsa/mldsaKeygen'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Schnorr } from '@vultisig/core-mpc/schnorr/schnorrKeygen'
import { clampThenUniformScalar } from '@vultisig/core-mpc/utils/ed25519ScalarClamp'
import { Vault, VaultKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { without } from '@vultisig/lib-utils/array/without'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'
import { useCallback } from 'react'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import {
  isStationTerraRootKeyImportInput,
  KeyImportInput,
  useKeyImportInput,
} from './state/keyImportInput'
import {
  getKeyImportChainKeys,
  KeyImportChainResult,
} from './utils/getKeyImportChainKeys'
import {
  getKeyImportChainSessions,
  KeyImportChainSession,
} from './utils/getKeyImportChainSessions'
import {
  withKeyImportServerChains,
  withStationKeyImportRootChains,
} from './utils/keyImportServerChains'

type KeyShareResult = {
  keyshare: string
  publicKey: string
  chaincode: string
}

type SharedDklsParams = {
  isInitiateDevice: boolean
  serverUrl: string
  sessionId: string
  localPartyId: string
  signers: string[]
  oldKeygenCommittee: string[]
  hexEncryptionKey: string
}

type DeriveChainKeyInput = {
  chain: Chain
  hdWallet: any
  walletCore: any
  usePhantomSolanaPath?: boolean
  algorithm: string
}

/** Derives the hex-encoded private key for a specific chain from the HD wallet. */
const deriveChainPrivateKey = ({
  chain,
  hdWallet,
  walletCore,
  usePhantomSolanaPath,
  algorithm,
}: DeriveChainKeyInput): string => {
  const coinType = getCoinType({ chain, walletCore })
  const chainKey =
    chain === Chain.Solana && usePhantomSolanaPath
      ? hdWallet.getKey(coinType, phantomSolanaPath)
      : hdWallet.getKeyForCoin(coinType)

  const chainKeyData = new Uint8Array(chainKey.data())

  if (algorithm === 'ecdsa') {
    return Buffer.from(chainKeyData).toString('hex')
  }

  return Buffer.from(clampThenUniformScalar(chainKeyData)).toString('hex')
}

export const KeyImportKeygenActionProvider = ({ children }: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const vaultOrders = useVaultOrders()
  const walletCore = useAssertWalletCore()
  const keyImportInput = useKeyImportInput()
  const isTssBatchingEnabled = useIsTssBatching()
  const isMLDSAEnabled = useIsMLDSAEnabled()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, onStepStart, onStepComplete, signers }) => {
      const { chains } = keyImportInput
      const isStationTerraRoot =
        isStationTerraRootKeyImportInput(keyImportInput)
      const includeEddsaRoot = !isStationTerraRoot

      let hdWallet: ReturnType<
        typeof walletCore.HDWallet.createWithMnemonic
      > | null = null
      if (isInitiatingDevice && !isStationTerraRoot) {
        hdWallet = walletCore.HDWallet.createWithMnemonic(
          keyImportInput.mnemonic,
          ''
        )
      }

      const sharedDklsParams: SharedDklsParams = {
        isInitiateDevice: isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        oldKeygenCommittee: [],
        hexEncryptionKey: encryptionKeyHex,
      }

      let rootEcdsaPrivateKeyHex: string | undefined
      if (isInitiatingDevice && isStationTerraRoot) {
        rootEcdsaPrivateKeyHex = keyImportInput.privateKeyHex
      } else if (isInitiatingDevice && hdWallet) {
        const masterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
        rootEcdsaPrivateKeyHex = Buffer.from(masterKey.data()).toString('hex')
      }

      let rootEddsaPrivateKeyHex: string | undefined
      if (isInitiatingDevice && includeEddsaRoot && hdWallet) {
        const masterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
        const masterKeyData = new Uint8Array(masterKey.data())
        const clampedKey = clampThenUniformScalar(masterKeyData)
        rootEddsaPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
      }

      const chainSessions = isStationTerraRoot
        ? []
        : getKeyImportChainSessions(chains)

      if (isTssBatchingEnabled || isStationTerraRoot) {
        const vault = await runBatchKeyImport({
          sharedDklsParams,
          hexChainCode,
          rootEcdsaPrivateKeyHex: rootEcdsaPrivateKeyHex ?? '',
          rootEddsaPrivateKeyHex: rootEddsaPrivateKeyHex ?? '',
          includeEddsaRoot,
          chainSessions,
          hdWallet,
          walletCore,
          keyImportInput,
          isInitiatingDevice,
          encryptionKeyHex,
          isMLDSAEnabled,
          vaultName,
          localPartyId,
          signers,
          vaultOrders,
          serverUrl,
          sessionId,
          onStepStart,
          onStepComplete,
        })

        if (hdWallet) {
          hdWallet.delete()
        }

        return vault
      }

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
        rootEcdsaPrivateKeyHex ?? '',
        hexChainCode
      )

      let rootEddsaResult: KeyShareResult | undefined
      if (includeEddsaRoot) {
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

        rootEddsaResult = await schnorrKeygen.startKeyImportWithRetry(
          rootEddsaPrivateKeyHex ?? '',
          hexChainCode
        )
      }

      const keyShares: VaultKeyShares = {
        ecdsa: rootEcdsaResult.keyshare,
        eddsa: rootEddsaResult?.keyshare ?? '',
      }

      const chainResults: KeyImportChainResult[] = []
      for (const { chain, algorithm, setupMessageId } of chainSessions) {
        let chainPrivateKeyHex: string | undefined
        if (isInitiatingDevice && hdWallet) {
          chainPrivateKeyHex = deriveChainPrivateKey({
            chain,
            hdWallet,
            walletCore,
            usePhantomSolanaPath: isStationTerraRoot
              ? undefined
              : keyImportInput.usePhantomSolanaPath,
            algorithm,
          })
        }

        let chainResult: KeyShareResult
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
            chainPrivateKeyHex ?? '',
            rootEcdsaResult.chaincode,
            setupMessageId
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
            chainPrivateKeyHex ?? '',
            rootEddsaResult?.chaincode ?? '',
            setupMessageId
          )
        }

        chainResults.push({ chain, result: chainResult })
      }
      const { chainPublicKeys, chainKeyShares } =
        getKeyImportChainKeys(chainResults)

      if (hdWallet) {
        hdWallet.delete()
      }

      const baseVault: Vault = {
        name: vaultName,
        publicKeys: {
          ecdsa: rootEcdsaResult.publicKey,
          eddsa: rootEddsaResult?.publicKey ?? '',
        },
        signers,
        createdAt: Date.now(),
        hexChainCode: rootEcdsaResult.chaincode,
        keyShares,
        localPartyId,
        libType: 'DKLS' satisfies MpcLib,
        isBackedUp: false,
        order: getLastItemOrder(vaultOrders),
        lastPasswordVerificationTime: hasServer(signers)
          ? Date.now()
          : undefined,
        chainPublicKeys,
        chainKeyShares,
      }
      const vault = withKeyImportServerChains(baseVault, chains)

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
    },
    [
      encryptionKeyHex,
      hexChainCode,
      isInitiatingDevice,
      isMLDSAEnabled,
      isTssBatchingEnabled,
      keyImportInput,
      localPartyId,
      serverUrl,
      sessionId,
      vaultName,
      vaultOrders,
      walletCore,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}

type BatchKeyImportInput = {
  sharedDklsParams: SharedDklsParams
  hexChainCode: string
  rootEcdsaPrivateKeyHex: string
  rootEddsaPrivateKeyHex: string
  includeEddsaRoot: boolean
  chainSessions: KeyImportChainSession[]
  hdWallet: any
  walletCore: any
  keyImportInput: KeyImportInput
  isInitiatingDevice: boolean
  encryptionKeyHex: string
  isMLDSAEnabled: boolean
  vaultName: string
  localPartyId: string
  signers: string[]
  vaultOrders: number[]
  serverUrl: string
  sessionId: string
  onStepStart: (step: KeygenStep) => void
  onStepComplete: (step: KeygenStep) => void
}

type DklsProtocolSpec = {
  instance: DKLS
  privateKeyHex: string
  setupMessageId: string | undefined
  protocolMessageId: string
}

type SchnorrProtocolSpec = {
  instance: Schnorr
  privateKeyHex: string
  setupMessageId: string
  protocolMessageId: string
}

type RunDklsTrackInput = {
  sharedDklsParams: SharedDklsParams
  hexChainCode: string
  rootEcdsaPrivateKeyHex: string
  ecdsaSessions: KeyImportChainSession[]
  hdWallet: any
  walletCore: any
  isInitiatingDevice: boolean
  usePhantomSolanaPath?: boolean
  onStepComplete: (step: KeygenStep) => void
}

/**
 * Phase 1 (setup upload): sequentially calls prepareKeyImportSetup for the
 * root and every per-chain ECDSA keygen. All setup messages are uploaded to
 * the relay upfront because the server's initImportProtocols fetches them
 * serially before launching any keygen goroutine — if we upload per-chain
 * setups after root keygen completes, the server times out waiting.
 *
 * Phase 2 (message exchange): sequentially runs startKeyImportWithRetry for
 * each protocol, which reuses the pending session created in Phase 1. vs_wasm
 * is not safe for concurrent use within the same curve, so exchanges must
 * also run one-at-a-time on the shared DKLS engine.
 *
 * Per-chain keygens use hexChainCode directly rather than
 * rootEcdsaResult.chaincode because the root hasn't run yet at Phase 1 time.
 * For key import the initiator defines the chain code, so these are the same
 * bytes that keyShare.rootChainCode() returns.
 */
async function runDklsTrack({
  sharedDklsParams,
  hexChainCode,
  rootEcdsaPrivateKeyHex,
  ecdsaSessions,
  hdWallet,
  walletCore,
  isInitiatingDevice,
  usePhantomSolanaPath,
  onStepComplete,
}: RunDklsTrackInput): Promise<{
  rootResult: KeyShareResult
  chainResults: KeyImportChainResult[]
}> {
  const makeDkls = () =>
    new DKLS(
      { keyimport: true },
      sharedDklsParams.isInitiateDevice,
      sharedDklsParams.serverUrl,
      sharedDklsParams.sessionId,
      sharedDklsParams.localPartyId,
      sharedDklsParams.signers,
      sharedDklsParams.oldKeygenCommittee,
      sharedDklsParams.hexEncryptionKey
    )

  const rootSpec: DklsProtocolSpec = {
    instance: makeDkls(),
    privateKeyHex: rootEcdsaPrivateKeyHex,
    setupMessageId: undefined,
    protocolMessageId: 'p-ecdsa',
  }
  const chainSpecs = ecdsaSessions.map(
    ({ chain, setupMessageId, protocolMessageId }) => ({
      chain,
      instance: makeDkls(),
      privateKeyHex:
        isInitiatingDevice && hdWallet
          ? deriveChainPrivateKey({
              chain,
              hdWallet,
              walletCore,
              usePhantomSolanaPath,
              algorithm: 'ecdsa',
            })
          : '',
      setupMessageId,
      protocolMessageId,
    })
  )

  for (const { instance, privateKeyHex, setupMessageId } of [
    rootSpec,
    ...chainSpecs,
  ]) {
    await instance.prepareKeyImportSetup(
      privateKeyHex,
      hexChainCode,
      setupMessageId
    )
  }

  const rootResult = await rootSpec.instance.startKeyImportWithRetry(
    rootSpec.privateKeyHex,
    hexChainCode,
    rootSpec.setupMessageId,
    rootSpec.protocolMessageId
  )
  onStepComplete('ecdsa')

  const chainResults: KeyImportChainResult[] = []
  for (const {
    chain,
    instance,
    privateKeyHex,
    setupMessageId,
    protocolMessageId,
  } of chainSpecs) {
    const result = await instance.startKeyImportWithRetry(
      privateKeyHex,
      hexChainCode,
      setupMessageId,
      protocolMessageId
    )
    chainResults.push({ chain, result })
  }

  return { rootResult, chainResults }
}

type RunSchnorrTrackInput = {
  sharedDklsParams: SharedDklsParams
  hexChainCode: string
  rootEddsaPrivateKeyHex: string
  eddsaSessions: KeyImportChainSession[]
  hdWallet: any
  walletCore: any
  isInitiatingDevice: boolean
  usePhantomSolanaPath?: boolean
  onStepComplete: (step: KeygenStep) => void
}

/**
 * Same two-phase pattern as runDklsTrack, on the shared Schnorr WASM engine.
 * See runDklsTrack for the setup-upfront rationale.
 */
async function runSchnorrTrack({
  sharedDklsParams,
  hexChainCode,
  rootEddsaPrivateKeyHex,
  eddsaSessions,
  hdWallet,
  walletCore,
  isInitiatingDevice,
  usePhantomSolanaPath,
  onStepComplete,
}: RunSchnorrTrackInput): Promise<{
  rootResult: KeyShareResult
  chainResults: KeyImportChainResult[]
}> {
  const makeSchnorr = () =>
    new Schnorr(
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

  const rootSpec: SchnorrProtocolSpec = {
    instance: makeSchnorr(),
    privateKeyHex: rootEddsaPrivateKeyHex,
    setupMessageId: 'eddsa_key_import',
    protocolMessageId: 'p-eddsa',
  }
  const chainSpecs = eddsaSessions.map(
    ({ chain, setupMessageId, protocolMessageId }) => ({
      chain,
      instance: makeSchnorr(),
      privateKeyHex:
        isInitiatingDevice && hdWallet
          ? deriveChainPrivateKey({
              chain,
              hdWallet,
              walletCore,
              usePhantomSolanaPath,
              algorithm: 'eddsa',
            })
          : '',
      setupMessageId,
      protocolMessageId,
    })
  )

  for (const { instance, privateKeyHex, setupMessageId } of [
    rootSpec,
    ...chainSpecs,
  ]) {
    await instance.prepareKeyImportSetup(
      privateKeyHex,
      hexChainCode,
      setupMessageId
    )
  }

  const rootResult = await rootSpec.instance.startKeyImportWithRetry(
    rootSpec.privateKeyHex,
    hexChainCode,
    rootSpec.setupMessageId,
    rootSpec.protocolMessageId
  )
  onStepComplete('eddsa')

  const chainResults: KeyImportChainResult[] = []
  for (const {
    chain,
    instance,
    privateKeyHex,
    setupMessageId,
    protocolMessageId,
  } of chainSpecs) {
    const result = await instance.startKeyImportWithRetry(
      privateKeyHex,
      hexChainCode,
      setupMessageId,
      protocolMessageId
    )
    chainResults.push({ chain, result })
  }

  return { rootResult, chainResults }
}

/**
 * Runs key import protocols in parallel across curves (DKLS, Schnorr, MLDSA)
 * but serially within each curve. vs_wasm engines are per-curve singletons
 * and not reentrant, so running multiple DKLS sessions concurrently corrupts
 * WASM memory. Message IDs (p-ecdsa, p-eddsa, p-mldsa, p-{chain}) match the
 * server's /batch/import handler.
 */
async function runBatchKeyImport({
  sharedDklsParams,
  hexChainCode,
  rootEcdsaPrivateKeyHex,
  rootEddsaPrivateKeyHex,
  includeEddsaRoot,
  chainSessions,
  hdWallet,
  walletCore,
  keyImportInput,
  isInitiatingDevice,
  encryptionKeyHex,
  isMLDSAEnabled,
  vaultName,
  localPartyId,
  signers,
  vaultOrders,
  serverUrl,
  sessionId,
  onStepStart,
  onStepComplete,
}: BatchKeyImportInput): Promise<Vault> {
  onStepStart('prepareVault')

  // Warm up the WASM engine BEFORE starting parallel tracks. `initializeMpcLib`
  // uses `memoizeAsync` which only caches on completion — concurrent calls before
  // the first one finishes will double-instantiate the WASM modules and corrupt
  // pointers inside Rust sessions ("memory access out of bounds" on outputMessage).
  const ecdsaSessions = chainSessions.filter(
    ({ algorithm }) => algorithm === 'ecdsa'
  )
  const eddsaSessions = chainSessions.filter(
    ({ algorithm }) => algorithm === 'eddsa'
  )
  const includeSchnorrTrack = includeEddsaRoot || eddsaSessions.length > 0

  await initializeMpcLib('ecdsa')
  if (includeSchnorrTrack) {
    await initializeMpcLib('eddsa')
  }

  const includeMldsa = featureFlags.mldsaKeygen && isMLDSAEnabled

  onStepComplete('prepareVault')
  onStepStart('ecdsa')
  if (includeSchnorrTrack) {
    onStepStart('eddsa')
  }
  if (chainSessions.length > 0) {
    onStepStart('chainKeys')
  }
  if (includeMldsa) {
    onStepStart('mldsa')
  }

  const dklsTrackPromise = runDklsTrack({
    sharedDklsParams,
    hexChainCode,
    rootEcdsaPrivateKeyHex,
    ecdsaSessions,
    hdWallet,
    walletCore,
    isInitiatingDevice,
    usePhantomSolanaPath: isStationTerraRootKeyImportInput(keyImportInput)
      ? undefined
      : keyImportInput.usePhantomSolanaPath,
    onStepComplete,
  })

  const schnorrTrackPromise = includeSchnorrTrack
    ? runSchnorrTrack({
        sharedDklsParams,
        hexChainCode,
        rootEddsaPrivateKeyHex,
        eddsaSessions,
        hdWallet,
        walletCore,
        isInitiatingDevice,
        usePhantomSolanaPath: isStationTerraRootKeyImportInput(keyImportInput)
          ? undefined
          : keyImportInput.usePhantomSolanaPath,
        onStepComplete,
      })
    : Promise.resolve(undefined)

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

  const [dklsTrack, schnorrTrack, mldsaResult] = await Promise.all([
    dklsTrackPromise,
    schnorrTrackPromise,
    mldsaPromise,
  ])

  if (chainSessions.length > 0) {
    onStepComplete('chainKeys')
  }

  const rootEcdsaResult = dklsTrack.rootResult
  const rootEddsaResult = schnorrTrack?.rootResult

  const { chainPublicKeys: sessionPublicKeys, chainKeyShares } =
    getKeyImportChainKeys([
      ...dklsTrack.chainResults,
      ...(schnorrTrack?.chainResults ?? []),
    ])
  const chainPublicKeys: Partial<Record<Chain, string>> =
    isStationTerraRootKeyImportInput(keyImportInput)
      ? Object.fromEntries(
          keyImportInput.chains.map(chain => [
            chain,
            keyImportInput.publicKeyHex,
          ])
        )
      : sessionPublicKeys
  const keyShares: VaultKeyShares = {
    ecdsa: rootEcdsaResult.keyshare,
    eddsa: rootEddsaResult?.keyshare ?? '',
  }

  const baseVault: Vault = {
    name: vaultName,
    publicKeys: {
      ecdsa: rootEcdsaResult.publicKey,
      eddsa: rootEddsaResult?.publicKey ?? '',
    },
    signers,
    createdAt: Date.now(),
    hexChainCode: rootEcdsaResult.chaincode,
    keyShares,
    localPartyId,
    libType: 'KeyImport' satisfies MpcLib,
    isBackedUp: false,
    order: getLastItemOrder(vaultOrders),
    lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
    chainPublicKeys,
    chainKeyShares,
    publicKeyMldsa: mldsaResult?.publicKey,
    keyShareMldsa: mldsaResult?.keyshare,
  }
  const vaultWithServerChains = withKeyImportServerChains(
    baseVault,
    chainSessions.map(({ chain }) => chain)
  )
  const vault = isStationTerraRootKeyImportInput(keyImportInput)
    ? withStationKeyImportRootChains(
        vaultWithServerChains,
        keyImportInput.chains
      )
    : vaultWithServerChains

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
