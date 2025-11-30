import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ParsedDeeplink } from '../core'
import { useParseDeeplinkQuery } from '../queries/useParseDeeplinkQuery'

export const ParseDeeplinkStep = ({
  onFinish,
}: OnFinishProp<ParsedDeeplink>) => {
  const { t } = useTranslation()
  const [{ url }] = useCoreViewState<'deeplink'>()

  const query = useParseDeeplinkQuery(url)

  useEffect(() => {
    if (query.data) {
      onFinish(query.data)
    }
  }, [query.data, onFinish])

  return (
    <>
      <FlowPageHeader title={t('deeplink')} />
      <MatchQuery
        value={query}
        pending={() => <FlowPendingPageContent title={t('processing_url')} />}
        error={error => (
          <FlowErrorPageContent
            error={error}
            title={t('failed_to_process_url')}
          />
        )}
      />
    </>
  )
}
