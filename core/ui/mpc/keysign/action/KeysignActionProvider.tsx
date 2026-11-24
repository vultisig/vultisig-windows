import { ChildrenProp } from '@lib/ui/props'
import { keysign } from '@vultisig/core-mpc/keysign'
import { MldsaKeysign } from '@vultisig/core-mpc/mldsa/mldsaKeysign'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'
import { chainPromises } from '@vultisig/lib-utils/promise/chainPromises'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../vault/state/currentVault'
import { loadMpcEngine } from '../../bootstrapMpcEngine'
import { getStationKeyImportRootChains } from '../../keygen/keyimport/utils/keyImportServerChains'
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

/**
 * Provides the DKLS keysign action: MLDSA signs every message in one round,
 * ECDSA and EdDSA sign them one after another and report progress after each.
 */
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
    onProgress,
  }) => {
    const total = msgs.length
    // MLDSA signs every message in one round, so only the one-by-one path
    // below reports progress. Reporting the count before the engine loads
    // lets the signing screen switch to it as early as possible.
    if (signatureAlgorithm !== 'mldsa') {
      onProgress?.({ done: 0, total })
    }

    await loadMpcEngine()

    const stationRootChains = getStationKeyImportRootChains(vault)
    const isStationRootChain =
      isKeyImportVault(vault) &&
      signatureAlgorithm === 'ecdsa' &&
      stationRootChains?.includes(chain)

    const keyShare = shouldBePresent(
      isStationRootChain
        ? vault.keyShares.ecdsa
        : isKeyImportVault(vault)
          ? vault.chainKeyShares?.[chain]
          : match(signatureAlgorithm, {
              ecdsa: () => vault.keyShares.ecdsa,
              eddsa: () => vault.keyShares.eddsa,
              mldsa: () => vault.keyShareMldsa,
            }),
      'Keyshare'
    )

    const chainPath =
      isKeyImportVault(vault) || isStationRootChain
        ? eddsaPlaceholderChainPath
        : match(signatureAlgorithm, {
            ecdsa: () =>
              walletCore.CoinTypeExt.derivationPath(coinType).replaceAll(
                "'",
                ''
              ),
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
      msgs.map((message, index) => async () => {
        const signature = await keysign({
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
        onProgress?.({ done: index + 1, total })

        return signature
      })
    )
  }

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
