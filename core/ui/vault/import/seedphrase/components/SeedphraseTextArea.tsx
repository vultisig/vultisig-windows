import { textInput } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { Ref } from 'react'
import styled, { css } from 'styled-components'

type SeedphraseTextAreaProps = InputProps<string> & {
  wordCount?: string
  ref?: Ref<HTMLTextAreaElement>
} & (
    | { error: string; isValid?: never }
    | { isValid: true; error?: never }
    | { isValid?: never; error?: never }
  )

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

  ${({ validation = 'idle' }) =>
    match(validation, {
      valid: () => css`
        border-color: ${getColor('primary')};
        &:focus,
        &:hover {
          border-color: ${getColor('primary')};
        }
      `,
      invalid: () => css`
        border-color: ${getColor('danger')};
        &:focus,
        &:hover {
          border-color: ${getColor('danger')};
        }
      `,
      idle: () => css`
        border-color: transparent;
      `,
    })}
`

const WordCount = styled(Text)`
  position: absolute;
  right: 16px;
  bottom: 16px;
  pointer-events: none;
`

export const SeedphraseTextArea = ({
  value,
  onChange,
  wordCount,
  error,
  isValid,
  ref,
}: SeedphraseTextAreaProps) => {
  const validation = isValid ? 'valid' : error ? 'invalid' : 'idle'

  return (
    <VStack gap={8}>
      <Container>
        <TextArea
          ref={ref}
          value={value}
          onChange={event => onChange(event.target.value)}
          validation={validation}
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
}
