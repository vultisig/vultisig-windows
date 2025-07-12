import { executeKeysign } from '@core/mpc/keysign/execute'
import { ChildrenProp } from '@lib/ui/props'
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

export const KeysignActionProvider = ({ children }: ChildrenProp) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()
  const isInitiateDevice = useIsInitiatingDevice()
  const peers = useMpcPeers()

  const keysignAction: KeysignAction = useCallback(
    async ({ msgs, signatureAlgorithm, coinType }) => {
      const keyShare = vault.keyShares[signatureAlgorithm]

      return executeKeysign({
        keyShare,
        signatureAlgorithm,
        messages: msgs,
        chainPath: walletCore.CoinTypeExt.derivationPath(coinType),
        localPartyId: vault.localPartyId,
        peers,
        serverUrl,
        sessionId,
        hexEncryptionKey: encryptionKeyHex,
        isInitiateDevice,
      })
    },
    [
      encryptionKeyHex,
      isInitiateDevice,
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
