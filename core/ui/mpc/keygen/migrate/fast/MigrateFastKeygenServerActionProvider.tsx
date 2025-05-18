import { migrateWithServer } from '@core/mpc/fast/api/migrateWithServer'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { useVaultPassword } from '@core/ui/state/password'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeygenVault } from '../../state/keygenVault'

export const MigrateFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = useVaultPassword()
  const [email] = useEmail()

  const keygenVault = useKeygenVault()

  const { publicKeys } = getRecordUnionValue(keygenVault, 'existingVault')

  const action = useCallback(async () => {
    await migrateWithServer({
      public_key: publicKeys.ecdsa,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      email,
    })
  }, [email, hexEncryptionKey, password, publicKeys.ecdsa, sessionId])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
