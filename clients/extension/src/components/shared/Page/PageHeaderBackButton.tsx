import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { OnClickProp } from '@lib/ui/props'
import { useNavigate } from 'react-router-dom'

import { PageHeaderIconButton } from './PageHeaderIconButton'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const navigate = useNavigate()

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? (() => navigate(-1))}
    />
  )
}
