import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, UiProps } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import React, { ElementType, ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  ${borderRadius.m};
  border: 1px solid
    ${({ theme }) =>
      theme.colors.idle.getVariant({ a: () => 0.25 }).toCssValue()};
  background: ${getColor('idleDark')};
  padding: 16px;

  ${hStack({
    fullWidth: true,
    alignItems: 'baseline',
    gap: 12,
  })}
`

const IconContainer = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 22px;
`

const Content = styled.div`
  flex: 1;
  ${text({
    color: 'idle',
    centerHorizontally: true,
    weight: '600',
  })}
`

type WarningBlockProps = {
  icon?: ElementType
  iconTooltipContent?: ReactNode
} & ChildrenProp &
  UiProps

export const WarningBlock = ({
  children,
  iconTooltipContent,
  icon: Icon,
  ...rest
}: WarningBlockProps) => {
  const icon = Icon ? (
    <Icon />
  ) : (
    <IconContainer>
      <TriangleAlertIcon />
    </IconContainer>
  )

  return (
    <Container {...rest}>
      <Content>{children}</Content>
      {iconTooltipContent ? (
        <Tooltip
          content={iconTooltipContent}
          placement="bottom"
          renderOpener={props => <div {...props}>{icon}</div>}
        />
      ) : (
        icon
      )}
    </Container>
  )
}
