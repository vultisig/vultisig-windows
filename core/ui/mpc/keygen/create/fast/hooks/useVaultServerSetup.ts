import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { setupVaultWithServer } from '@core/mpc/fast/api/setupVaultWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultCreationMpcLib } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { useEmail } from '@core/ui/state/email'
import { useVaultPassword } from '@core/ui/state/password'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

export const useVaultServerSetup = () => {
  const [name] = useVaultName()
  const [password] = useVaultPassword()
  const [email] = useEmail()
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const mpcLib = useVaultCreationMpcLib()

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
        lib_type: toLibType(mpcLib),
      }),
  })

  useEffect(mutate, [mutate])

  return state
}
