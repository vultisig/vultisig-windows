import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import { PopupDeadEnd } from '@core/inpage-provider/popup/view/flow/PopupDeadEnd'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PluginJoinKeygenUrl } from '@core/inpage-provider/popup/view/resolvers/pluginReshare/PluginJoinKeygenUrl'
import { PluginReshareFlow } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { getPlugin } from '@core/ui/plugins/core/get'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

export const PluginReshare: PopupResolver<'pluginReshare'> = ({
  onFinish,
  input: { pluginId },
}) => {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      const { pluginMarketplaceBaseUrl } = await getDeveloperOptions()

      return getPlugin(pluginMarketplaceBaseUrl, pluginId)
    },
  })

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
                      onFinish({
                        result: { data: { joinUrl } },
                        shouldClosePopup: false,
                      })
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
