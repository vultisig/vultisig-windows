import { useProcessDeeplinkMutation } from '@core/ui/deeplink/mutations/useProcessDeeplinkMutation'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const DeeplinkPage = () => {
  const { t } = useTranslation()
  const [{ url }] = useCoreViewState<'deeplink'>()
  const { mutate, ...mutationState } = useProcessDeeplinkMutation()

  useEffect(() => mutate(url), [url, mutate])

  return (
    <>
      <FlowPageHeader title={t('deeplink')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('processing_url')} />}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_process_url')}
            error={error}
          />
        )}
      />
    </>
  )
}
