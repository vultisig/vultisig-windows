import { Chain } from '@vultisig/core-chain/Chain'

import { ProductBrand } from '../../product/brand'

const stationPriorityChains = [Chain.Terra, Chain.TerraClassic] as const

const getStationChainPriority = (chain: Chain) => {
  const index = stationPriorityChains.indexOf(
    chain as (typeof stationPriorityChains)[number]
  )

  return index === -1 ? stationPriorityChains.length : index
}

type OrderChainItemsForProductInput<T> = {
  items: readonly T[]
  getChain: (item: T) => Chain
  productBrand: ProductBrand
}

export const orderChainItemsForProduct = <T>({
  items,
  getChain,
  productBrand,
}: OrderChainItemsForProductInput<T>): T[] =>
  [...items].sort((a, b) => {
    const aChain = getChain(a)
    const bChain = getChain(b)

    if (productBrand === 'station') {
      const priorityDiff =
        getStationChainPriority(aChain) - getStationChainPriority(bChain)

      if (priorityDiff !== 0) return priorityDiff
    }

    return aChain.localeCompare(bChain)
  })
