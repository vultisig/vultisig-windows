import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { mldsaWithServer } from '@vultisig/core-mpc/fast/api/mldsaWithServer'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'

export const SingleKeygenFastServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = usePassword()
  const { publicKeys, signers } = useCurrentVault()
  const [email] = useEmail()

  const action = useCallback(async () => {
    if (!hasServer(signers)) return

    await mldsaWithServer({
      public_key: publicKeys.ecdsa,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      email,
    })
  }, [email, hexEncryptionKey, password, publicKeys.ecdsa, sessionId, signers])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
