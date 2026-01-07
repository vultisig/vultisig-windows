import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { keyImportWithServer } from '@core/mpc/fast/api/keyImportWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { useCore } from '../../../../state/core'
import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeyImportInput } from '../state/keyImportInput'

export const KeyImportFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const [name] = useVaultName()
  const [password] = usePassword()
  const [email] = useEmail()
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { vaultCreationMpcLib } = useCore()
  const keygenOperation = useKeygenOperation()
  const { chains } = useKeyImportInput()

  const action = useCallback(async () => {
    await keyImportWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      lib_type: toLibType({
        libType: vaultCreationMpcLib,
        isKeyImport: 'keyimport' in keygenOperation,
      }),
      chains,
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    vaultCreationMpcLib,
    keygenOperation,
    name,
    password,
    sessionId,
    chains,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
