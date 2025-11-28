import {
  getAvailablePositionsForChain,
  useDefiPositions,
} from '@core/ui/storage/defiPositions'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'
import { PositionsList } from './PositionsList'

export const StakedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositionIds = useDefiPositions(chain)

  const availablePositions = getAvailablePositionsForChain(chain)
  const stakePositions = availablePositions.filter(p => p.type === 'stake')

  const selectedStakePositions = stakePositions.filter(p =>
    selectedPositionIds.includes(p.id)
  )

  if (selectedStakePositions.length === 0) {
    return <DefiPositionEmptyState />
  }

  return <PositionsList positions={selectedStakePositions} />
}
