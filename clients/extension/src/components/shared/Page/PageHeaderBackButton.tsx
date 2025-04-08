import { PageHeaderIconButton } from '@clients/extension/src/components/shared/Page/PageHeaderIconButton'
import useGoBack from '@clients/extension/src/hooks/go-back'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { OnClickProp } from '@lib/ui/props'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const goBack = useGoBack()

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? (() => goBack())}
    />
  )
}
