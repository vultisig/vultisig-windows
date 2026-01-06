import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
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
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useCallback } from 'react'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import { useKeyImportInput } from './state/keyImportInput'

type KeyShareResult = {
  keyshare: string
  publicKey: string
  chaincode: string
}

export const KeyImportKeygenActionProvider = ({ children }: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const vaultOrders = useVaultOrders()
  const walletCore = useAssertWalletCore()
  const keyImportInput = useKeyImportInput()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, signers }) => {
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
        oldKeygenCommittee: [],
        hexEncryptionKey: encryptionKeyHex,
      }

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
        ''
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
        ''
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
          const chainKey = hdWallet.getKeyForCoin(coinType)
          const chainKeyData = new Uint8Array(chainKey.data())

          if (algorithm === 'ecdsa') {
            chainPrivateKeyHex = Buffer.from(chainKeyData).toString('hex')
          } else {
            const clampedKey = clampThenUniformScalar(chainKeyData)
            chainPrivateKeyHex = Buffer.from(clampedKey).toString('hex')
          }
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
      isInitiatingDevice,
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
