import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'

/**
 * Hook for the Rive loading animation shown during MPC key generation.
 * Starts in Connecting state (`initialConnected: false`) and transitions
 * to Generating state when `setConnected(true)` is called.
 */
export const useKeygenLoadingAnimation = () =>
  useRiveLoadingAnimation({
    src: '/core/animations/keygen-loading.riv',
    initialConnected: false,
  })
