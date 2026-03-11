import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SendIcon } from '@lib/ui/icons/SendIcon'
import { StopCircleIcon } from '@lib/ui/icons/StopCircleIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, KeyboardEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

type AgentChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  onStop?: () => void
  isLoading?: boolean
}

export const AgentChatInput: FC<AgentChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Start typing...',
  disabled = false,
  onStop,
  isLoading = false,
}) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const canSubmit = value.trim().length > 0 && !disabled && !isLoading

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
        $loading={isLoading}
        disabled={disabled || isLoading}
      />
      {isLoading ? (
        <ActionButton
          $active
          onClick={() => onStop?.()}
          disabled={false}
          aria-label={t('cancel')}
        >
          <StopCircleIcon style={{ fontSize: 20 }} />
        </ActionButton>
      ) : (
        <ActionButton
          $active={canSubmit}
          onClick={canSubmit ? onSubmit : undefined}
          disabled={!canSubmit}
          aria-label={t('send')}
        >
          <SendIcon style={{ fontSize: 20 }} />
        </ActionButton>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding: 0 8px 0 14px;
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

const Input = styled.input<{ $loading: boolean }>`
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
    opacity: ${({ $loading }) => ($loading ? 1 : 0.5)};
    cursor: ${({ $loading }) => ($loading ? 'default' : 'not-allowed')};
  }
`

const ActionButton = styled(UnstyledButton)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
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
