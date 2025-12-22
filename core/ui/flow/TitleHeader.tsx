import { PageHeader } from '@lib/ui/page/PageHeader'
import { ReactNode } from 'react'

import { PageHeaderBackButton } from './PageHeaderBackButton'

type TitleHeaderProps = {
  title: string
  onBack: () => void
  secondaryControls?: ReactNode
}

export const TitleHeader = ({
  title,
  onBack,
  secondaryControls,
}: TitleHeaderProps) => {
  return (
    <PageHeader
      hasBorder
      primaryControls={<PageHeaderBackButton onClick={onBack} />}
      title={title}
      secondaryControls={secondaryControls}
    />
  )
}
