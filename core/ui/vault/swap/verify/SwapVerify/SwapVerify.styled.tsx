import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ContainerWrapper = styled(VStack)`
  background-image: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.success.toRgba(0.5)} 0%,
    ${({ theme }) => theme.colors.success.getVariant({ l: () => 19 }).toRgba(0)}
      100%
  );
  padding: 1px;
`

export const IconWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
  background-color: ${getColor('foregroundExtra')};
  border-radius: 99px;
  position: relative;

  &:before {
    position: absolute;
    content: '';
    width: 1px;
    background-color: ${getColor('foregroundExtra')};
    height: 14px;
    top: -16px;
    left: 12px;
  }

  &:after {
    position: absolute;
    content: '';
    width: 1px;
    background-color: ${getColor('foregroundExtra')};
    height: 14px;
    bottom: -16px;
    left: 12px;
  }
`

export const HorizontalLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${getColor('foregroundExtra')};
`
