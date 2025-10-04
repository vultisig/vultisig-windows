import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import { PopupDeadEnd } from '@core/inpage-provider/popup/view/flow/PopupDeadEnd'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PluginInfo } from '@core/inpage-provider/popup/view/resolvers/pluginReshare/PluginInfo'
import { StorageKey } from '@core/ui/storage/StorageKey'
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
  const developerOptionsQuery = useQuery({
    queryKey: [StorageKey.developerOptions],
    queryFn: getDeveloperOptions,
  })

  return (
    <MatchQuery
      value={developerOptionsQuery}
      success={({ pluginMarketplaceBaseUrl }) => (
        <PluginInfo
          onFinish={onFinish}
          input={{ pluginId, pluginMarketplaceBaseUrl }}
        />
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
