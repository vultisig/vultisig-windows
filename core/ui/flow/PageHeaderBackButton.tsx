import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { StationChevronLeftIcon } from '@lib/ui/icons/StationFigmaIcons'
import { OnClickProp } from '@lib/ui/props'
import { useTheme } from 'styled-components'

export const PageHeaderBackButton = ({ onClick }: Partial<OnClickProp>) => {
  const { goBack } = useCore()
  const { iconStyle } = useTheme()

  return (
    <IconButton onClick={onClick ?? goBack}>
      {iconStyle === 'station' ? (
        <StationChevronLeftIcon />
      ) : (
        <ChevronLeftIcon />
      )}
    </IconButton>
  )
}
