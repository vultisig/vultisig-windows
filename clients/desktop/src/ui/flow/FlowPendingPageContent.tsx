import { TitleProp } from '@lib/ui/props'

import { VStack } from '../../lib/ui/layout/Stack'
import { Spinner } from '../../lib/ui/loaders/Spinner'
import { StrictText } from '../../lib/ui/text'
import { PageContent } from '../page/PageContent'

export const FlowPendingPageContent = ({ title }: TitleProp) => (
  <PageContent flexGrow alignItems="center" justifyContent="center">
    <VStack alignItems="center" gap={8}>
      <StrictText>{title}</StrictText>
      <Spinner />
    </VStack>
  </PageContent>
)
