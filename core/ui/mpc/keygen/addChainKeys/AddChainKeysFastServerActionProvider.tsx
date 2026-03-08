import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'
import { useKeygenOperation } from '../state/currentKeygenOperationType'

export const AddChainKeysFastServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = usePassword()
  const [email] = useEmail()
  const { name, hexChainCode } = useCurrentVault()
  const operation = useKeygenOperation()

  const protocol =
    'addChainKeys' in operation ? operation.addChainKeys : 'frozt'

  const action = useCallback(async () => {
    await setupVaultWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      protocols: [protocol],
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    name,
    password,
    protocol,
    sessionId,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
