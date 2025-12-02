import {
  DefiPosition,
  getAvailablePositionsForChain,
  useDefiPositions,
} from '@core/ui/storage/defiPositions'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'
import { PositionsList } from './PositionsList'

type FilteredPositionsProps = {
  positionType: DefiPosition['type']
}

export const FilteredPositions = ({ positionType }: FilteredPositionsProps) => {
  const chain = useCurrentDefiChain()
  const selectedPositionIds = useDefiPositions(chain)

  const availablePositions = getAvailablePositionsForChain(chain)
  const filteredPositions = availablePositions.filter(
    position => position.type === positionType
  )

  const selectedPositions = filteredPositions.filter(position =>
    selectedPositionIds.includes(position.id)
  )

  if (selectedPositions.length === 0) {
    return <DefiPositionEmptyState />
  }

  return <PositionsList positions={selectedPositions} />
}
