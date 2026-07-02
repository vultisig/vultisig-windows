import { Chain } from '@vultisig/core-chain/Chain'

import { ProductBrand } from '../../product/brand'

const stationPriorityChains: readonly Chain[] = [
  Chain.Terra,
  Chain.TerraClassic,
]

const getStationChainPriority = (chain: Chain) => {
  const index = stationPriorityChains.indexOf(chain)

  return index === -1 ? stationPriorityChains.length : index
}

type OrderChainItemsForProductInput<T> = {
  items: readonly T[]
  getChain: (item: T) => Chain
  productBrand: ProductBrand
}

/**
 * Sorts chain-backed items for a product brand.
 *
 * @template T Item type to sort.
 * @param items Items that should be returned in sorted order.
 * @param getChain Resolves the chain represented by each item.
 * @param productBrand Product brand that controls brand-specific ordering.
 * @returns A sorted array of the provided items.
 */
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
