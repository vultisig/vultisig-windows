import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ChangeEvent } from 'react'
import styled from 'styled-components'

type StakingAmountInputProps = {
  value: string
  onChange: (value: string) => void
  ticker: string
  /** Optional sub-line under the input (e.g. "100%" on the undelegate slider). */
  subtitle?: string
}

/**
 * Editable, centered amount input used by the Cosmos staking forms.
 * Accepts the form's `amount` field value (string from react-hook-form) and
 * filters keystrokes to numeric only. Renders the ticker next to the value
 * in the same large weight, matching Figma.
 */
export const StakingAmountInput = ({
  value,
  onChange,
  ticker,
  subtitle,
}: StakingAmountInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '.')
    // Empty input clears; otherwise accept only a single decimal-point number.
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw)
    }
  }

  return (
    <Wrapper>
      <Row>
        <AmountInput
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={handleChange}
        />
        <AmountTicker as="span">{ticker}</AmountTicker>
      </Row>
      {subtitle ? (
        <Text size={14} color="shy">
          {subtitle}
        </Text>
      ) : null}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
`

const AmountInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${getColor('text')};
  font-family: Brockmann, sans-serif;
  font-size: 34px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -1px;
  text-align: right;
  min-width: 60px;
  /* Grows with content; cap so it does not push the ticker off the edge. */
  field-sizing: content;
  max-width: 260px;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: ${getColor('textShy')};
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border: none;
  }
`

const AmountTicker = styled(Text)`
  font-family: Brockmann, sans-serif;
  font-size: 34px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -1px;
`
