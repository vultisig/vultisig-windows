import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect } from 'react'

import { StepTransition } from '../../../lib/ui/base/StepTransition'
import { TitleProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { SetupVaultEducationSlides } from '../../setup/shared/SetupVaultCreationStep/SetupVaultEducationSlides'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
import { KeygenFailedState } from '../shared/KeygenFailedState'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { KeygenPendingState } from '../shared/KeygenPendingState'
import { KeygenSuccessStep } from '../shared/KeygenSuccessStep'
import { useKeygenMutation } from '../shared/mutations/useKeygenMutation'

export const JoinKeygenProcess = ({ title }: TitleProp) => {
  const { mutate: joinKeygen, ...joinKeygenState } = useKeygenMutation()
  const { keygenType } = useAppPathState<'joinKeygen'>()
  const isKeygen = keygenType.toLowerCase() === 'keygen'

  useEffect(joinKeygen, [joinKeygen])

  const navigate = useAppNavigate()

  return (
    <MatchQuery
      value={joinKeygenState}
      success={vault =>
        isKeygen ? (
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSuccessScreen onForward={onForward} />
            )}
            to={() => (
              <BackupSecureVault
                isInitiatingDevice={false}
                vault={shouldBePresent(vault)}
              />
            )}
          />
        ) : (
          <KeygenSuccessStep value={vault} title={title} />
        )
      }
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
      pending={() =>
        isKeygen ? (
          <SetupVaultEducationSlides />
        ) : (
          <>
            <KeygenPageHeader title={title} />
            <KeygenPendingState />
          </>
        )
      }
    />
  )
}
