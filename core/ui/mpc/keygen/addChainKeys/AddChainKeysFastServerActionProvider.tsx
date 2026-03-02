import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const AddChainKeysFastServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = usePassword()
  const [email] = useEmail()
  const { name, hexChainCode, libType } = useCurrentVault()

  const action = useCallback(async () => {
    await setupVaultWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      lib_type: toLibType({ libType }),
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    libType,
    name,
    password,
    sessionId,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
