import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { MessageProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

export const FlowPendingPageContent = ({
  title,
  message,
}: TitleProp & Partial<MessageProp>) => (
  <PageContent flexGrow alignItems="center" justifyContent="center" gap={24}>
    <Spinner size={24} />
    <VStack alignItems="center" gap={12}>
      <Text centerHorizontally color="contrast" size={22}>
        {title}
      </Text>
      {message && (
        <Text centerHorizontally color="supporting" size={14}>
          {message}
        </Text>
      )}
    </VStack>
  </PageContent>
)
