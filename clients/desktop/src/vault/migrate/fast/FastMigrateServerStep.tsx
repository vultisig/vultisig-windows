import { migrateWithServer } from '@core/mpc/fast/api/migrateWithServer'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { useVaultPassword } from '@core/ui/state/password'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const FastMigrateServerStep: React.FC<
  OnFinishProp & Partial<OnBackProp>
> = ({ onFinish, onBack }) => {
  const { t } = useTranslation()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [password] = useVaultPassword()
  const keygenVault = useKeygenVault()
  const { publicKeys } = getRecordUnionValue(keygenVault, 'existingVault')
  const [email] = useEmail()

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      return migrateWithServer({
        public_key: publicKeys.ecdsa,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
      })
    },
    onSuccess: onFinish,
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
