import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useVaultCreationMpcLib } from '../../../../mpc/state/vaultCreationMpcLib'
import { setupVaultWithServer } from '../../../fast/api/setupVaultWithServer'
import { useVaultPassword } from '@core/ui/state/password'

export const useVaultServerSetup = () => {
  const [name] = useVaultName()
  const [password] = useVaultPassword()
  const [email] = useEmail()
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [vaultCreationMpcLib] = useVaultCreationMpcLib()

  const { mutate, ...state } = useMutation({
    mutationFn: () =>
      setupVaultWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType(vaultCreationMpcLib),
      }),
  })

  useEffect(mutate, [mutate])

  return state
}
