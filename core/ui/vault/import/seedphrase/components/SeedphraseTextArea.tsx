import { textInput } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ChangeEvent, forwardRef } from 'react'
import styled, { css } from 'styled-components'

type SeedphraseTextAreaProps = {
  value: string
  onChange: (value: string) => void
  validation?: 'valid' | 'invalid' | 'idle'
  placeholder?: string
  wordCount?: string
  error?: string
}

const Container = styled(VStack)`
  position: relative;
  width: 100%;
`

const TextArea = styled.textarea<{
  validation?: 'valid' | 'invalid' | 'idle'
}>`
  ${textInput};
  height: auto;
  min-height: 120px;
  resize: none;
  padding: 16px;
  line-height: 1.5;
  text-transform: lowercase;

  ${({ validation }) =>
    validation === 'valid'
      ? css`
          border-color: ${getColor('primary')};
          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : validation === 'invalid'
        ? css`
            border-color: ${getColor('danger')};
            &:focus,
            &:hover {
              border-color: ${getColor('danger')};
            }
          `
        : css`
            border-color: transparent;
          `}
`

const WordCount = styled(Text)`
  position: absolute;
  right: 16px;
  bottom: 16px;
  pointer-events: none;
`

export const SeedphraseTextArea = forwardRef<
  HTMLTextAreaElement,
  SeedphraseTextAreaProps
>(({ value, onChange, validation, placeholder, wordCount, error }, ref) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  return (
    <VStack gap={8}>
      <Container>
        <TextArea
          ref={ref}
          value={value}
          onChange={handleChange}
          validation={validation}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {wordCount && (
          <WordCount size={12} color="shy">
            {wordCount}
          </WordCount>
        )}
      </Container>
      {error && (
        <Text size={13} color="danger">
          {error}
        </Text>
      )}
    </VStack>
  )
})

SeedphraseTextArea.displayName = 'SeedphraseTextArea'
