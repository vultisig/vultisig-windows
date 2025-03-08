import styled from 'styled-components'

import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { getColor } from '../../../../lib/ui/theme/getters'

export const SecureVaultPill = styled(HStack)`
  background-color: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 8px 12px;
  border-radius: 99px;
  color: ${getColor('primary')};
`
export const ContentWrapper = styled(VStack)`
  position: relative;
  width: 500px;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      82deg,
      rgba(51, 230, 191, 0.15) 8.02%,
      rgba(4, 57, 199, 0.15) 133.75%
    );
    filter: blur(50px);
    opacity: 0.5;
    border-radius: 360px;
    z-index: -1;
  }
`
