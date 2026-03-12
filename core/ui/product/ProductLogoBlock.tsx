import { VStack } from '@lib/ui/layout/Stack'
import Lottie from 'lottie-react'
import { useEffect } from 'react'

import splashScreen from './splash-screen.json'
import { useStartupSplash } from './startupSplash'

const fallbackDurationBufferMs = 250

const splashAnimationDurationMs = Math.ceil(
  (splashScreen.op / splashScreen.fr) * 1000
)

const splashCompletionFallbackMs =
  splashAnimationDurationMs + fallbackDurationBufferMs

export const ProductLogoBlock = () => {
  const { completeStartupSplash, hasCompletedStartupSplash } =
    useStartupSplash()

  useEffect(() => {
    if (hasCompletedStartupSplash) return

    const timeoutId = setTimeout(() => {
      completeStartupSplash()
    }, splashCompletionFallbackMs)

    return () => clearTimeout(timeoutId)
  }, [completeStartupSplash, hasCompletedStartupSplash])

  return (
    <VStack alignItems="center" justifyContent="center" fullSize>
      <Lottie
        animationData={splashScreen}
        loop={false}
        onComplete={completeStartupSplash}
      />
    </VStack>
  )
}
