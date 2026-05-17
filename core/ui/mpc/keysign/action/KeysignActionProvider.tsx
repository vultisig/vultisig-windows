import { ChildrenProp } from '@lib/ui/props'
import { keysign } from '@vultisig/core-mpc/keysign'
import { MldsaKeysign } from '@vultisig/core-mpc/mldsa/mldsaKeysign'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'
import { chainPromises } from '@vultisig/lib-utils/promise/chainPromises'

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

export const KeysignActionProvider = ({ children }: ChildrenProp) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()
  const isInitiatingDevice = useIsInitiatingDevice()
  const peers = useMpcPeers()

  const keysignAction: KeysignAction = async ({
    msgs,
    signatureAlgorithm,
    coinType,
    chain,
  }) => {
    const keyShare = shouldBePresent(
      isKeyImportVault(vault)
        ? vault.chainKeyShares?.[chain]
        : match(signatureAlgorithm, {
            ecdsa: () => vault.keyShares.ecdsa,
            eddsa: () => vault.keyShares.eddsa,
            mldsa: () => vault.keyShareMldsa,
          }),
      'Keyshare'
    )

    const chainPath = isKeyImportVault(vault)
      ? eddsaPlaceholderChainPath
      : match(signatureAlgorithm, {
          ecdsa: () =>
            walletCore.CoinTypeExt.derivationPath(coinType).replaceAll("'", ''),
          eddsa: () => eddsaPlaceholderChainPath,
          mldsa: () => eddsaPlaceholderChainPath,
        })

    if (signatureAlgorithm === 'mldsa') {
      const mldsaKeysign = new MldsaKeysign({
        keysignCommittee: [vault.localPartyId, ...peers],
        serverURL: serverUrl,
        sessionId,
        localPartyId: vault.localPartyId,
        messagesToSign: msgs,
        keyShareBase64: keyShare,
        hexEncryptionKey: encryptionKeyHex,
        chainPath,
        isInitiatingDevice,
      })
      const results = await mldsaKeysign.startKeysignWithRetry()
      return results.map(({ msg, signature }) => ({
        msg: Buffer.from(msg, 'hex').toString('base64'),
        r: '',
        s: '',
        der_signature: signature,
      }))
    }

    return chainPromises(
      msgs.map(
        message => async () =>
          keysign({
            keyShare,
            signatureAlgorithm,
            message,
            chainPath,
            localPartyId: vault.localPartyId,
            peers,
            serverUrl,
            sessionId,
            hexEncryptionKey: encryptionKeyHex,
            isInitiatingDevice,
          })
      )
    )
  }

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
