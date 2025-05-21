import { PageContent } from '@lib/ui/page/PageContent'
import { ActionProp, MessageProp, TitleProp } from '@lib/ui/props'

import { ErrorFallbackContent } from './ErrorFallbackContent'

export const FlowErrorPageContent = ({
  action,
  message,
  title,
}: Partial<ActionProp> & Partial<MessageProp> & TitleProp) => {
  return (
    <PageContent flexGrow>
      <ErrorFallbackContent message={message} title={title} />
      {action}
    </PageContent>
  )
}
