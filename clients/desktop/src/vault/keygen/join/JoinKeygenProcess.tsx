import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, TitleProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { SetupVaultEducationSlides } from '../../setup/shared/SetupVaultCreationStep/SetupVaultEducationSlides'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
import { KeygenFailedState } from '../shared/KeygenFailedState'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { KeygenPendingState } from '../shared/KeygenPendingState'
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
        <Match
          value={keygenType}
          create={() => <SetupVaultEducationSlides value={step} />}
          migrate={() => <SetupVaultEducationSlides value={step} />}
          reshare={() => (
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
