import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { interactive } from '@lib/ui/css/interactive'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { InvisibleHTMLCheckbox } from '@lib/ui/inputs/checkbox/InvisibleHTMLCheckbox'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

const Ring = styled.div<{ $checked: boolean }>`
  ${sameDimensions(24)};
  ${centerContent};
  ${borderRadius.pill};
  flex-shrink: 0;
  box-sizing: border-box;
  font-size: 14px;
  color: ${getColor('success')};
  background: ${({ theme }) => theme.colors.success.toRgba(0.05)};
  border: 1px solid
    ${({ $checked }) =>
      $checked ? getColor('success') : getColor('foregroundSuper')};
  transition: border-color 0.2s;
`

const Item = styled(HStack)<{ $checked: boolean }>`
  ${interactive};
  position: relative;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  min-height: 24px;

  ${({ $checked }) =>
    !$checked &&
    css`
      &:hover ${Ring} {
        border-color: ${getColor('foregroundSuperContrast')};
      }
    `}

  &:has(:focus-visible) ${Ring} {
    outline: 2px solid ${getColor('success')};
    outline-offset: 2px;
  }
`

type ReviewTermsProps = {
  terms: string[]
  accepted: boolean[]
  onChange: (index: number, value: boolean) => void
}

/**
 * The confirmations a review sheet asks for before it lets the user sign —
 * each a sentence with a round check beside it.
 */
export const ReviewTerms = ({
  terms,
  accepted,
  onChange,
}: ReviewTermsProps) => (
  <VStack gap={12}>
    {terms.map((term, index) => {
      const checked = accepted[index]

      return (
        <Item
          key={index}
          as="label"
          $checked={checked}
          data-testid={`terms-checkbox-${index}`}
        >
          <Ring $checked={checked}>{checked && <CheckIcon />}</Ring>
          <Text as="span" variant="stationBodyS" color="regular">
            {term}
          </Text>
          <InvisibleHTMLCheckbox
            value={checked}
            onChange={value => onChange(index, value)}
          />
        </Item>
      )
    })}
  </VStack>
)
