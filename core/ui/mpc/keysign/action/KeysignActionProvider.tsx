import { Chain } from '@core/chain/Chain'
import { encodeDERSignature } from '@core/mpc/derSignature'
import { FroztKeysign } from '@core/mpc/frozt/froztKeysign'
import { keysign } from '@core/mpc/keysign'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { useCallback } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../vault/state/currentVault'
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '../../state/isInitiatingDevice'
import { useMpcPeers } from '../../state/mpcPeers'
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
  const peers = useMpcPeers()

  const keysignAction: KeysignAction = useCallback(
    async ({ msgs, signatureAlgorithm, coinType, chain }) => {
      const usesFrozt = chain === Chain.ZcashShielded

      if (usesFrozt) {
        const keyPackage = shouldBePresent(
          vault.chainKeyShares?.[Chain.ZcashShielded],
          'Frozt keyshare'
        )
        const pubKeyPackage = shouldBePresent(
          vault.chainPublicKeys?.[Chain.ZcashShielded],
          'Frozt public key package'
        )

        const froztKeysign = new FroztKeysign(
          isInitiatingDevice,
          serverUrl,
          sessionId,
          vault.localPartyId,
          [vault.localPartyId, ...peers],
          encryptionKeyHex
        )

        return chainPromises(
          msgs.map(message => async () => {
            const rawSig = await froztKeysign.sign(
              Buffer.from(message, 'hex'),
              keyPackage,
              pubKeyPackage
            )
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
              peers,
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
      peers,
      serverUrl,
      sessionId,
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
