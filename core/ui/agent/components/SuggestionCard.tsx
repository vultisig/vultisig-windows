import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { Suggestion } from '../types'

type Props = {
  suggestion: Suggestion
  onSelect: (suggestion: Suggestion) => void
}

export const SuggestionCard: FC<Props> = ({ suggestion, onSelect }) => {
  return (
    <Card onClick={() => onSelect(suggestion)}>
      <VStack gap={4}>
        <Text size={14} weight={500}>
          {suggestion.title}
        </Text>
        <Text size={12} color="supporting">
          {suggestion.description}
        </Text>
      </VStack>
    </Card>
  )
}

const Card = styled(UnstyledButton)`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('primary')}40;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${getColor('foregroundExtra')};
    border-color: ${getColor('primary')};
  }
`
