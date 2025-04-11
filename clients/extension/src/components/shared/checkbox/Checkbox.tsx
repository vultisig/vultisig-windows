import { centerContent } from '@lib/ui/css/centerContent'
import { interactive } from '@lib/ui/css/interactive'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import {
  InvisibleHTMLCheckbox,
  InvisibleHTMLCheckboxProps,
} from './InvisibleHTMLCheckbox'

interface CheckboxProps extends InvisibleHTMLCheckboxProps {
  label?: ReactNode
  className?: string
}

const Box = styled.div<{ isChecked: boolean }>`
  ${sameDimensions(24)}
  ${centerContent};
  border-radius: 100%;
  color: ${getColor('success')};
  background: ${getColor('foregroundExtra')};
  font-size: 16px;

  ${({ isChecked }) =>
    isChecked
      ? css`
          border: 1px solid ${getColor('success')};
        `
      : css`
          &:hover {
            background: ${getColor('foregroundSuper')};
          }
          border: 1px solid ${getColor('foregroundSuper')};
          background: ${getColor('foregroundExtra')};
        `};
`

const Container = styled(HStack)<{ isChecked: boolean }>`
  ${text({
    color: 'contrast',
    size: 14,
    weight: '400',
    family: 'mono',
  })}

  ${interactive}
  position: relative;

  ${({ isChecked }) =>
    !isChecked &&
    css`
      &:hover ${Box} {
        background: ${getColor('foregroundSuper')};
      }
    `}
`

export const Checkbox = ({
  value,
  onChange,
  label,
  className,
}: CheckboxProps) => (
  <Container
    isChecked={value}
    className={className}
    as="label"
    alignItems="center"
    gap={12}
  >
    <Box isChecked={value}>{value && <CheckIcon />}</Box>
    {label && <Text as="div">{label}</Text>}
    <InvisibleHTMLCheckbox value={value} onChange={onChange} />
  </Container>
)
