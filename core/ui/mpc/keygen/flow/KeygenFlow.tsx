import { hasServer } from '@core/mpc/devices/localPartyId'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { CreateVaultSuccessScreen } from '@core/ui/mpc/keygen/create/CreateVaultSuccessScreen'
import { KeygenFlowEnding } from '@core/ui/mpc/keygen/flow/VaultKeygenEnding'
import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/progress/KeygenPendingState'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { GradientText, Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
        plugin: () => t('install_plugin'),
        regular: () => t('reshare'),
      }),
  })

  const isPluginReshare = useMemo(() => {
    return 'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'
  }, [keygenOperation])

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => {
        const renderEnding = () => {
          if (isPluginReshare) {
            return (
              <>
                <PageHeader title={title} hasBorder />
                <PageContent justifyContent="end">
                  <GradientText
                    as="span"
                    size={28}
                    weight={500}
                    centerHorizontally
                  >{`${t('success')}.`}</GradientText>
                  <Text as="span" size={28} weight={500} centerHorizontally>
                    {t('plugin_success_desc', { name: '' })}
                  </Text>
                </PageContent>
                <PageFooter>
                  <Button onClick={() => window.close()}>
                    {t('go_to_wallet')}
                  </Button>
                </PageFooter>
              </>
            )
          } else if (hasServer(vault.signers)) {
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
          <PageHeader title={title} hasBorder />
          <FlowErrorPageContent
            title={t('keygen_failed')}
            message={extractErrorMsg(error)}
          />
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={title} hasBorder />
          <KeygenPendingState value={step} />
        </>
      )}
    />
  )
}
