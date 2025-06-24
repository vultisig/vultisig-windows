import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, UiProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { ElementType, ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(HStack)`
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;
`

const IconContainer = styled(IconWrapper)`
  color: ${getColor('contrast')};
  font-size: 20px;
`

type InfoBlockProps = {
  icon?: ElementType
  iconTooltipContent?: ReactNode
} & ChildrenProp &
  UiProps

export const InfoBlock = ({
  children,
  icon: Icon = CircleInfoIcon,
  iconTooltipContent,
  ...rest
}: InfoBlockProps) => {
  return (
    <Container alignItems="center" gap={8} {...rest} fullWidth>
      {iconTooltipContent ? (
        <Tooltip
          content={iconTooltipContent}
          renderOpener={props => (
            <IconContainer {...props}>
              <Icon />
            </IconContainer>
          )}
        />
      ) : (
        <IconContainer>
          <Icon />
        </IconContainer>
      )}
      <Text color="contrast" size={14} weight="400">
        {children}
      </Text>
    </Container>
  )
}
