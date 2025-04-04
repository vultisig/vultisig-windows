import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { TitleProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { SetupVaultEducationSlides } from '../../setup/shared/SetupVaultCreationStep/SetupVaultEducationSlides'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
import { CurrentVaultProvider } from '../../state/currentVault'
import { KeygenFailedState } from '../shared/KeygenFailedState'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { KeygenPendingState } from '../shared/KeygenPendingState'
import { KeygenSuccessStep } from '../shared/KeygenSuccessStep'
import { useKeygenMutation } from '../shared/mutations/useKeygenMutation'

export const JoinKeygenProcess = ({ title }: TitleProp) => {
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
            Keygen={() => (
              <StepTransition
                from={({ onForward }) => (
                  <SetupVaultSuccessScreen onForward={onForward} />
                )}
                to={() => (
                  <BackupSecureVault onFinish={() => navigate('vault')} />
                )}
              />
            )}
            Reshare={() => <KeygenSuccessStep value={vault} title={title} />}
            Migrate={() => <KeygenSuccessStep value={vault} title={title} />}
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
        <Match
          value={keygenType}
          Keygen={() => <SetupVaultEducationSlides value={step} />}
          Migrate={() => <SetupVaultEducationSlides value={step} />}
          Reshare={() => (
            <>
              <KeygenPageHeader title={title} />
              <KeygenPendingState value={step} />
            </>
          )}
        />
      )}
    />
  )
}
