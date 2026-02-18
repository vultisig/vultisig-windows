import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

type Props = {
  starters: string[]
  onSelect: (starter: string) => void
  isLoading?: boolean
}

export const ConversationStarters: FC<Props> = ({
  starters,
  onSelect,
  isLoading = false,
}) => {
  if (starters.length === 0 && !isLoading) {
    return null
  }

  return (
    <ChipsWrapper>
      {isLoading && starters.length === 0 && (
        <LoadingRow>
          <Spinner>
            <SparklesIcon />
          </Spinner>
          <Text size={13} color="supporting">
            Thinking of ideas...
          </Text>
        </LoadingRow>
      )}
      {starters.map((starter, index) => (
        <SuggestionChip
          key={`${starter}-${index}`}
          onClick={() => onSelect(starter)}
        >
          {starter}
        </SuggestionChip>
      ))}
    </ChipsWrapper>
  )
}

const ChipsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 400px;
`

const SuggestionChip = styled(UnstyledButton)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mist')};
  border-radius: 20px;
  padding: 8px 16px;
  color: ${getColor('text')};
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${getColor('foregroundExtra')};
    border-color: ${getColor('primary')};
  }
`

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
`

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('primary')};
  animation: spin 1.2s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
