import { Button, buttonHeight } from '@lib/ui/buttons/Button'
import { ButtonProps } from '@lib/ui/buttons/ButtonProps'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type DeFiActionButtonProps = ButtonProps & {
  icon: ReactNode
}

const size = 'md'
const iconPadding = 6
const iconContainerSize = buttonHeight[size] - iconPadding * 2

const IconContainer = styled.div`
  position: absolute;
  left: ${toSizeUnit(iconPadding)};
  top: 50%;
  transform: translateY(-50%);
  ${sameDimensions(iconContainerSize)}
  ${round}
  background: rgba(255, 255, 255, 0.12);
  ${centerContent};
  color: ${getColor('text')};
  pointer-events: none;
  font-size: 12px;
`

const StyledButton = styled(Button)`
  padding-left: ${toSizeUnit(iconContainerSize + iconPadding * 2)};
`

export const DeFiActionButton: FC<DeFiActionButtonProps> = ({
  icon,
  children,
  ...props
}) => {
  return (
    <StyledButton {...props} size={size}>
      <IconContainer>{icon}</IconContainer>
      {children}
    </StyledButton>
  )
}
