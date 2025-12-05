import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

type PositionSectionProps = ChildrenProp & {
  title: string
}

export const PositionSection = ({ title, children }: PositionSectionProps) => {
  return (
    <VStack gap={12}>
      <Text size={14} weight="500" color="shy">
        {title}
      </Text>
      <PositionGrid>{children}</PositionGrid>
    </VStack>
  )
}

const PositionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`
