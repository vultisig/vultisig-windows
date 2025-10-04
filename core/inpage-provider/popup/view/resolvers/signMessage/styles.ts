import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const Description = styled(VStack)`
  border: 1px dashed ${getColor('foregroundSuper')};
  border-radius: 16px;
  gap: 8px;
  padding: 12px;
`

export const Divider = styled.div`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  height: 1px;
`

export const Image = styled.img`
  height: 36px;
  width: 36px;
`

export const Section = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
`

export const Verify = styled(HStack)`
  background-color: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  height: 28px;
  padding-left: 6px;
  padding-right: 8px;
`
