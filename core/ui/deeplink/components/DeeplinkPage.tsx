import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useProcessDeeplinkMutation } from '../mutations/useProcessDeeplinkMutation'

export const DeeplinkPage = () => {
  const { t } = useTranslation()

  const [{ url }] = useCoreViewState<'deeplink'>()

  const { mutate, ...mutationState } = useProcessDeeplinkMutation()

  useEffect(() => mutate(url), [url, mutate])

  const goBack = useNavigateBack()

  return (
    <>
      <FlowPageHeader title={t('deeplink')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('processing_url')} />}
        error={error => (
          <FlowErrorPageContent
            action={<Button onClick={goBack}>{t('back')}</Button>}
            title={t('failed_to_process_url')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  )
}
