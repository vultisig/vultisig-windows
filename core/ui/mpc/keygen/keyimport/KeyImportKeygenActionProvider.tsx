import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { groupChainsByDerivationPath } from '@core/chain/derivationPath'
import { phantomSolanaPath } from '@core/chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { clampThenUniformScalar } from '@core/mpc/utils/ed25519ScalarClamp'
import { Vault, VaultKeyShares } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
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

  const keygenAction: KeygenAction = async ({
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    const { mnemonic, chains } = keyImportInput

    onStepStart('prepareVault')

    let hdWallet: ReturnType<
      typeof walletCore.HDWallet.createWithMnemonic
    > | null = null
    try {
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

      let rootEcdsaPrivateKeyHex: string | undefined
      let rootEddsaPrivateKeyHex: string | undefined
      if (isInitiatingDevice && hdWallet) {
        const ecdsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
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

      const groups = groupChainsByDerivationPath(chains)

      type PreparedGroup = {
        groupId: string
        groupChains: Chain[]
        algorithm: 'ecdsa' | 'eddsa'
        chainPrivateKeyHex: string
        instance: DKLS | Schnorr
      }
      const preparedGroups: PreparedGroup[] = []

      for (const { groupId, chains: groupChains } of groups) {
        const representativeChain = groupChains[0]
        const chainKind = getChainKind(representativeChain)
        const algorithm = signatureAlgorithms[chainKind]
        const coinType = getCoinType({ chain: representativeChain, walletCore })

        let chainPrivateKeyHex = ''
        if (isInitiatingDevice && hdWallet) {
          const chainKey =
            representativeChain === Chain.Solana &&
            keyImportInput.usePhantomSolanaPath
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
            groupId
          )
          preparedGroups.push({
            groupId,
            groupChains,
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
            groupId
          )
          preparedGroups.push({
            groupId,
            groupChains,
            algorithm,
            chainPrivateKeyHex,
            instance,
          })
        }
      }

      onStepComplete('prepareVault')
      onStepStart('ecdsa')
      onStepStart('eddsa')
      if (preparedGroups.length > 0) {
        onStepStart('chainKeys')
      }

      const chainGroupPromises = preparedGroups.map(
        async ({ groupId, algorithm, chainPrivateKeyHex, instance }) => {
          const result =
            algorithm === 'ecdsa'
              ? await (instance as DKLS).startKeyImportWithRetry(
                  chainPrivateKeyHex,
                  hexChainCode,
                  groupId,
                  `p-${groupId}`
                )
              : await (instance as Schnorr).startKeyImportWithRetry(
                  chainPrivateKeyHex,
                  hexChainCode,
                  groupId,
                  `p-${groupId}`
                )
          return result
        }
      )

      const chainKeysPromise =
        chainGroupPromises.length > 0
          ? Promise.all(chainGroupPromises).then(results => {
              onStepComplete('chainKeys')
              return results
            })
          : Promise.resolve([])

      const [rootEcdsaResult, rootEddsaResult, chainResults] =
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
        ])

      const chainPublicKeys: Partial<Record<Chain, string>> = {}
      const chainKeyShares: Partial<Record<Chain, string>> = {}
      const keyShares: VaultKeyShares = {
        ecdsa: rootEcdsaResult.keyshare,
        eddsa: rootEddsaResult.keyshare,
      }

      for (let i = 0; i < preparedGroups.length; i++) {
        const { groupChains } = preparedGroups[i]
        const chainResult = chainResults[i] as {
          keyshare: string
          publicKey: string
          chaincode: string
        }
        for (const chain of groupChains) {
          chainPublicKeys[chain] = chainResult.publicKey
          chainKeyShares[chain] = chainResult.keyshare
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
