import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

type PositionSectionProps = ChildrenProp & {
  title: string
}

export const PositionSection = ({ title, children }: PositionSectionProps) => {
  return (
    <VStack gap={12}>
      <Text size={14} weight="500" color="shy">
        {title}
      </Text>
      <VStack gap={8}>{children}</VStack>
    </VStack>
  )
}
