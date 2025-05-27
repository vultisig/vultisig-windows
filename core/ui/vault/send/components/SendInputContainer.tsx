import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SendInputContainer = ({ children }: ChildrenProp) => (
  <Wrapper gap={16}>{children}</Wrapper>
)

const Wrapper = styled(VStack)`
  padding: 12px;
  ${borderRadius.m}
  border:1px solid  ${getColor('foregroundSuper')}
`
