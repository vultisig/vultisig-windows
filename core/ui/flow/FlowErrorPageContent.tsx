import { Button } from '@lib/ui/buttons/Button'
import {
  ErrorFallbackContent,
  ErrorFallbackContentProps,
} from '@lib/ui/flow/ErrorFallbackContent'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ActionProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export type FlowErrorPageContentProps = ErrorFallbackContentProps &
  Partial<ActionProp>

export const FlowErrorPageContent = ({
  action,
  ...props
}: FlowErrorPageContentProps) => {
  const navigateBack = useNavigateBack()
  const { t } = useTranslation()

  return (
    <>
      <PageContent>
        <ErrorFallbackContent {...props} />
      </PageContent>
      <PageFooter>
        {action ? action : <Button onClick={navigateBack}>{t('back')}</Button>}
      </PageFooter>
    </>
  )
}
