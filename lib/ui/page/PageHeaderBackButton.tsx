import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnClickProp } from '@lib/ui/props'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const goBack = useNavigateBack()

  return (
    <IconButton onClick={onClick ?? goBack}>
      <ChevronLeftIcon />
    </IconButton>
  )
}
