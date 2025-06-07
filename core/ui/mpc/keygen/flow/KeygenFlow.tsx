import { hasServer } from '@core/mpc/devices/localPartyId'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { KeygenFlowEnding } from '@core/ui/mpc/keygen/flow/VaultKeygenEnding'
import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/progress/KeygenPendingState'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { CreateVaultSuccessScreen } from '../create/CreateVaultSuccessScreen'

export const KeygenFlow = ({ onBack }: OnBackProp) => {
  const {
    step,
    mutate: startKeygen,
    ...keygenMutationState
  } = useKeygenMutation()
  useEffect(startKeygen, [startKeygen])

  const { t } = useTranslation()

  const keygenOperation = useKeygenOperation()

  const title = matchRecordUnion<KeygenOperation, string>(keygenOperation, {
    create: () => t('creating_vault'),
    reshare: value =>
      match(value, {
        migrate: () => t('upgrade'),
        plugin: () => t('reshare'),
        regular: () => t('reshare'),
      }),
  })

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => {
        const renderEnding = () => {
          if (hasServer(vault.signers)) {
            return <KeygenFlowEnding onBack={onBack} />
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
              to={() => <KeygenFlowEnding onBack={onBack} />}
            />
          )
        }

        return (
          <CurrentVaultProvider value={vault}>
            <MatchRecordUnion
              value={keygenOperation}
              handlers={{
                create: () => (
                  <StepTransition
                    from={({ onFinish }) => (
                      <CreateVaultSuccessScreen onFinish={onFinish} />
                    )}
                    to={renderEnding}
                  />
                ),
                reshare: renderEnding,
              }}
            />
          </CurrentVaultProvider>
        )
      }}
      error={error => (
        <>
          <FlowPageHeader title={title} />
          <FlowErrorPageContent
            title={t('keygen_failed')}
            message={extractErrorMsg(error)}
          />
        </>
      )}
      pending={() => (
        <>
          <FlowPageHeader title={title} />
          <KeygenPendingState value={step} />
        </>
      )}
    />
  )
}
