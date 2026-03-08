import { generateLocalPartyId, hasServer } from '@core/mpc/devices/localPartyId'
import { batchReshareWithServer } from '@core/mpc/fast/api/batchReshareWithServer'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const ReshareFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = usePassword()

  const { publicKeys, signers } = useCurrentVault()

  const [email] = useEmail()

  const action = async () => {
    await batchReshareWithServer({
      public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      email,
      old_parties: signers,
      local_party_id: generateLocalPartyId('server'),
      protocols: ['ecdsa', 'eddsa', 'frozt', 'fromt'],
    })
  }

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
