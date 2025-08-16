import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, TitleProp } from '@lib/ui/props'

export const FlowPageHeader: React.FC<TitleProp & Partial<OnBackProp>> = ({
  title,
  onBack,
}) => (
  <PageHeader
    title={title}
    primaryControls={<PageHeaderBackButton onClick={onBack} />}
    hasBorder
  />
)
