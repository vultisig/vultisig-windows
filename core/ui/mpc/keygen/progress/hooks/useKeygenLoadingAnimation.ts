import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'

/**
 * Hook for the Rive loading animation shown during MPC key generation.
 *
 * @returns The result of {@link useRiveLoadingAnimation} configured with the
 *   keygen animation source, including `RiveComponent`, `containerRef`,
 *   `setConnected`, and `setProgress`.
 */
export const useKeygenLoadingAnimation = () =>
  useRiveLoadingAnimation({ src: '/core/animations/keygen-loading.riv' })
