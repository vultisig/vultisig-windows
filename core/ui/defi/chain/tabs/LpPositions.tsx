import {
  getAvailablePositionsForChain,
  useDefiPositions,
} from '@core/ui/storage/defiPositions'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'
import { PositionsList } from './PositionsList'

export const LpPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositionIds = useDefiPositions(chain)

  const availablePositions = getAvailablePositionsForChain(chain)
  const lpPositions = availablePositions.filter(p => p.type === 'lp')

  const selectedLpPositions = lpPositions.filter(p =>
    selectedPositionIds.includes(p.id)
  )

  if (selectedLpPositions.length === 0) {
    return <DefiPositionEmptyState />
  }

  return <PositionsList positions={selectedLpPositions} />
}
