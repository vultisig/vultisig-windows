import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/progress/KeygenPendingState'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, TitleProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
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

  const navigate = useAppNavigate()

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
                  <SetupVaultSuccessScreen onFinish={onFinish} />
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
