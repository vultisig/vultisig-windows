import { borderRadius } from '@lib/ui/css/borderRadius'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, UiProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Container = styled(HStack)`
  ${borderRadius.m};
  background: ${getColor('dangerBackground')};
  border: 1px solid
    ${({ theme: { colors } }) =>
      colors.danger.getVariant({ a: () => 0.25 }).toCssValue()};
  padding: 16px;
`

const Icon = styled(TriangleAlertIcon)`
  color: ${getColor('danger')};
  font-size: 20px;
`

type ErrorBlockProps = ChildrenProp &
  UiProps &
  React.ComponentProps<typeof Container>

export const ErrorBlock = ({ children, ...rest }: ErrorBlockProps) => {
  return (
    <Container alignItems="center" gap={12} {...rest} fullWidth>
      <Icon />
      <Text color="danger" size={13} weight="500">
        {children}
      </Text>
    </Container>
  )
}
