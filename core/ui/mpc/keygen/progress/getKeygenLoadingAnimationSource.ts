import { ProductBrand } from '@core/ui/product/brand'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

/** Returns the keygen Rive asset for the current product and vault type. */
export const getKeygenLoadingAnimationSource = (
  productBrand: ProductBrand,
  securityType?: VaultSecurityType
): string =>
  productBrand === 'station' && securityType === 'fast'
    ? '/core/animations/station-keygen-fast.riv'
    : '/core/animations/keygen-loading.riv'
