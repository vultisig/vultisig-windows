import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { FormEvent, KeyboardEvent, useState } from 'react'
import styled from 'styled-components'

type ChatInputProps = {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput = ({
  onSend,
  disabled,
  placeholder = 'Ask me anything...',
}: ChatInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Container onSubmit={handleSubmit}>
      <InputRow alignItems="center" gap={8} fullWidth>
        <StyledInput
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus
        />
        <SendButton type="submit" disabled={disabled || !value.trim()}>
          <ArrowUpRightIcon />
        </SendButton>
      </InputRow>
    </Container>
  )
}

const Container = styled.form`
  padding: 12px 16px;
  border-top: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('background')};
`

const InputRow = styled(HStack)`
  background: ${getColor('foreground')};
  border-radius: 24px;
  padding: 4px 4px 4px 16px;
`

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${getColor('contrast')};
  font-size: 14px;

  &::placeholder {
    color: ${getColor('textShy')};
  }

  &:disabled {
    opacity: 0.5;
  }
`

const SendButton = styled(UnstyledButton)`
  ${sameDimensions(36)};
  ${centerContent};
  border-radius: 50%;
  background: ${getColor('buttonPrimary')};
  color: ${getColor('text')};
  font-size: 16px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${getColor('buttonHover')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`
