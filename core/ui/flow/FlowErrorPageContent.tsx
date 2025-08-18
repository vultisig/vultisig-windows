import { Button } from '@lib/ui/buttons/Button'
import {
  ErrorFallbackContent,
  ErrorFallbackContentProps,
} from '@lib/ui/flow/ErrorFallbackContent'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ActionProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCore } from '../state/core'

export type FlowErrorPageContentProps = ErrorFallbackContentProps &
  Partial<ActionProp>

export const FlowErrorPageContent = ({
  action,
  ...props
}: FlowErrorPageContentProps) => {
  const { goBack } = useCore()
  const { t } = useTranslation()

  return (
    <>
      <PageContent>
        <ErrorFallbackContent {...props} />
      </PageContent>
      <PageFooter>
        {action ? action : <Button onClick={goBack}>{t('back')}</Button>}
      </PageFooter>
    </>
  )
}
