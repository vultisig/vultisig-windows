import { ComponentProps, forwardRef, Ref } from 'react';
import styled, { css } from 'styled-components';

import { match } from '@lib/utils/match';
import { borderRadius } from '../css/borderRadius';
import { centerContent } from '../css/centerContent';
import { sameDimensions } from '../css/sameDimensions';
import { toSizeUnit } from '../css/toSizeUnit';
import { getColor, matchColor } from '../theme/getters';
import { UnstyledButton } from './UnstyledButton';

export const iconButtonSizes = ['s', 'm', 'l'] as const;
export type IconButtonSize = (typeof iconButtonSizes)[number];

export const iconButtonKinds = ['regular'] as const;
export type IconButtonKind = (typeof iconButtonKinds)[number];

export const iconButtonSizeRecord: Record<IconButtonSize, number> = {
  s: 24,
  m: 32,
  l: 40,
};

export const iconButtonIconSizeRecord: Record<IconButtonSize, number> = {
  s: 14,
  m: 16,
  l: 18,
};

interface ContainerProps {
  size: IconButtonSize;
  kind: IconButtonKind;
  isDisabled?: boolean;
}

const Container = styled(UnstyledButton)<ContainerProps>`
  position: relative;
  ${centerContent};
  ${({ size }) => sameDimensions(iconButtonSizeRecord[size])};

  color: ${matchColor('kind', {
    regular: 'contrast',
  })};

  font-size: ${({ size }) => toSizeUnit(iconButtonIconSizeRecord[size])};

  ${borderRadius.s};

  background: ${({ kind, theme: { colors } }) =>
    match(kind, {
      regular: () => colors.transparent,
    }).toCssValue()};

  ${({ isDisabled, kind, theme }) =>
    !isDisabled &&
    css`
      &:hover {
        background: ${match(kind, {
          regular: () => theme.colors.mist.toCssValue(),
        })};

        color: ${match(kind, {
          regular: () => getColor('contrast'),
        })};
      }
    `}

  cursor: ${({ isDisabled }) => (isDisabled ? 'initial' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.8 : 1)};
`;

export type IconButtonProps = Omit<
  ComponentProps<typeof Container>,
  'size' | 'kind' | 'isDisabled'
> & {
  icon: React.ReactNode;
  size?: IconButtonSize;
  kind?: IconButtonKind;
  title?: string;
  as?: React.ElementType;
  isDisabled?: boolean | string;
};

export const IconButton = forwardRef(function IconButton(
  {
    size = 'm',
    kind = 'regular',
    icon,
    type = 'button',
    isDisabled = false,
    onClick,

    ...rest
  }: IconButtonProps,
  ref: Ref<HTMLButtonElement> | null
) {
  const containerProps = {
    type,
    kind,
    size,
    isDisabled: !!isDisabled,
    onClick: isDisabled ? undefined : onClick,
    ...rest,
  };

  return (
    <Container ref={ref} {...containerProps}>
      {icon}
    </Container>
  );
});
