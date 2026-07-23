import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'
import { currentProductBrand } from '../../../../product/brand'
import { VaultSecurityType } from '../../../../vault/VaultSecurityType'
import { getKeygenLoadingAnimationSource } from '../getKeygenLoadingAnimationSource'

/**
 * Hook for the Rive loading animation shown during MPC key generation.
 * Starts in Connecting state (`initialConnected: false`) and transitions
 * to Generating state when `setConnected(true)` is called.
 */
export const useKeygenLoadingAnimation = (securityType?: VaultSecurityType) =>
  useRiveLoadingAnimation({
    src: getKeygenLoadingAnimationSource(currentProductBrand, securityType),
    initialConnected: false,
  })
