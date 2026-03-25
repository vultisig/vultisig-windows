import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { phantomSolanaPath } from '@core/chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MldsaKeygen } from '@core/mpc/mldsa/mldsaKeygen'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { clampThenUniformScalar } from '@core/mpc/utils/ed25519ScalarClamp'
import { Vault, VaultKeyShares } from '@core/mpc/vault/Vault'
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
import { without } from '@lib/utils/array/without'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import { useKeyImportInput } from './state/keyImportInput'

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

  const keygenAction: KeygenAction = async ({
    onStepChange,
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    const { mnemonic, chains } = keyImportInput

    let hdWallet: ReturnType<
      typeof walletCore.HDWallet.createWithMnemonic
    > | null = null
    if (isInitiatingDevice) {
      hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
    }

    const sharedDklsParams = {
      isInitiateDevice: isInitiatingDevice,
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      oldKeygenCommittee: [] as string[],
      hexEncryptionKey: encryptionKeyHex,
    }

    try {
      if (isTssBatchingEnabled) {
        onStepStart('prepareVault')

        let rootEcdsaPrivateKeyHex: string | undefined
        let rootEddsaPrivateKeyHex: string | undefined
        if (isInitiatingDevice && hdWallet) {
          const ecdsaMasterKey = hdWallet.getMasterKey(
            walletCore.Curve.secp256k1
          )
          rootEcdsaPrivateKeyHex = Buffer.from(ecdsaMasterKey.data()).toString(
            'hex'
          )
          const eddsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
          const eddsaMasterKeyData = new Uint8Array(eddsaMasterKey.data())
          rootEddsaPrivateKeyHex = Buffer.from(
            clampThenUniformScalar(eddsaMasterKeyData)
          ).toString('hex')
        }

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

        type PreparedChain = {
          chain: Chain
          algorithm: 'ecdsa' | 'eddsa'
          chainPrivateKeyHex: string
          instance: DKLS | Schnorr
        }
        const preparedChains: PreparedChain[] = []

        for (const chain of chains) {
          const chainKind = getChainKind(chain)
          const algorithm = signatureAlgorithms[chainKind]
          const coinType = getCoinType({ chain, walletCore })

          let chainPrivateKeyHex = ''
          if (isInitiatingDevice && hdWallet) {
            const chainKey =
              chain === Chain.Solana && keyImportInput.usePhantomSolanaPath
                ? hdWallet.getKey(coinType, phantomSolanaPath)
                : hdWallet.getKeyForCoin(coinType)

            const chainKeyData = new Uint8Array(chainKey.data())

            if (algorithm === 'ecdsa') {
              chainPrivateKeyHex = Buffer.from(chainKeyData).toString('hex')
            } else {
              const clampedKey = clampThenUniformScalar(chainKeyData)
              chainPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
            }
          }

          if (algorithm === 'ecdsa') {
            const instance = new DKLS(
              { keyimport: true },
              sharedDklsParams.isInitiateDevice,
              sharedDklsParams.serverUrl,
              sharedDklsParams.sessionId,
              sharedDklsParams.localPartyId,
              sharedDklsParams.signers,
              sharedDklsParams.oldKeygenCommittee,
              sharedDklsParams.hexEncryptionKey
            )
            await instance.prepareKeyImportSetup(
              chainPrivateKeyHex,
              hexChainCode,
              chain
            )
            preparedChains.push({
              chain,
              algorithm,
              chainPrivateKeyHex,
              instance,
            })
          } else {
            const instance = new Schnorr(
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
            await instance.prepareKeyImportSetup(
              chainPrivateKeyHex,
              hexChainCode,
              chain
            )
            preparedChains.push({
              chain,
              algorithm,
              chainPrivateKeyHex,
              instance,
            })
          }
        }

        const includeMldsa = featureFlags.mldsaKeygen && isMLDSAEnabled

        onStepComplete('prepareVault')
        onStepStart('ecdsa')
        onStepStart('eddsa')
        if (preparedChains.length > 0) {
          onStepStart('chainKeys')
        }
        if (includeMldsa) {
          onStepStart('mldsa')
        }

        const chainPromises = preparedChains.map(
          async ({ chain, algorithm, chainPrivateKeyHex, instance }) => {
            const result =
              algorithm === 'ecdsa'
                ? await (instance as DKLS).startKeyImportWithRetry(
                    chainPrivateKeyHex,
                    hexChainCode,
                    chain,
                    `p-${chain}`
                  )
                : await (instance as Schnorr).startKeyImportWithRetry(
                    chainPrivateKeyHex,
                    hexChainCode,
                    chain,
                    `p-${chain}`
                  )
            return { chain, result }
          }
        )

        const chainKeysPromise =
          chainPromises.length > 0
            ? Promise.all(chainPromises).then(results => {
                onStepComplete('chainKeys')
                return results
              })
            : Promise.resolve([])

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

        const [rootEcdsaResult, rootEddsaResult, chainResults, mldsaResult] =
          await Promise.all([
            dklsKeygen
              .startKeyImportWithRetry(
                rootEcdsaPrivateKeyHex ?? '',
                hexChainCode,
                undefined,
                'p-ecdsa'
              )
              .then(r => {
                onStepComplete('ecdsa')
                return r
              }),
            schnorrKeygen
              .startKeyImportWithRetry(
                rootEddsaPrivateKeyHex ?? '',
                hexChainCode,
                'eddsa_key_import',
                'p-eddsa'
              )
              .then(r => {
                onStepComplete('eddsa')
                return r
              }),
            chainKeysPromise,
            mldsaPromise,
          ])

        const chainPublicKeys: Partial<Record<Chain, string>> = {}
        const chainKeyShares: Partial<Record<Chain, string>> = {}
        const keyShares: VaultKeyShares = {
          ecdsa: rootEcdsaResult.keyshare,
          eddsa: rootEddsaResult.keyshare,
        }

        for (const { chain, result } of chainResults) {
          chainPublicKeys[chain] = result.publicKey
          chainKeyShares[chain] = result.keyshare
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
          lastPasswordVerificationTime: hasServer(signers)
            ? Date.now()
            : undefined,
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
      } else {
        onStepChange('ecdsa')

        let rootEcdsaPrivateKeyHex: string | undefined
        if (isInitiatingDevice && hdWallet) {
          const masterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
          rootEcdsaPrivateKeyHex = Buffer.from(masterKey.data()).toString('hex')
        }

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

        let rootEddsaPrivateKeyHex: string | undefined
        if (isInitiatingDevice && hdWallet) {
          const masterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
          const masterKeyData = new Uint8Array(masterKey.data())
          const clampedKey = clampThenUniformScalar(masterKeyData)
          rootEddsaPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
        }

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

        for (const chain of chains) {
          const chainKind = getChainKind(chain)
          const algorithm = signatureAlgorithms[chainKind]
          const coinType = getCoinType({ chain, walletCore })

          let chainPrivateKeyHex: string | undefined
          if (isInitiatingDevice && hdWallet) {
            const chainKey =
              chain === Chain.Solana && keyImportInput.usePhantomSolanaPath
                ? hdWallet.getKey(coinType, phantomSolanaPath)
                : hdWallet.getKeyForCoin(coinType)

            const chainKeyData = new Uint8Array(chainKey.data())

            if (algorithm === 'ecdsa') {
              chainPrivateKeyHex = Buffer.from(chainKeyData).toString('hex')
            } else {
              const clampedKey = clampThenUniformScalar(chainKeyData)
              chainPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
            }
          }

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
              chainPrivateKeyHex ?? '',
              rootEcdsaResult.chaincode,
              chain
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
              chain
            )
          }

          chainPublicKeys[chain] = chainResult.publicKey
          chainKeyShares[chain] = chainResult.keyshare
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
          const mldsaResult = await mldsaKeygen.startKeygenWithRetry()
          publicKeyMldsa = mldsaResult.publicKey
          keyShareMldsa = mldsaResult.keyshare
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
          lastPasswordVerificationTime: hasServer(signers)
            ? Date.now()
            : undefined,
          chainPublicKeys,
          chainKeyShares,
          publicKeyMldsa,
          keyShareMldsa,
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
    } finally {
      if (hdWallet) {
        hdWallet.delete()
      }
    }
  }

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
