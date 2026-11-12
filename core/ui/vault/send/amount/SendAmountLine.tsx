import { MergeRefs } from '@lib/ui/base/MergeRefs'
import { measureTextWidth } from '@lib/ui/hooks/measureTextWidth'
import { useElementSize } from '@lib/ui/hooks/useElementSize'
import { useFitFontSize } from '@lib/ui/hooks/useFitFontSize'
import { useIsomorphicLayoutEffect } from '@lib/ui/hooks/useIsomorphicLayoutEffect'
import { getColor } from '@lib/ui/theme/getters'
import { useReducedMotion } from 'framer-motion'
import { ClipboardEventHandler, useRef, useState } from 'react'
import styled from 'styled-components'

import { RollingDigits } from './RollingDigits'

type SendAmountLineProps = {
  /** Exactly what the field holds; it is drawn as is, never reformatted. */
  text: string
  onTextChange: (text: string) => void
  onPaste?: ClipboardEventHandler<HTMLInputElement>
  unit: string
  placeholder: string
  disabled?: boolean
  isWarning?: boolean
  testId?: string
}

const baseFontSizePx = 34
/** About a third of the full size; past it the field scrolls. */
const minFontSizePx = 12
const unitGapPx = 8
const caretAllowancePx = 4

type CaretAfterEdit = {
  caret: number
  typedLength: number
}

/**
 * An amount and its unit centred on one line. A long amount shrinks the font
 * of both, down to about a third of full size, so the whole value stays
 * visible; past that the field scrolls. While the line fits, changed digits
 * roll into place over the real input, which keeps its caret, selection,
 * paste and accessibility.
 */
export const SendAmountLine = ({
  text,
  onTextChange,
  onPaste,
  unit,
  placeholder,
  disabled,
  isWarning,
  testId,
}: SendAmountLineProps) => {
  const shownText = text || placeholder
  const { setContainer, fontSize } = useFitFontSize({
    size: baseFontSizePx,
    minSize: minFontSizePx,
    text: `${shownText}${unit}`,
    fixedWidth: unitGapPx + caretAllowancePx,
  })
  const [line, setLine] = useState<HTMLElement | null>(null)
  const lineSize = useElementSize(line)
  const shouldReduceMotion = useReducedMotion() === true
  const inputRef = useRef<HTMLInputElement>(null)
  const caretAfterEditRef = useRef<CaretAfterEdit | null>(null)

  // A field that rewrites what was typed (a swapped decimal separator) keeps
  // the caret where the edit left it instead of jumping to the end.
  useIsomorphicLayoutEffect(() => {
    const edit = caretAfterEditRef.current
    caretAfterEditRef.current = null
    const input = inputRef.current
    if (!edit || !input || document.activeElement !== input) return

    const caret = Math.min(
      Math.max(edit.caret + text.length - edit.typedLength, 0),
      text.length
    )
    input.setSelectionRange(caret, caret)
  }, [text])

  const layout = (() => {
    if (!line || !lineSize) return null

    const { fontStyle, fontWeight, fontFamily } = getComputedStyle(line)
    const measure = (value: string) =>
      measureTextWidth({
        text: value,
        font: `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`,
      }) ?? 0

    const fieldRoom = lineSize.width - measure(unit) - unitGapPx
    const fieldWidth = measure(shownText) + caretAllowancePx

    return {
      inputWidth: Math.min(fieldWidth, fieldRoom),
      fits: fieldWidth <= fieldRoom,
    }
  })()

  const showsRollingDigits =
    !shouldReduceMotion && text !== '' && (layout?.fits ?? true)

  return (
    <MergeRefs<HTMLDivElement>
      refs={[setContainer, setLine]}
      render={lineRef => (
        <Line
          ref={lineRef}
          style={{ fontSize }}
          $isWarning={isWarning === true}
        >
          <Field>
            <Input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={text}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={isWarning || undefined}
              $hidesGlyphs={showsRollingDigits}
              style={layout ? { width: layout.inputWidth } : undefined}
              onChange={event => {
                const { value, selectionStart } = event.currentTarget
                caretAfterEditRef.current =
                  selectionStart === null
                    ? null
                    : { caret: selectionStart, typedLength: value.length }
                onTextChange(value)
              }}
              onPaste={onPaste}
              onWheel={event => event.currentTarget.blur()}
              data-testid={testId}
            />
            {showsRollingDigits && (
              <Overlay aria-hidden>
                <RollingDigits value={text} />
              </Overlay>
            )}
          </Field>
          <Unit>{unit}</Unit>
        </Line>
      )}
    />
  )
}

const Line = styled.div<{ $isWarning: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  font-weight: 500;
  line-height: 1.2;
  color: ${({ $isWarning }) =>
    $isWarning ? getColor('idle') : getColor('contrast')};
`

const Field = styled.div`
  position: relative;
  display: flex;
  min-width: 0;
`

const Input = styled.input<{ $hidesGlyphs: boolean }>`
  min-width: 1ch;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: ${({ $hidesGlyphs }) => ($hidesGlyphs ? 'transparent' : 'inherit')};
  caret-color: ${getColor('contrast')};

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

const Overlay = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  white-space: pre;
  pointer-events: none;
`

const Unit = styled.span`
  margin-left: ${unitGapPx}px;
  flex-shrink: 0;
  white-space: nowrap;
`
