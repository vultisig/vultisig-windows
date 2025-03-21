import styled from 'styled-components'

import { textInputBackground } from '../../../../lib/ui/css/textInput'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { text } from '../../../../lib/ui/text'
import { getColor } from '../../../../lib/ui/theme/getters'
import { SwapSide } from '../../../../vault/swap/providers/SideProvider'

export const Container = styled(VStack)<{
  side: SwapSide
}>`
  min-height: 112px;
  ${textInputBackground};
  ${text({
    color: 'contrast',
    size: 16,
    weight: 700,
  })}
  padding: 16px;
  border-radius: ${({ side }) =>
    side === 'to' ? '12px 12px 24px 24px' : '24px 24px 12px 12px'};
  border: 1px solid ${getColor('foregroundExtra')};
`

export const CoinWrapper = styled(HStack)`
  cursor: pointer;
  padding: 6px;
  border-radius: 99px;
  background-color: ${getColor('foregroundExtra')};
`
