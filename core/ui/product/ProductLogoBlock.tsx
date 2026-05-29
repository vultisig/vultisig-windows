import { VStack } from '@lib/ui/layout/Stack'
import Lottie from 'lottie-react'
import { useEffect } from 'react'

import { currentProductBrand } from './brand'
import { ProductLogo } from './ProductLogo'
import splashScreen from './splash-screen.json'
import { useStartupSplash } from './startupSplash'

const fallbackDurationBufferMs = 250

const splashAnimationDurationMs = Math.ceil(
  (splashScreen.op / splashScreen.fr) * 1000
)

const splashCompletionFallbackMs =
  splashAnimationDurationMs + fallbackDurationBufferMs

const stationSplashCompletionMs = 650

export const ProductLogoBlock = () => {
  const { completeStartupSplash, hasCompletedStartupSplash } =
    useStartupSplash()

  useEffect(() => {
    if (hasCompletedStartupSplash) return

    const timeoutId = setTimeout(
      () => {
        completeStartupSplash()
      },
      currentProductBrand === 'station'
        ? stationSplashCompletionMs
        : splashCompletionFallbackMs
    )

    return () => clearTimeout(timeoutId)
  }, [completeStartupSplash, hasCompletedStartupSplash])

  return (
    <VStack alignItems="center" justifyContent="center" fullSize>
      {currentProductBrand === 'station' ? (
        <ProductLogo style={{ fontSize: 96 }} />
      ) : (
        <Lottie
          animationData={splashScreen}
          loop={false}
          onComplete={completeStartupSplash}
        />
      )}
    </VStack>
  )
}
