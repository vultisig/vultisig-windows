import { VStack } from '@lib/ui/layout/Stack'
import Lottie from 'lottie-react'

import splashScreen from './splash-screen.json'

export const ProductLogoBlock = () => (
  <VStack alignItems="center" justifyContent="center" fullSize>
    <Lottie animationData={splashScreen} loop={false} />
  </VStack>
)
