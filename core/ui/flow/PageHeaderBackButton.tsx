import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { OnClickProp } from '@lib/ui/props'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const { goBack } = useCore()

  return (
    <IconButton onClick={onClick ?? goBack}>
      <ChevronLeftIcon />
    </IconButton>
  )
}
