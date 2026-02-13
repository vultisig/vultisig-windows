import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { Suggestion } from '../state/chatTypes'

type SuggestionCardProps = {
  suggestion: Suggestion
  onSelect: (suggestion: Suggestion) => void
  disabled?: boolean
}

const SuggestionCard = ({
  suggestion,
  onSelect,
  disabled,
}: SuggestionCardProps) => {
  return (
    <Card onClick={() => !disabled && onSelect(suggestion)} disabled={disabled}>
      <VStack gap={4}>
        <Text size={14} weight={500} color="contrast">
          {suggestion.title}
        </Text>
        <Text size={12} color="shy">
          {suggestion.description}
        </Text>
      </VStack>
    </Card>
  )
}

const Card = styled(UnstyledButton)<{ disabled?: boolean }>`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  text-align: left;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${getColor('foregroundDark')};
    border-color: ${getColor('buttonPrimary')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

type SuggestionCardsProps = {
  suggestions: Suggestion[]
  onSelect: (suggestion: Suggestion) => void
  disabled?: boolean
}

export const SuggestionCards = ({
  suggestions,
  onSelect,
  disabled,
}: SuggestionCardsProps) => {
  if (suggestions.length === 0) return null

  return (
    <VStack gap={8} fullWidth>
      <Text size={12} color="shy">
        Suggestions:
      </Text>
      {suggestions.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </VStack>
  )
}
