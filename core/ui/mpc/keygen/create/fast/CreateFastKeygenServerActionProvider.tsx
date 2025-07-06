import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { useCore } from '../../../../state/core'
import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'

export const CreateFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const [name] = useVaultName()
  const [password] = usePassword()
  const [email] = useEmail()
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { vaultCreationMpcLib } = useCore()

  const action = useCallback(async () => {
    await setupVaultWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      lib_type: toLibType(vaultCreationMpcLib),
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    vaultCreationMpcLib,
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
