import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC, ReactNode } from 'react'

type ImportRequirementRowProps = {
  icon: ReactNode
  title: string
  subtitle: string
}

export const ImportRequirementRow: FC<ImportRequirementRowProps> = ({
  icon,
  title,
  subtitle,
}) => (
  <HStack gap={16} alignItems="start">
    <VStack style={{ fontSize: 20 }}>{icon}</VStack>
    <VStack gap={8}>
      <Text color="contrast" size={15} weight={500}>
        {title}
      </Text>
      <Text color="shy" size={13} weight={500}>
        {subtitle}
      </Text>
    </VStack>
  </HStack>
)
