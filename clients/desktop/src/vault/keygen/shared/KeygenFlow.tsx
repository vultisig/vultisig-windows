import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { match } from '@lib/utils/match'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { hasServerSigner } from '../../fast/utils/hasServerSigner'
import { FailedSetupVaultKeygenStep } from '../../setup/shared/FailedSetupVaultKeygenStep'
import { SetupVaultEducationSlides } from '../../setup/shared/SetupVaultCreationStep/SetupVaultEducationSlides'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
import { CurrentVaultProvider } from '../../state/currentVault'
import { useCurrentKeygenType } from '../state/currentKeygenType'
import { useKeygenMutation } from './mutations/useKeygenMutation'
import { SaveVaultStep } from './SaveVaultStep'
import { VaultKeygenEnding } from './VaultKeygenEnding'

export const KeygenFlow = ({ onBack }: OnBackProp) => {
  const {
    step,
    mutate: startKeygen,
    ...keygenMutationState
  } = useKeygenMutation()
  useEffect(startKeygen, [startKeygen])

  const { t } = useTranslation()

  const keygenType = useCurrentKeygenType()

  const title = match(keygenType, {
    Keygen: () => t('creating_vault'),
    Reshare: () => t('reshare'),
    Migrate: () => t('upgrade'),
  })

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => (
        <CurrentVaultProvider value={vault}>
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSuccessScreen onForward={onForward} />
            )}
            to={() => {
              if (hasServerSigner(vault.signers)) {
                return <VaultKeygenEnding />
              }

              return (
                <StepTransition
                  from={({ onForward }) => (
                    <SaveVaultStep
                      title={title}
                      value={vault}
                      onForward={onForward}
                    />
                  )}
                  to={() => <VaultKeygenEnding />}
                />
              )
            }}
          />
        </CurrentVaultProvider>
      )}
      error={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <FailedSetupVaultKeygenStep onBack={onBack} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <SetupVaultEducationSlides value={step} />
        </>
      )}
    />
  )
}
