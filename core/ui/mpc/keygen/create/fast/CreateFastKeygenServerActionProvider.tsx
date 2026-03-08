import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import { featureFlags } from '../../../../featureFlags'
import { useIsMLDSAEnabled } from '../../../../storage/mldsaEnabled'
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
  const isMLDSAEnabled = useIsMLDSAEnabled()

  const action = useCallback(async () => {
    const protocols = ['ecdsa', 'eddsa', 'frozt', 'fromt']
    if (featureFlags.mldsaKeygen && isMLDSAEnabled) {
      protocols.push('mldsa')
    }

    await setupVaultWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      protocols,
    })
  }, [
    email,
    hexChainCode,
    hexEncryptionKey,
    isMLDSAEnabled,
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
