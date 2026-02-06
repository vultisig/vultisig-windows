import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type Props = {
  starters: string[]
  onSelect: (starter: string) => void
  isLoading?: boolean
  fullWidth?: boolean
}

export const ConversationStarters: FC<Props> = ({
  starters,
  onSelect,
  isLoading = false,
  fullWidth = true,
}) => {
  const { t } = useTranslation()

  if (starters.length === 0 && !isLoading) {
    return null
  }

  return (
    <VStack gap={8} style={{ width: fullWidth ? '100%' : undefined }}>
      <Text size={12} color="supporting">
        {t('try_saying')}:
      </Text>
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
          fullWidth={fullWidth}
        >
          {starter}
        </SuggestionChip>
      ))}
    </VStack>
  )
}

const SuggestionChip = styled(UnstyledButton)<{ fullWidth: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mist')};
  border-radius: 12px;
  padding: 10px 14px;
  text-align: left;
  color: ${getColor('text')};
  font-size: 14px;
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
