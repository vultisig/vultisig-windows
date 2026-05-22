/* eslint-disable @typescript-eslint/naming-convention */

type ProductBrand = 'vultisig' | 'station'

declare const __VULTISIG_PRODUCT_BRAND__: string | undefined

type ProductBrandConfig = {
  brand: ProductBrand
  name: string
  extensionName: string
  websiteUrl: string
}

const defaultProductBrand: ProductBrand = 'vultisig'

const resolveProductBrand = (value?: string): ProductBrand => {
  if (!value || value === defaultProductBrand) {
    return defaultProductBrand
  }

  if (value === 'station') {
    return 'station'
  }

  throw new Error(
    `Unsupported VULTISIG_EXTENSION_BRAND "${value}". Expected "vultisig" or "station".`
  )
}

const getCurrentProductBrand = (): ProductBrand => {
  if (typeof __VULTISIG_PRODUCT_BRAND__ !== 'undefined') {
    return resolveProductBrand(__VULTISIG_PRODUCT_BRAND__)
  }

  return defaultProductBrand
}

const productBrandConfigs: Record<ProductBrand, ProductBrandConfig> = {
  vultisig: {
    brand: 'vultisig',
    name: 'Vultisig',
    extensionName: 'Vultisig Extension',
    websiteUrl: 'https://vultisig.com',
  },
  station: {
    brand: 'station',
    name: 'Station',
    extensionName: 'Station Wallet',
    websiteUrl: 'https://station.money',
  },
}

export const currentProductBrand = getCurrentProductBrand()

export const currentProductBrandConfig =
  productBrandConfigs[currentProductBrand]
