import { hasServer } from '@core/mpc/devices/localPartyId'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { CreateVaultSuccessScreen } from '@core/ui/mpc/keygen/create/CreateVaultSuccessScreen'
import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/progress/KeygenPendingState'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { KeygenFlowEnding } from './KeygenFlowEnding'

type KeygenFlowProps = OnBackProp &
  Partial<OnFinishProp> & {
    password?: string
    onChangeEmailAndRestart?: () => void
  }

export const KeygenFlow = ({
  onBack,
  onFinish,
  password,
  onChangeEmailAndRestart,
}: KeygenFlowProps) => {
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
        plugin: () => t('install_plugin'),
        regular: () => t('reshare'),
      }),
    keyimport: () => t('import_key'),
  })

  const isPluginReshare = useMemo(() => {
    return 'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'
  }, [keygenOperation])

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => {
        const renderEnding = () => {
          if (isPluginReshare && onFinish) {
            onFinish()
            return null
          }
          if (hasServer(vault.signers)) {
            return (
              <KeygenFlowEnding
                onBack={onBack}
                password={password}
                onChangeEmailAndRestart={onChangeEmailAndRestart}
              />
            )
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
              to={() => (
                <KeygenFlowEnding
                  onBack={onBack}
                  password={password}
                  onChangeEmailAndRestart={onChangeEmailAndRestart}
                />
              )}
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
                keyimport: renderEnding, // TODO: Handle key import specific ending if needed
              }}
            />
          </CurrentVaultProvider>
        )
      }}
      error={error => (
        <>
          <PageHeader
            title={title}
            hasBorder
            primaryControls={<PageHeaderBackButton />}
          />
          <FlowErrorPageContent title={t('keygen_failed')} error={error} />
        </>
      )}
      pending={() => (
        <>
          {!isPluginReshare ? (
            <>
              <PageHeader
                title={title}
                hasBorder
                primaryControls={<PageHeaderBackButton />}
              />
              <KeygenPendingState value={step} />
            </>
          ) : null}
        </>
      )}
    />
  )
}
