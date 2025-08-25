import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'

export const SignMessage: PopupResolver<'signMessage'> = () => {
  return (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={<PageHeaderBackButton />}
        title={'TODO'}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        TODO
      </PageContent>
      <PageFooter>TODO</PageFooter>
    </VStack>
  )
}
