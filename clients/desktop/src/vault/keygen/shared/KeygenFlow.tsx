import { hasServer } from '@core/mpc/devices/localPartyId'
import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { match } from '@lib/utils/match'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FailedSetupVaultKeygenStep } from '../../setup/shared/FailedSetupVaultKeygenStep'
import { SetupVaultEducationSlides } from '../../setup/shared/SetupVaultCreationStep/SetupVaultEducationSlides'
import { SetupVaultSuccessScreen } from '../../setup/shared/SetupVaultSuccessScreen'
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
    create: () => t('creating_vault'),
    reshare: () => t('reshare'),
    migrate: () => t('upgrade'),
  })

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => (
        <CurrentVaultProvider value={vault}>
          <StepTransition
            from={({ onFinish }) => (
              <SetupVaultSuccessScreen onFinish={onFinish} />
            )}
            to={() => {
              if (hasServer(vault.signers)) {
                return <VaultKeygenEnding onBack={onBack} />
              }

              return (
                <StepTransition
                  from={({ onFinish }) => (
                    <SaveVaultStep
                      title={title}
                      value={vault}
                      onFinish={onFinish}
                      onBack={onBack}
                    />
                  )}
                  to={() => <VaultKeygenEnding onBack={onBack} />}
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
