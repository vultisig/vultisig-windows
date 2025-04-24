import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  KeysignAction,
  KeysignActionProvider as BaseKeysignActionProvider,
} from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { Keysign } from '../../../../wailsjs/go/tss/TssService'
import { toStorageVault } from '../../utils/storageVault'

export const LegacyKeysignActionProvider = ({ children }: ChildrenProp) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()

  const keysignAction: KeysignAction = useCallback(
    async ({ msgs, signatureAlgorithm, coinType }) => {
      return Keysign(
        toStorageVault(vault),
        msgs,
        vault.localPartyId,
        walletCore.CoinTypeExt.derivationPath(coinType),
        sessionId,
        encryptionKeyHex,
        serverUrl,
        signatureAlgorithm
      )
    },
    [encryptionKeyHex, serverUrl, sessionId, vault, walletCore.CoinTypeExt]
  )

  return (
    <BaseKeysignActionProvider value={keysignAction}>
      {children}
    </BaseKeysignActionProvider>
  )
}
