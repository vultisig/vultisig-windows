import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { OnClickProp } from '@lib/ui/props'

import useGoBack from '../../../hooks/go-back'
import { PageHeaderIconButton } from './PageHeaderIconButton'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const goBack = useGoBack()

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? (() => goBack())}
    />
  )
}
