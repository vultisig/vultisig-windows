import { VStack } from '@lib/ui/layout/Stack'

import { InfoBanner } from './components/InfoBanner'
import { CircleDepositedPanel } from './deposited/CircleDepositedPanel'

export const CircleContent = () => {
  return (
    <VStack gap={12}>
      <InfoBanner />
      <CircleDepositedPanel />
    </VStack>
  )
}
