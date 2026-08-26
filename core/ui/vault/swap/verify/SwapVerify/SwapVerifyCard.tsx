import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'

import { ContainerWrapper } from './SwapVerify.styled'

/**
 * The single surface a swap is approved on. The amounts and every cost row
 * share one card, so a signer reads what the swap pays in the same frame as
 * what it returns rather than pairing two cards to price the trade.
 */
export const SwapVerifyCard = ({ children }: ChildrenProp) => (
  <ContainerWrapper radius={borderRadiusPx.lg}>
    <VStack bgColor="foreground" radius={borderRadiusPx.lg}>
      {children}
    </VStack>
  </ContainerWrapper>
)
