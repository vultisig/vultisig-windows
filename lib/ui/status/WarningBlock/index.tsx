import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, UiProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { ElementType, ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(HStack)`
  ${borderRadius.m};
  background-color: ${getColor('idleDark')};
  border: 1px solid ${getColor('idle')};
  padding: 16px;
`

const IconContainer = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 20px;
`

type WarningBlockProps = {
  icon?: ElementType
  iconTooltipContent?: ReactNode
} & ChildrenProp &
  UiProps

export const WarningBlock = ({
  children,
  icon: Icon = TriangleAlertIcon,
  iconTooltipContent,
  ...rest
}: WarningBlockProps) => {
  return (
    <Container
      alignItems="center"
      justifyContent="space-between"
      {...rest}
      fullWidth
    >
      <Text color="idle" size={14} weight="400">
        {children}
      </Text>
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
    </Container>
  )
}
