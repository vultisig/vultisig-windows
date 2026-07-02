import { Chain, defaultChains } from '@vultisig/core-chain/Chain'

import { ProductBrand } from '../../product/brand'

const stationDefaultChains = [...defaultChains, Chain.Terra, Chain.TerraClassic]

export const getDefaultVaultChains = (productBrand: ProductBrand): Chain[] => {
  const chains =
    productBrand === 'station' ? stationDefaultChains : defaultChains

  return [...new Set(chains)]
}
