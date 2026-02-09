import { IconButton } from '@lib/ui/buttons/IconButton'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { CircleCrossFilledIcon } from '@lib/ui/icons/CircleCrossFilledIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { FC, KeyboardEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type Props = {
  onSend: (message: string) => void
  onStop?: () => void
  isRunning?: boolean
  disabled?: boolean
  placeholder?: string
}

export const ChatInput: FC<Props> = ({
  onSend,
  onStop,
  isRunning = false,
  disabled = false,
  placeholder,
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (trimmed && !disabled && !isRunning) {
      onSend(trimmed)
      setValue('')
    }
  }

  const handleAction = () => {
    if (isRunning) {
      onStop?.()
      return
    }
    handleSend()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAction()
    }
  }

  return (
    <Container>
      <HStack gap={8} alignItems="flex-end">
        <InputWrapper>
          <TextArea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('type_a_message')}
            disabled={disabled || isRunning}
            rows={1}
          />
        </InputWrapper>
        <SendButton
          kind="primary"
          size="lg"
          onClick={handleAction}
          disabled={isRunning ? false : disabled || !value.trim()}
          status={isRunning ? 'danger' : 'default'}
        >
          {isRunning ? <CircleCrossFilledIcon /> : <ArrowUpRightIcon />}
        </SendButton>
      </HStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 12px 16px;
  background: ${getColor('background')};
  border-top: 1px solid ${getColor('mist')};
`

const InputWrapper = styled.div`
  flex: 1;
  background: ${getColor('foreground')};
  border-radius: 20px;
  padding: 8px 16px;
`

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  color: ${getColor('text')};
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  min-height: 24px;
  max-height: 120px;

  &::placeholder {
    color: ${getColor('textSupporting')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SendButton = styled(IconButton)`
  svg {
    width: 18px;
    height: 18px;
  }
`
