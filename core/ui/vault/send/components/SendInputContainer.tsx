import { borderRadius } from '@lib/ui/css/borderRadius'
import { interactive } from '@lib/ui/css/interactive'
import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'

export const SendInputContainer = ({
  children,
  ...props
}: ChildrenProp & HTMLAttributes<HTMLDivElement>) => (
  <Wrapper gap={16} {...props}>
    {children}
  </Wrapper>
)

const Wrapper = styled(VStack)`
  ${interactive}
  padding: 12px;
  ${borderRadius.m}
  border:1px solid  ${getColor('foregroundSuper')}
`
