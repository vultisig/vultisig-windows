import { Chain, defaultChains } from '@vultisig/core-chain/Chain'

import { ProductBrand } from '../../product/brand'

const stationDefaultChains = [Chain.Terra, Chain.TerraClassic]

/**
 * Resolves default vault chains for the selected product brand.
 *
 * @param productBrand Product brand that controls the initial chain set.
 * @returns Default chains for vault creation.
 */
export const getDefaultVaultChains = (productBrand: ProductBrand): Chain[] => {
  const chains =
    productBrand === 'station' ? stationDefaultChains : defaultChains

  return [...chains]
}
