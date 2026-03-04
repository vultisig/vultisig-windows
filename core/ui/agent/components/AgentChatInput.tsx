import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SendIcon } from '@lib/ui/icons/SendIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, KeyboardEvent, useRef } from 'react'
import styled, { css } from 'styled-components'

type AgentChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
}

export const AgentChatInput: FC<AgentChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Start typing...',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const canSubmit = value.trim().length > 0 && !disabled

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Container onClick={() => inputRef.current?.focus()}>
      <Input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <SendButton
        $active={canSubmit}
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit}
        aria-label="Send message"
      >
        <SendIcon style={{ fontSize: 20 }} />
      </SendButton>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 14px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 40px;
  cursor: text;
  position: relative;

  box-shadow:
    inset 0px 20px 20px 0px rgba(0, 0, 255, 0.1),
    inset 0px -2px 4px 0px rgba(206, 213, 255, 0.1),
    inset 0px 2px 8px 0px rgba(137, 170, 255, 0.1);
`

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  color: ${getColor('text')};
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 0;

  &::placeholder {
    color: ${getColor('textShy')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SendButton = styled(UnstyledButton)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 77px;
  flex-shrink: 0;
  transition: background-color 0.2s;

  ${({ $active }) =>
    $active
      ? css`
          background: ${getColor('buttonPrimary')};
          border: 1px solid ${getColor('buttonNeutral')};
          color: ${getColor('contrast')};
          cursor: pointer;

          &:hover {
            background: ${getColor('buttonHover')};
          }
        `
      : css`
          background: ${getColor('buttonBackgroundDisabled')};
          border: 1px solid transparent;
          color: ${getColor('buttonTextDisabled')};
          cursor: default;
        `}
`
