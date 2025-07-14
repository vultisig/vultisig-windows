import { keysign } from '@core/mpc/keysign'
import { ChildrenProp } from '@lib/ui/props'
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

export const KeysignActionProvider = ({ children }: ChildrenProp) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()
  const isInitiatingDevice = useIsInitiatingDevice()
  const peers = useMpcPeers()

  const keysignAction: KeysignAction = useCallback(
    async ({ msgs, signatureAlgorithm, coinType }) => {
      const keyShare = vault.keyShares[signatureAlgorithm]

      return chainPromises(
        msgs.map(
          message => async () =>
            keysign({
              keyShare,
              signatureAlgorithm,
              message,
              chainPath: match(signatureAlgorithm, {
                ecdsa: () =>
                  walletCore.CoinTypeExt.derivationPath(coinType).replaceAll(
                    "'",
                    ''
                  ),
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
      vault.keyShares,
      vault.localPartyId,
      walletCore.CoinTypeExt,
    ]
  )

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
