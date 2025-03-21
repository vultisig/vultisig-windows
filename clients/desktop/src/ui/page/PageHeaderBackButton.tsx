import { OnClickProp } from '@lib/ui/props'

import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon'
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack'
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
