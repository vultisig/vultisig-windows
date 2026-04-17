import { decodeImage, useViewModelInstanceImage } from '@rive-app/react-webgl2'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect } from 'react'

import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'
import { rasterizeImage } from '../../../../animations/utils/rasterizeImage'

type UseKeysignLoadingAnimationInput = {
  logoSrc?: string
}

/**
 * Hook for the Rive loading animation shown during MPC keysign signing.
 *
 * @param logoSrc - Optional URL of the logo (coin or chain) to display inside
 *   the Rive animation via the `toToken` ViewModel image input.
 * @returns The result of {@link useRiveLoadingAnimation} configured with the
 *   keysign animation source, including `RiveComponent`, `containerRef`,
 *   `setConnected`, and `setProgress`.
 */
export const useKeysignLoadingAnimation = ({
  logoSrc,
}: UseKeysignLoadingAnimationInput = {}) => {
  const animation = useRiveLoadingAnimation({
    src: '/core/animations/keysign-animation-v2.riv',
  })

  const toToken = useViewModelInstanceImage(
    'toToken',
    animation.viewModelInstance
  )

  useEffect(() => {
    if (!logoSrc || !toToken) return

    let cancelled = false
    const load = async () => {
      const result = await attempt(async () => {
        const bytes = await rasterizeImage(logoSrc)
        if (cancelled) return null
        const riveImage = await decodeImage(bytes)
        if (cancelled) return null
        return riveImage
      })

      if ('data' in result && result.data) {
        toToken.setValue(result.data)
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [logoSrc, toToken])

  return animation
}
