import { PluginReshareFlow } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { usePluginQuery } from '@core/ui/plugins/queries/plugin'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PluginJoinKeygenUrl } from '../../../../pages/plugin/PluginJoinKeygenUrl'
import { PopupApiResolver } from '../../resolver'

export const PluginReshare: PopupApiResolver<'pluginReshare'> = ({
  onFinish,
  input: { pluginId },
}) => {
  const query = usePluginQuery(pluginId)
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      success={({ title }) => (
        <ReshareVaultFlowProviders>
          <KeygenOperationProvider value={{ reshare: 'plugin' }}>
            <ReshareVaultKeygenActionProvider>
              <StepTransition
                from={({ onFinish: onNextStep }) => (
                  <PluginJoinKeygenUrl
                    onFinish={joinUrl => {
                      onFinish({ data: { joinUrl } })
                      onNextStep()
                    }}
                  />
                )}
                to={() => <PluginReshareFlow name={title} />}
              />
            </ReshareVaultKeygenActionProvider>
          </KeygenOperationProvider>
        </ReshareVaultFlowProviders>
      )}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_load')}</StrictText>
        </Center>
      )}
    />
  )
}
