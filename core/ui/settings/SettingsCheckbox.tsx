import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { interactive } from '@lib/ui/css/interactive'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { InvisibleInput } from '@lib/ui/inputs/checkbox/InvisibleInput'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type SettingsCheckboxProps = {
  value: boolean
  onChange: (value: boolean) => void
  label: ReactNode
  'data-testid'?: string
}

/** The 24px ring-and-check confirmation row of the settings screens. */
export const SettingsCheckbox = ({
  value,
  onChange,
  label,
  'data-testid': testId,
}: SettingsCheckboxProps) => (
  <Row>
    <Ring aria-hidden $isChecked={value}>
      {value && <CheckMark />}
    </Ring>
    <Text color="shyExtra" variant="caption">
      {label}
    </Text>
    <InvisibleInput
      checked={value}
      data-testid={testId}
      onChange={event => onChange(event.target.checked)}
      type="checkbox"
    />
  </Row>
)

const CheckMark = () => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
    <path
      d="M9.20052 12.4003L11.0005 14.4003L14.8005 9.60026"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Ring = styled.div<{ $isChecked: boolean }>`
  ${sameDimensions(24)};
  ${centerContent};
  border: 1px solid
    ${({ $isChecked }) =>
      $isChecked ? getColor('primary') : getColor('foregroundSuper')};
  ${borderRadius.pill};
  color: ${getColor('primary')};
  flex-shrink: 0;
  position: relative;

  &::before {
    ${borderRadius.pill};
    background: currentColor;
    content: '';
    inset: 0;
    opacity: ${({ $isChecked }) => ($isChecked ? 0.05 : 0)};
    position: absolute;
  }
`

const Row = styled.label`
  ${interactive};
  align-items: center;
  display: flex;
  gap: 8px;
  min-height: 40px;
  padding-inline: 8px;
  position: relative;

  &:has(:focus-visible) ${Ring} {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`
