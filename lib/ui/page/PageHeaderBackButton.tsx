import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { OnClickProp } from '@lib/ui/props'

import { useNavigateBack } from '../navigation/hooks/useNavigateBack'
import { PageHeaderIconButton } from './PageHeaderIconButton'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const goBack = useNavigateBack()

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? goBack}
    />
  )
}
