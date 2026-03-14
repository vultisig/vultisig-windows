import { Chain } from '@core/chain/Chain'
import { encodeDERSignature } from '@core/mpc/derSignature'
import { runFroztSession } from '@core/mpc/frozt/froztSession'
import { createFroztSignSession } from '@core/mpc/frozt/froztSessionFactory'
import { keysign } from '@core/mpc/keysign'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { withMpcRetry } from '@core/mpc/withMpcRetry'
import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { useCallback } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../vault/state/currentVault'
import { useMpcSigners } from '../../devices/state/signers'
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '../../state/isInitiatingDevice'
import { useMpcServerUrl } from '../../state/mpcServerUrl'
import { useMpcSessionId } from '../../state/mpcSession'
import {
  KeysignAction,
  KeysignActionProvider as BaseKeysignActionProvider,
} from './state/keysignAction'

const eddsaPlaceholderChainPath = 'm'

const froztSignatureToKeysignSignature = (
  signature: Uint8Array,
  hexMessage: string
): KeysignSignature => {
  const r = signature.slice(0, 32)
  const s = signature.slice(32, 64)
  const derSig = encodeDERSignature(r, s)

  return {
    msg: Buffer.from(hexMessage, 'hex').toString('base64'),
    r: Buffer.from(r).toString('hex'),
    s: Buffer.from(s).toString('hex'),
    der_signature: Buffer.from(derSig).toString('hex'),
  }
}

export const KeysignActionProvider = ({ children }: ChildrenProp) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()
  const isInitiatingDevice = useIsInitiatingDevice()
  const signers = useMpcSigners()

  const keysignAction: KeysignAction = useCallback(
    async ({ msgs, signatureAlgorithm, coinType, chain }) => {
      const usesFrozt = chain === Chain.ZcashSapling

      if (usesFrozt) {
        const keyPackageBase64 = shouldBePresent(
          vault.chainKeyShares?.[Chain.ZcashSapling],
          'Frozt keyshare'
        )
        const pubKeyPackageBase64 = shouldBePresent(
          vault.chainPublicKeys?.[Chain.ZcashSapling],
          'Frozt public key package'
        )

        const keyPackage = new Uint8Array(
          Buffer.from(keyPackageBase64, 'base64')
        )
        const pubKeyPackage = new Uint8Array(
          Buffer.from(pubKeyPackageBase64, 'base64')
        )
        return chainPromises(
          msgs.map((message, index) => async () => {
            const rawSig = await withMpcRetry(async () => {
              const session = await createFroztSignSession({
                serverUrl,
                sessionId,
                localPartyId: vault.localPartyId,
                hexEncryptionKey: encryptionKeyHex,
                setupMessageId: `frozt-sign-setup-${index}`,
                isInitiatingDevice,
                signers,
                msgToSign: new Uint8Array(Buffer.from(message, 'hex')),
                keyPackage,
                pubKeyPackage,
              })
              return runFroztSession({
                session,
                messageId: `frozt-sign-${index}`,
                serverUrl,
                sessionId,
                localPartyId: vault.localPartyId,
                signers,
                hexEncryptionKey: encryptionKeyHex,
              })
            }, `frozt-sign-${index}`)
            return froztSignatureToKeysignSignature(rawSig, message)
          })
        )
      }

      const keyShare = shouldBePresent(
        isKeyImportVault(vault)
          ? vault.chainKeyShares?.[chain]
          : vault.keyShares[signatureAlgorithm],
        'Keyshare'
      )

      return chainPromises(
        msgs.map(
          message => async () =>
            keysign({
              keyShare,
              signatureAlgorithm,
              message,
              chainPath: isKeyImportVault(vault)
                ? eddsaPlaceholderChainPath
                : match(signatureAlgorithm, {
                    ecdsa: () =>
                      walletCore.CoinTypeExt.derivationPath(
                        coinType
                      ).replaceAll("'", ''),
                    eddsa: () => eddsaPlaceholderChainPath,
                  }),
              localPartyId: vault.localPartyId,
              peers: signers.filter(party => party !== vault.localPartyId),
              serverUrl,
              sessionId,
              hexEncryptionKey: encryptionKeyHex,
              isInitiatingDevice,
            })
        )
      )
    },
    [
      encryptionKeyHex,
      isInitiatingDevice,
      serverUrl,
      sessionId,
      signers,
      vault,
      walletCore,
    ]
  )

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
