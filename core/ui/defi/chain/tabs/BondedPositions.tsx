import {
  getAvailablePositionsForChain,
  useDefiPositions,
} from '@core/ui/storage/defiPositions'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'
import { PositionsList } from './PositionsList'

export const BondedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositionIds = useDefiPositions(chain)

  const availablePositions = getAvailablePositionsForChain(chain)
  const bondPositions = availablePositions.filter(p => p.type === 'bond')

  const selectedBondPositions = bondPositions.filter(p =>
    selectedPositionIds.includes(p.id)
  )

  if (selectedBondPositions.length === 0) {
    return <DefiPositionEmptyState />
  }

  return <PositionsList positions={selectedBondPositions} />
}
