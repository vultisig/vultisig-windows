import { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { centerContent } from '../../css/centerContent';
import { interactive } from '../../css/interactive';
import { sameDimensions } from '../../css/sameDimensions';
import { CheckIcon } from '../../icons/CheckIcon';
import { HStack } from '../../layout/Stack';
import { Text, text } from '../../text';
import { getColor } from '../../theme/getters';
import {
  InvisibleHTMLCheckbox,
  InvisibleHTMLCheckboxProps,
} from './InvisibleHTMLCheckbox';

interface CheckboxProps extends InvisibleHTMLCheckboxProps {
  label?: ReactNode;
  className?: string;
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
`;

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
`;

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
);
