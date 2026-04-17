import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { featureFlags } from '@core/ui/featureFlags'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useIsMLDSAEnabled } from '@core/ui/storage/mldsaEnabled'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { phantomSolanaPath } from '@vultisig/core-chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { signatureAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { DKLS } from '@vultisig/core-mpc/dkls/dkls'
import { KeygenStep } from '@vultisig/core-mpc/keygen/KeygenStep'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@vultisig/core-mpc/keygenComplete'
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
import { useKeyImportInput } from './state/keyImportInput'
import { getKeyImportDerivationGroups } from './utils/getKeyImportDerivationGroups'

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
  representativeChain: Chain
  hdWallet: any
  walletCore: any
  usePhantomSolanaPath?: boolean
  algorithm: string
}

/** Derives the hex-encoded private key for a specific chain from the HD wallet. */
const deriveChainPrivateKey = ({
  representativeChain,
  hdWallet,
  walletCore,
  usePhantomSolanaPath,
  algorithm,
}: DeriveChainKeyInput): string => {
  const coinType = getCoinType({ chain: representativeChain, walletCore })
  const chainKey =
    representativeChain === Chain.Solana && usePhantomSolanaPath
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
  const isTssBatchingEnabled = useIsTssBatchingEnabled()
  const isMLDSAEnabled = useIsMLDSAEnabled()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, onStepStart, onStepComplete, signers }) => {
      const { mnemonic, chains } = keyImportInput

      let hdWallet: ReturnType<
        typeof walletCore.HDWallet.createWithMnemonic
      > | null = null
      if (isInitiatingDevice) {
        hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
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
      if (isInitiatingDevice && hdWallet) {
        const masterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
        rootEcdsaPrivateKeyHex = Buffer.from(masterKey.data()).toString('hex')
      }

      let rootEddsaPrivateKeyHex: string | undefined
      if (isInitiatingDevice && hdWallet) {
        const masterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
        const masterKeyData = new Uint8Array(masterKey.data())
        const clampedKey = clampThenUniformScalar(masterKeyData)
        rootEddsaPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
      }

      const derivationGroups = getKeyImportDerivationGroups(chains)

      if (isTssBatchingEnabled) {
        const vault = await runBatchKeyImport({
          sharedDklsParams,
          hexChainCode,
          rootEcdsaPrivateKeyHex: rootEcdsaPrivateKeyHex ?? '',
          rootEddsaPrivateKeyHex: rootEddsaPrivateKeyHex ?? '',
          derivationGroups,
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
        rootEddsaPrivateKeyHex ?? '',
        hexChainCode
      )

      const chainPublicKeys: Partial<Record<Chain, string>> = {}
      const chainKeyShares: Partial<Record<Chain, string>> = {}
      const keyShares: VaultKeyShares = {
        ecdsa: rootEcdsaResult.keyshare,
        eddsa: rootEddsaResult.keyshare,
      }

      for (const {
        representativeChain,
        chains: groupChains,
      } of derivationGroups) {
        const chainKind = getChainKind(representativeChain)
        const algorithm = signatureAlgorithms[chainKind]

        let chainPrivateKeyHex: string | undefined
        if (isInitiatingDevice && hdWallet) {
          chainPrivateKeyHex = deriveChainPrivateKey({
            representativeChain,
            hdWallet,
            walletCore,
            usePhantomSolanaPath: keyImportInput.usePhantomSolanaPath,
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
            chainPrivateKeyHex ?? '',
            rootEddsaResult.chaincode,
            representativeChain
          )
        }

        for (const chain of groupChains) {
          chainPublicKeys[chain] = chainResult.publicKey
          chainKeyShares[chain] = chainResult.keyshare
        }
      }

      if (hdWallet) {
        hdWallet.delete()
      }

      const vault: Vault = {
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
        libType: 'DKLS' as MpcLib,
        isBackedUp: false,
        order: getLastItemOrder(vaultOrders),
        lastPasswordVerificationTime: hasServer(signers)
          ? Date.now()
          : undefined,
        chainPublicKeys,
        chainKeyShares,
      }

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
  derivationGroups: ReturnType<typeof getKeyImportDerivationGroups>
  hdWallet: any
  walletCore: any
  keyImportInput: { usePhantomSolanaPath?: boolean }
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

type ChainKeygenResult = {
  chains: Chain[]
  result: KeyShareResult
}

type RunDklsTrackInput = {
  sharedDklsParams: SharedDklsParams
  hexChainCode: string
  rootEcdsaPrivateKeyHex: string
  ecdsaGroups: ReturnType<typeof getKeyImportDerivationGroups>
  hdWallet: any
  walletCore: any
  isInitiatingDevice: boolean
  usePhantomSolanaPath?: boolean
  onStepComplete: (step: KeygenStep) => void
}

/**
 * Runs root ECDSA keygen then each per-chain ECDSA keygen sequentially
 * on the single shared DKLS WASM engine. vs_wasm is not safe for
 * concurrent use within the same curve — running DKLS sessions in
 * parallel causes "memory access out of bounds" errors.
 */
async function runDklsTrack({
  sharedDklsParams,
  hexChainCode,
  rootEcdsaPrivateKeyHex,
  ecdsaGroups,
  hdWallet,
  walletCore,
  isInitiatingDevice,
  usePhantomSolanaPath,
  onStepComplete,
}: RunDklsTrackInput): Promise<{
  rootResult: KeyShareResult
  chainResults: ChainKeygenResult[]
}> {
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

  const rootResult = await dklsKeygen.startKeyImportWithRetry(
    rootEcdsaPrivateKeyHex,
    hexChainCode,
    undefined,
    'p-ecdsa'
  )
  onStepComplete('ecdsa')

  const chainResults: ChainKeygenResult[] = []
  for (const { representativeChain, chains: groupChains } of ecdsaGroups) {
    let chainPrivateKeyHex = ''
    if (isInitiatingDevice && hdWallet) {
      chainPrivateKeyHex = deriveChainPrivateKey({
        representativeChain,
        hdWallet,
        walletCore,
        usePhantomSolanaPath,
        algorithm: 'ecdsa',
      })
    }

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

    const result = await chainDkls.startKeyImportWithRetry(
      chainPrivateKeyHex,
      hexChainCode,
      representativeChain,
      `p-${representativeChain}`
    )

    chainResults.push({ chains: groupChains, result })
  }

  return { rootResult, chainResults }
}

type RunSchnorrTrackInput = {
  sharedDklsParams: SharedDklsParams
  hexChainCode: string
  rootEddsaPrivateKeyHex: string
  eddsaGroups: ReturnType<typeof getKeyImportDerivationGroups>
  hdWallet: any
  walletCore: any
  isInitiatingDevice: boolean
  usePhantomSolanaPath?: boolean
  onStepComplete: (step: KeygenStep) => void
}

/**
 * Runs root EdDSA keygen then each per-chain EdDSA keygen sequentially
 * on the single shared Schnorr WASM engine.
 */
async function runSchnorrTrack({
  sharedDklsParams,
  hexChainCode,
  rootEddsaPrivateKeyHex,
  eddsaGroups,
  hdWallet,
  walletCore,
  isInitiatingDevice,
  usePhantomSolanaPath,
  onStepComplete,
}: RunSchnorrTrackInput): Promise<{
  rootResult: KeyShareResult
  chainResults: ChainKeygenResult[]
}> {
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

  const rootResult = await schnorrKeygen.startKeyImportWithRetry(
    rootEddsaPrivateKeyHex,
    hexChainCode,
    'eddsa_key_import',
    'p-eddsa'
  )
  onStepComplete('eddsa')

  const chainResults: ChainKeygenResult[] = []
  for (const { representativeChain, chains: groupChains } of eddsaGroups) {
    let chainPrivateKeyHex = ''
    if (isInitiatingDevice && hdWallet) {
      chainPrivateKeyHex = deriveChainPrivateKey({
        representativeChain,
        hdWallet,
        walletCore,
        usePhantomSolanaPath,
        algorithm: 'eddsa',
      })
    }

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

    const result = await chainSchnorr.startKeyImportWithRetry(
      chainPrivateKeyHex,
      hexChainCode,
      representativeChain,
      `p-${representativeChain}`
    )

    chainResults.push({ chains: groupChains, result })
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
  derivationGroups,
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

  const ecdsaGroups = derivationGroups.filter(
    ({ representativeChain }) =>
      signatureAlgorithms[getChainKind(representativeChain)] === 'ecdsa'
  )
  const eddsaGroups = derivationGroups.filter(
    ({ representativeChain }) =>
      signatureAlgorithms[getChainKind(representativeChain)] === 'eddsa'
  )

  const includeMldsa = featureFlags.mldsaKeygen && isMLDSAEnabled

  onStepComplete('prepareVault')
  onStepStart('ecdsa')
  onStepStart('eddsa')
  if (derivationGroups.length > 0) {
    onStepStart('chainKeys')
  }
  if (includeMldsa) {
    onStepStart('mldsa')
  }

  const dklsTrackPromise = runDklsTrack({
    sharedDklsParams,
    hexChainCode,
    rootEcdsaPrivateKeyHex,
    ecdsaGroups,
    hdWallet,
    walletCore,
    isInitiatingDevice,
    usePhantomSolanaPath: keyImportInput.usePhantomSolanaPath,
    onStepComplete,
  })

  const schnorrTrackPromise = runSchnorrTrack({
    sharedDklsParams,
    hexChainCode,
    rootEddsaPrivateKeyHex,
    eddsaGroups,
    hdWallet,
    walletCore,
    isInitiatingDevice,
    usePhantomSolanaPath: keyImportInput.usePhantomSolanaPath,
    onStepComplete,
  })

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

  if (derivationGroups.length > 0) {
    onStepComplete('chainKeys')
  }

  const rootEcdsaResult = dklsTrack.rootResult
  const rootEddsaResult = schnorrTrack.rootResult

  const chainPublicKeys: Partial<Record<Chain, string>> = {}
  const chainKeyShares: Partial<Record<Chain, string>> = {}
  const keyShares: VaultKeyShares = {
    ecdsa: rootEcdsaResult.keyshare,
    eddsa: rootEddsaResult.keyshare,
  }

  for (const { chains: groupChains, result } of [
    ...dklsTrack.chainResults,
    ...schnorrTrack.chainResults,
  ]) {
    for (const chain of groupChains) {
      chainPublicKeys[chain] = result.publicKey
      chainKeyShares[chain] = result.keyshare
    }
  }

  const vault: Vault = {
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
    lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
    chainPublicKeys,
    chainKeyShares,
    publicKeyMldsa: mldsaResult?.publicKey,
    keyShareMldsa: mldsaResult?.keyshare,
  }

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
