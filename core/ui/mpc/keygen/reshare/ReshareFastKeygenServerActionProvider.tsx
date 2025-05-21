import { generateLocalPartyId, hasServer } from '@core/mpc/devices/localPartyId'
import { reshareWithServer } from '@core/mpc/fast/api/reshareWithServer'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { useVaultPassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const ReshareFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = useVaultPassword()

  const { name, hexChainCode, publicKeys, resharePrefix, signers } =
    useCurrentVault()

  const [email] = useEmail()

  const action = useCallback(async () => {
    await reshareWithServer({
      public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      email,
      name,
      old_parties: signers,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      old_reshare_prefix: resharePrefix ?? '',
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    name,
    password,
    publicKeys.ecdsa,
    resharePrefix,
    sessionId,
    signers,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
