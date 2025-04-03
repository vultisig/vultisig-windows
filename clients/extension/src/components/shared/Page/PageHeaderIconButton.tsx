import { Hoverable } from '@lib/ui/base/Hoverable'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps, ReactNode } from 'react'
import styled from 'styled-components'

import { pageConfig } from './config'

const Container = styled(Hoverable)`
  font-size: 20px;
  color: ${getColor('contrast')};
`

type PageHeaderIconButtonProps = ComponentProps<typeof Container> & {
  icon: ReactNode
}

const offset = pageConfig.header.iconButton.offset

export const PageHeaderIconButton = ({
  icon,
  as,
  ...rest
}: PageHeaderIconButtonProps) => {
  return (
    <Container
      forwardedAs={as}
      verticalOffset={offset}
      horizontalOffset={offset}
      {...rest}
    >
      <IconWrapper>{icon}</IconWrapper>
    </Container>
  )
}
