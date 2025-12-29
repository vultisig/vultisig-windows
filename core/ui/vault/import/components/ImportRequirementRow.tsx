import { HStack, VStack } from '@lib/ui/layout/Stack'
import { DescriptionProp, IconProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

type ImportRequirementRowProps = IconProp & TitleProp & DescriptionProp

export const ImportRequirementRow: FC<ImportRequirementRowProps> = ({
  icon,
  title,
  description,
}) => (
  <HStack gap={16} alignItems="start">
    <VStack style={{ fontSize: 20 }}>{icon}</VStack>
    <VStack gap={8}>
      <Text color="contrast" size={15} weight={500}>
        {title}
      </Text>
      <Text color="shy" size={13} weight={500}>
        {description}
      </Text>
    </VStack>
  </HStack>
)
