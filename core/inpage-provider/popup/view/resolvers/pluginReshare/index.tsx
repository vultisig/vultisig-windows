import { PopupDeadEnd } from '@core/inpage-provider/popup/view/flow/PopupDeadEnd'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PluginInfo } from './PluginInfo'
import { useDeveloperOptionsQuery } from './queries/developerOptionsQuery'

export const PluginReshare: PopupResolver<'pluginReshare'> = ({
  onFinish,
  input: { pluginId },
}) => {
  const { t } = useTranslation()
  const developerOptionsQuery = useDeveloperOptionsQuery()

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
