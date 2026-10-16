import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { VStack } from '@lib/ui/layout/Stack'

/** A DeFi protocol's own screen, opened from the DeFi tab's list. */
export const DefiProtocolPage = () => (
  <VStack justifyContent="space-between" flexGrow position="relative">
    <VStack flexGrow>
      <CircleView />
    </VStack>
    <BottomNavigation activeTab="defi" isActiveTabRoot={false} />
  </VStack>
)
