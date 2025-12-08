import { DefiPosition } from '../../storage/defiPositions'

export const filterPositionsBySearch = (
  positions: DefiPosition[],
  search: string
) => {
  if (!search) return positions

  const normalizedSearch = search.toLowerCase()
  return positions.filter(
    position =>
      position.name.toLowerCase().includes(normalizedSearch) ||
      position.ticker.toLowerCase().includes(normalizedSearch)
  )
}
