import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type BackupOverviewInfoRowProps = {
  icon: ReactNode
  title: string
  description: ReactNode
}

export const BackupOverviewInfoRow = ({
  icon,
  title,
  description,
}: BackupOverviewInfoRowProps) => (
  <HStack alignItems="start" gap={16}>
    <IconContainer>{icon}</IconContainer>
    <VStack gap={8} style={{ paddingTop: 2 }}>
      <Text size={15} weight={500} color="contrast">
        {title}
      </Text>
      <Text size={13} color="shy">
        {description}
      </Text>
    </VStack>
  </HStack>
)

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('info')};
`
