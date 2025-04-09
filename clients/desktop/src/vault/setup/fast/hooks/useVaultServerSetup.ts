import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useVaultCreationMpcLib } from '../../../../mpc/state/vaultCreationMpcLib'
import { setupVaultWithServer } from '../../../fast/api/setupVaultWithServer'
import { useVaultEmail } from '../../../server/email/state/email'
import { useVaultPassword } from '../../../server/password/state/password'
import { useCurrentHexChainCode } from '../../state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey'
import { useVaultName } from '../../state/vaultName'

export const useVaultServerSetup = () => {
  const [name] = useVaultName()
  const [password] = useVaultPassword()
  const [email] = useVaultEmail()
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
