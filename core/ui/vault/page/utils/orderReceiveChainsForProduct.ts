import { orderChainItemsForProduct } from '@core/ui/chain/utils/orderChainItemsForProduct'
import { ProductBrand } from '@core/ui/product/brand'
import { Chain } from '@vultisig/core-chain/Chain'

type OrderReceiveChainsForProductInput = {
  chains: Chain[]
  productBrand: ProductBrand
}

export const orderReceiveChainsForProduct = ({
  chains,
  productBrand,
}: OrderReceiveChainsForProductInput): Chain[] => {
  if (productBrand !== 'station') return chains

  return orderChainItemsForProduct({
    items: chains,
    getChain: chain => chain,
    productBrand,
  })
}
