import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import { useCore } from '../../../../state/core'
import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useVaultCreationInput } from '../state/vaultCreationInput'

export const CreateFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { vaultCreationMpcLib } = useCore()
  const keygenOperation = useKeygenOperation()

  const action = useCallback(async () => {
    await setupVaultWithServer({
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
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
