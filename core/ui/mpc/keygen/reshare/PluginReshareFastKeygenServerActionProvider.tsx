import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import {
  generateLocalPartyId,
  hasServer,
} from '@vultisig/core-mpc/devices/localPartyId'
import { reshareWithServer } from '@vultisig/core-mpc/fast/api/reshareWithServer'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const PluginReshareFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = usePassword()

  const vault = useCurrentVault()
  const { name, hexChainCode, publicKeys, resharePrefix, signers, libType } =
    vault

  const action = useCallback(async () => {
    await reshareWithServer({
      public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      name,
      old_parties: signers,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      old_reshare_prefix: resharePrefix ?? '',
      lib_type: toLibType(
        isKeyImportVault(vault) ? 'KeyImport' : libType
      ),
      reshare_type: 1,
    })
  }, [
    hexChainCode,
    hexEncryptionKey,
    libType,
    name,
    password,
    publicKeys.ecdsa,
    resharePrefix,
    sessionId,
    signers,
    vault,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
