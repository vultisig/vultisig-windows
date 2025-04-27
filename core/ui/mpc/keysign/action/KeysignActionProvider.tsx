import { MPCKeysign } from '@core/mpc/mpcKeysign'
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
      const mpc = new MPCKeysign(
        isInitiateDevice,
        serverUrl,
        sessionId,
        vault.localPartyId,
        [vault.localPartyId, ...peers],
        encryptionKeyHex
      )
      const keysignPublicKey = vault.publicKeys[signatureAlgorithm]
      const keyShare = vault.keyShares[signatureAlgorithm]

      return mpc.startKeysign(
        keyShare,
        signatureAlgorithm,
        msgs,
        keysignPublicKey,
        walletCore.CoinTypeExt.derivationPath(coinType)
      )
    },
    [
      encryptionKeyHex,
      isInitiateDevice,
      peers,
      serverUrl,
      sessionId,
      vault.keyShares,
      vault.localPartyId,
      vault.publicKeys,
      walletCore.CoinTypeExt,
    ]
  )

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
