import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcSessionId } from '../../../mpc/session/state/mpcSession'
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { migrateWithServer } from '../../fast/api/migrateWithServer'
import { WaitForServerLoader } from '../../server/components/WaitForServerLoader'
import { useVaultEmail } from '../../server/email/state/email'
import { useVaultPassword } from '../../server/password/state/password'
import { useCurrentHexEncryptionKey } from '../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../state/currentVault'

export const FastMigrateServerStep: React.FC<
  OnForwardProp & Partial<OnBackProp>
> = ({ onForward, onBack }) => {
  const { t } = useTranslation()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = useVaultPassword()
  const { public_key_ecdsa } = useCurrentVault()
  const [email] = useVaultEmail()

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      return migrateWithServer({
        public_key: public_key_ecdsa,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
      })
    },
    onSuccess: onForward,
  })

  useEffect(mutate, [mutate])

  const title = t('upgrade')

  const header = <FlowPageHeader title={title} onBack={onBack} />

  return (
    <>
      <MatchQuery
        value={state}
        pending={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        success={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        error={error => <FullPageFlowErrorState message={error.message} />}
      />
    </>
  )
}
