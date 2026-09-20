import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Container = styled(HStack)`
  align-items: center;
  gap: 12px;
  padding: 16px;
  ${borderRadius.xl};
  background: ${({ theme }) => theme.colors.idle.toRgba(0.05)};
  border: 1px solid ${getColor('idle')};
`

const Icon = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 16px;
  flex-shrink: 0;
`

/**
 * The banner a review sheet shows in place of its sign controls when the
 * transaction cannot be signed as filled in — e.g. the vault cannot cover it.
 */
export const ReviewWarningBanner = ({ children }: ChildrenProp) => (
  <Container>
    <Icon>
      <CircleInfoIcon />
    </Icon>
    <Text as="span" variant="caption" color="idle">
      {children}
    </Text>
  </Container>
)
