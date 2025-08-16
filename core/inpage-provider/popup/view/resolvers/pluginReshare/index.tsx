import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
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

import { PopupDeadEnd } from '../../flow/PopupDeadEnd'
import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'

export const PluginReshare: PopupResolver<'pluginReshare'> = ({
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
        <PopupDeadEnd>
          <Spinner />
        </PopupDeadEnd>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_load')}</StrictText>
        </Center>
      )}
    />
  )
}
