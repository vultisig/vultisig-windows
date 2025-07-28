import { useProcessDeeplinkMutation } from '@core/ui/deeplink/mutations/useProcessDeeplinkMutation'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const DeeplinkPage = () => {
  const { t } = useTranslation()
  const [{ url }] = useCoreViewState<'deeplink'>()
  const { mutate, ...mutationState } = useProcessDeeplinkMutation()
  const navigateBack = useNavigateBack()

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
            action={<Button onClick={navigateBack}>{t('back')}</Button>}
            title={t('failed_to_process_url')}
            error={error}
          />
        )}
      />
    </>
  )
}
