import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, TitleProp } from '@lib/ui/props'

import { PageHeaderBackButton } from '../page/PageHeaderBackButton'
import { PageHeaderTitle } from '../page/PageHeaderTitle'

export const FlowPageHeader: React.FC<TitleProp & Partial<OnBackProp>> = ({
  title,
  onBack,
}) => (
  <PageHeader
    title={<PageHeaderTitle>{title}</PageHeaderTitle>}
    primaryControls={<PageHeaderBackButton onClick={onBack} />}
  />
)
