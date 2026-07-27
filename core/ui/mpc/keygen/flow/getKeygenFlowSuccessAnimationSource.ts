import { ProductBrand } from '@core/ui/product/brand'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

type Input = {
  productBrand: ProductBrand
  securityType: VaultSecurityType
}

export const getKeygenFlowSuccessAnimationSource = ({
  productBrand,
  securityType,
}: Input): string =>
  productBrand === 'station' && securityType === 'fast'
    ? 'station-keygen-fast'
    : `keygen-${securityType}`
