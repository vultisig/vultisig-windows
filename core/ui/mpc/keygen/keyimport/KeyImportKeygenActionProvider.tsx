import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { groupChainsByDerivationPath } from '@core/chain/derivationPath'
import { frostOnlyChains } from '@core/chain/froztChains'
import { phantomSolanaPath } from '@core/chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtImportSession } from '@core/mpc/fromt/fromtSessionFactory'
import { mnemonicToMoneroSeed } from '@core/mpc/fromt/mnemonicToMoneroSeed'
import {
  isValidMoneroMnemonic,
  moneroMnemonicToSpendKey,
} from '@core/mpc/fromt/moneroMnemonic'
import {
  parseFroztBundleResult,
  runFroztSession,
} from '@core/mpc/frozt/froztSession'
import { createFroztImportSession } from '@core/mpc/frozt/froztSessionFactory'
import { mnemonicToSeed } from '@core/mpc/frozt/mnemonicToSeed'
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
import { HDKey } from '@scure/bip32'

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
    const hasFromt = chains.includes(Chain.Monero)
    const hasFrozt = chains.includes(Chain.ZcashSapling)
    const isBip39Mnemonic = walletCore.Mnemonic.isValid(mnemonic)
    const isNativeMoneroMnemonic =
      isInitiatingDevice && hasFromt && !isBip39Mnemonic
        ? await isValidMoneroMnemonic(mnemonic)
        : false

    onStepStart('prepareVault')

    const needsHdWallet =
      isInitiatingDevice && chains.some(c => !frostOnlyChains.includes(c))

    let hdWallet: ReturnType<
      typeof walletCore.HDWallet.createWithMnemonic
    > | null = null
    if (needsHdWallet) {
      if (!isBip39Mnemonic) {
        throw new Error('Invalid mnemonic — cannot derive keys')
      }
      hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
    }

    if (
      isNativeMoneroMnemonic &&
      chains.some(chain => chain !== Chain.Monero)
    ) {
      throw new Error(
        'Native Monero mnemonic import is only supported for Monero-only vaults'
      )
    }

    const nativeMoneroSpendKey =
      isInitiatingDevice && isNativeMoneroMnemonic
        ? await moneroMnemonicToSpendKey(mnemonic)
        : null

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
    if (isInitiatingDevice) {
      if (hdWallet) {
        const ecdsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
        rootEcdsaPrivateKeyHex = Buffer.from(ecdsaMasterKey.data()).toString(
          'hex'
        )
        const eddsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
        const eddsaMasterKeyData = new Uint8Array(eddsaMasterKey.data())
        rootEddsaPrivateKeyHex = Buffer.from(
          clampThenUniformScalar(eddsaMasterKeyData)
        ).toString('hex')
      } else if (isBip39Mnemonic) {
        const bip39Seed = mnemonicToSeed(mnemonic)
        const master = HDKey.fromMasterSeed(bip39Seed)
        rootEcdsaPrivateKeyHex = Buffer.from(master.privateKey!).toString('hex')
        rootEddsaPrivateKeyHex = Buffer.from(
          clampThenUniformScalar(master.privateKey!)
        ).toString('hex')
      } else if (nativeMoneroSpendKey) {
        const master = HDKey.fromMasterSeed(nativeMoneroSpendKey)
        rootEcdsaPrivateKeyHex = Buffer.from(master.privateKey!).toString('hex')
        rootEddsaPrivateKeyHex = Buffer.from(
          clampThenUniformScalar(master.privateKey!)
        ).toString('hex')
      } else {
        const rawSeed = mnemonicToSeed(mnemonic)
        const master = HDKey.fromMasterSeed(rawSeed)
        rootEcdsaPrivateKeyHex = Buffer.from(master.privateKey!).toString('hex')
        rootEddsaPrivateKeyHex = Buffer.from(
          clampThenUniformScalar(master.privateKey!)
        ).toString('hex')
      }
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

    const zcashBirthday = keyImportInput.zcashBirthday ?? 0
    const moneroBirthday = keyImportInput.moneroBirthday ?? 0

    const froztSeed =
      isInitiatingDevice && hasFrozt
        ? mnemonicToSeed(mnemonic)
        : new Uint8Array()
    const fromtSeed =
      isInitiatingDevice && hasFromt && !nativeMoneroSpendKey
        ? mnemonicToMoneroSeed(mnemonic)
        : new Uint8Array()

    const froztSession = hasFrozt
      ? await createFroztImportSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'frozt',
          isInitiatingDevice,
          signers,
          seed: froztSeed,
          accountIndex: 0,
          birthday: zcashBirthday,
        })
      : null

    const fromtSession = hasFromt
      ? await createFromtImportSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'fromt',
          isInitiatingDevice,
          signers,
          seed: fromtSeed,
          spendKey: nativeMoneroSpendKey ?? undefined,
          birthday: moneroBirthday,
        })
      : null

    const nonFrostChains = chains.filter(c => !frostOnlyChains.includes(c))
    const groups = groupChainsByDerivationPath(nonFrostChains)

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
        onStepComplete('chainKeys')
        return result
      }
    )

    const frostPromises: Promise<Uint8Array | null>[] = []

    if (froztSession) {
      frostPromises.push(
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
        })
      )
    }

    if (fromtSession) {
      frostPromises.push(
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
        })
      )
    }

    onStepComplete('prepareVault')
    onStepStart('ecdsa')
    onStepStart('eddsa')
    if (hasFrozt) onStepStart('frozt')
    if (hasFromt) onStepStart('fromt')
    if (preparedGroups.length > 0) onStepStart('chainKeys')

    const [rootEcdsaResult, rootEddsaResult, ...restResults] =
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
        ...frostPromises,
        ...chainGroupPromises,
      ])

    const chainPublicKeys: Partial<Record<Chain, string>> = {}
    const chainKeyShares: Partial<Record<Chain, string>> = {}
    let saplingExtras: string | undefined

    let frostIdx = 0
    if (hasFrozt) {
      const froztResult = parseFroztBundleResult(
        restResults[frostIdx++] as Uint8Array
      )
      chainPublicKeys[Chain.ZcashSapling] = froztResult.pubKeyPackage
      chainKeyShares[Chain.ZcashSapling] = froztResult.bundle
      saplingExtras = froztResult.saplingExtras || undefined
    }
    if (hasFromt) {
      const fromtResult = parseFromtBundleResult(
        restResults[frostIdx++] as Uint8Array
      )
      chainPublicKeys[Chain.Monero] = fromtResult.pubKey
      chainKeyShares[Chain.Monero] = fromtResult.keyShare
    }

    const chainResults = restResults.slice(frostIdx)
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
      libType: 'KeyImport' as MpcLib,
      isBackedUp: false,
      order: getLastItemOrder(vaultOrders),
      lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
      chainPublicKeys,
      chainKeyShares,
      saplingExtras,
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

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
