import { currentProductBrandConfig } from '../product/brand'

type ProductBrandInterpolationConfig = {
  extensionName: string
  name: string
  websiteUrl: string
}

export const getProductBrandInterpolation = ({
  extensionName,
  name,
  websiteUrl,
}: ProductBrandInterpolationConfig) => ({
  productExtensionName: extensionName,
  productName: name,
  productWebsiteHost: new URL(websiteUrl).host,
  productWebsiteUrl: websiteUrl,
})

export const productBrandInterpolation = getProductBrandInterpolation(
  currentProductBrandConfig
)
