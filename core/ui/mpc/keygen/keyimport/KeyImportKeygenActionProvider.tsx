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
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Schnorr } from '@vultisig/core-mpc/schnorr/schnorrKeygen'
import { clampThenUniformScalar } from '@vultisig/core-mpc/utils/ed25519ScalarClamp'
import { Vault, VaultKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { without } from '@vultisig/lib-utils/array/without'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'
import { useCallback } from 'react'

import {
  MldsaProtocolSpec,
  SharedMpcParams,
} from '../../worker/keygenWorkerProtocol'
import { runKeyImportViaWorkers } from '../../worker/runKeyImportViaWorkers'
import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import { useKeyImportInput } from './state/keyImportInput'
import { buildKeyImportProtocolSpecs } from './utils/buildKeyImportProtocolSpecs'
import { getKeyImportDerivationGroups } from './utils/getKeyImportDerivationGroups'
import { withKeyImportServerChains } from './utils/keyImportServerChains'

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
  const isTssBatchingEnabled = useIsTssBatching()
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
        libType: 'DKLS' satisfies MpcLib,
        isBackedUp: false,
        order: getLastItemOrder(vaultOrders),
        lastPasswordVerificationTime: hasServer(signers)
          ? Date.now()
          : undefined,
        chainPublicKeys,
        chainKeyShares,
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

/**
 * Runs key import with one MPC session per Web Worker — true parallel keygen
 * across curves AND across chains (issue #3754). Each worker is an isolated
 * realm with its own DKLS/Schnorr/MLDSA WASM instance, so same-curve sessions
 * no longer serialize on a single shared engine.
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

  const shared: SharedMpcParams = {
    isInitiateDevice: sharedDklsParams.isInitiateDevice,
    serverUrl: sharedDklsParams.serverUrl,
    sessionId: sharedDklsParams.sessionId,
    localPartyId: sharedDklsParams.localPartyId,
    signers: sharedDklsParams.signers,
    oldKeygenCommittee: sharedDklsParams.oldKeygenCommittee,
    hexEncryptionKey: sharedDklsParams.hexEncryptionKey,
  }

  const { specs, chainsById } = buildKeyImportProtocolSpecs({
    shared,
    hexChainCode,
    derivationGroups,
    uploadSetup: true,
    rootEcdsaPrivateKeyHex,
    rootEddsaPrivateKeyHex,
    getChainPrivateKeyHex: ({ representativeChain, curve }) =>
      isInitiatingDevice && hdWallet
        ? deriveChainPrivateKey({
            representativeChain,
            hdWallet,
            walletCore,
            usePhantomSolanaPath: keyImportInput.usePhantomSolanaPath,
            algorithm: curve,
          })
        : '',
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
    libType: 'KeyImport' satisfies MpcLib,
    isBackedUp: false,
    order: getLastItemOrder(vaultOrders),
    lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
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
}
