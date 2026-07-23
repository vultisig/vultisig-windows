import { ProductBrand } from '@core/ui/product/brand'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

export const getKeygenLoadingAnimationSource = (
  productBrand: ProductBrand,
  securityType?: VaultSecurityType
): string =>
  productBrand === 'station' && securityType === 'fast'
    ? '/core/animations/station-keygen-fast.riv'
    : '/core/animations/keygen-loading.riv'
