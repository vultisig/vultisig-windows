import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'

import { ImportSeedphraseIntro } from './intro/ImportSeedphraseIntro'

export const ImportSeedphrasePage = () => {
  const handleFinish = () => {
    console.log('finish')
  }

  return (
    <VStack fullHeight>
      <PageHeader primaryControls={<PageHeaderBackButton />} />
      <ImportSeedphraseIntro onFinish={handleFinish} />
    </VStack>
  )
}
