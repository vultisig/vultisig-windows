import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'

/**
 * Hook for the Rive loading animation shown during MPC keysign signing.
 *
 * @returns The result of {@link useRiveLoadingAnimation} configured with the
 *   keysign animation source, including `RiveComponent`, `containerRef`,
 *   `setConnected`, and `setProgress`.
 */
export const useKeysignLoadingAnimation = () =>
  useRiveLoadingAnimation({ src: '/core/animations/keysign-animation-v2.riv' })
