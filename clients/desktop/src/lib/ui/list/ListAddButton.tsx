import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { AsProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps } from 'react'
import styled from 'styled-components'

const Container = styled(UnstyledButton)`
  gap: 16px;
  display: flex;
  align-items: center;

  font-weight: 700;
  font-size: 16px;
  color: ${getColor('primary')};
`

const IconContainer = styled(IconWrapper)`
  font-size: 20px;
`

export const ListAddButton = ({
  children,
  ...rest
}: ComponentProps<typeof Container> & AsProp) => {
  return (
    <Container {...rest}>
      <IconContainer>
        <PlusIcon />
      </IconContainer>
      {children}
    </Container>
  )
}
