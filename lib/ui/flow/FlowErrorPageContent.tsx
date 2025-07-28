import { PageContent } from '@lib/ui/page/PageContent'
import { ActionProp } from '@lib/ui/props'

import { PageFooter } from '../page/PageFooter'
import {
  ErrorFallbackContent,
  ErrorFallbackContentProps,
} from './ErrorFallbackContent'

export type FlowErrorPageContentProps = ErrorFallbackContentProps &
  Partial<ActionProp>

export const FlowErrorPageContent = ({
  action,
  ...props
}: FlowErrorPageContentProps) => {
  return (
    <>
      <PageContent>
        <ErrorFallbackContent {...props} />
      </PageContent>
      <PageFooter>{action}</PageFooter>
    </>
  )
}
