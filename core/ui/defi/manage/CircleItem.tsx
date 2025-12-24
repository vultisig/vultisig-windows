import {
  useIsCircleVisible,
  useToggleCircleVisibility,
} from '@core/ui/storage/circleVisibility'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'

import { circleName } from '../protocols/circle/core/config'
import { DefiItem } from './DefiItem'

export const CircleItem = () => {
  const isSelected = useIsCircleVisible()
  const { toggle, isPending } = useToggleCircleVisibility()

  return (
    <DefiItem
      icon={<CircleIcon />}
      name={circleName}
      isSelected={isSelected}
      isPending={isPending}
      onClick={toggle}
    />
  )
}
