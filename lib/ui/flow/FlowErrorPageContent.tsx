import { PageContent } from '@lib/ui/page/PageContent'
import { ActionProp, MessageProp, TitleProp } from '@lib/ui/props'

import { PageFooter } from '../page/PageFooter'
import { ErrorFallbackContent } from './ErrorFallbackContent'

export const FlowErrorPageContent = ({
  action,
  message,
  title,
}: Partial<ActionProp> & Partial<MessageProp> & TitleProp) => {
  return (
    <>
      <PageContent>
        <ErrorFallbackContent message={message} title={title} />
      </PageContent>
      <PageFooter>{action}</PageFooter>
    </>
  )
}
