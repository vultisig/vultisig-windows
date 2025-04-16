import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/progress/KeygenPendingState'
import { KeygenSuccessScreen } from '@core/ui/mpc/keygen/progress/KeygenSuccessScreen'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BackupSecureVault } from '@core/ui/vault/backup/secure/BackupSecureVault'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, TitleProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'

import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeygenFailedState } from '../shared/KeygenFailedState'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { KeygenSuccessStep } from '../shared/KeygenSuccessStep'

export const JoinKeygenProcess = ({
  title,
  onBack,
}: TitleProp & OnBackProp) => {
  const { mutate: joinKeygen, step, ...joinKeygenState } = useKeygenMutation()
  const { keygenType } = useAppPathState<'joinKeygen'>()

  useEffect(joinKeygen, [joinKeygen])

  const navigate = useCoreNavigate()

  return (
    <MatchQuery
      value={joinKeygenState}
      success={vault => (
        <CurrentVaultProvider value={vault}>
          <Match
            value={keygenType}
            create={() => (
              <StepTransition
                from={({ onFinish }) => (
                  <KeygenSuccessScreen onFinish={onFinish} />
                )}
                to={() => (
                  <BackupSecureVault onFinish={() => navigate('vault')} />
                )}
              />
            )}
            reshare={() => (
              <KeygenSuccessStep value={vault} title={title} onBack={onBack} />
            )}
            migrate={() => (
              <KeygenSuccessStep value={vault} title={title} onBack={onBack} />
            )}
          />
        </CurrentVaultProvider>
      )}
      error={error => (
        <>
          <KeygenPageHeader title={title} />
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => {
              navigate('vault')
            }}
          />
        </>
      )}
      pending={() => (
        <>
          <KeygenPageHeader title={title} />
          <KeygenPendingState value={step} />
        </>
      )}
    />
  )
}
