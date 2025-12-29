import { HStack, VStack } from '@lib/ui/layout/Stack'
import { DescriptionProp, IconProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

type ImportRequirementRowProps = IconProp & TitleProp & DescriptionProp

const IconWrapper = styled(VStack)`
  color: ${getColor('primaryAlt')};
  font-size: 20px;
  flex-shrink: 0;
`

export const ImportRequirementRow: FC<ImportRequirementRowProps> = ({
  icon,
  title,
  description,
}) => (
  <HStack gap={16} alignItems="start">
    <IconWrapper>{icon}</IconWrapper>
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
