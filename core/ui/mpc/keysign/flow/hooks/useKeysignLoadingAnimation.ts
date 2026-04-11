import { decodeImage, useViewModelInstanceImage } from '@rive-app/react-webgl2'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect } from 'react'

import { useRiveLoadingAnimation } from '../../../../animations/useRiveLoadingAnimation'
import { rasterizeImage } from '../../../../animations/utils/rasterizeImage'

type UseKeysignLoadingAnimationInput = {
  chainLogoSrc?: string
}

/**
 * Hook for the Rive loading animation shown during MPC keysign signing.
 *
 * @param chainLogoSrc - Optional URL of the chain logo to display inside
 *   the Rive animation via the `fromLogo` ViewModel image input.
 * @returns The result of {@link useRiveLoadingAnimation} configured with the
 *   keysign animation source, including `RiveComponent`, `containerRef`,
 *   `setConnected`, and `setProgress`.
 */
export const useKeysignLoadingAnimation = ({
  chainLogoSrc,
}: UseKeysignLoadingAnimationInput = {}) => {
  const animation = useRiveLoadingAnimation({
    src: '/core/animations/keysign-animation-v2.riv',
  })

  const fromLogo = useViewModelInstanceImage(
    'fromLogo',
    animation.viewModelInstance
  )

  useEffect(() => {
    if (!chainLogoSrc || !fromLogo) return

    let cancelled = false
    const load = async () => {
      const result = await attempt(async () => {
        const bytes = await rasterizeImage(chainLogoSrc)
        if (cancelled) return null
        const riveImage = await decodeImage(bytes)
        if (cancelled) return null
        return riveImage
      })

      if ('data' in result && result.data) {
        fromLogo.setValue(result.data)
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [chainLogoSrc, fromLogo])

  return animation
}
