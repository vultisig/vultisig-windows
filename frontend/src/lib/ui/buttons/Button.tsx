import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { UnstyledButton } from './UnstyledButton';
import { centerContent } from '../css/centerContent';
import { horizontalPadding } from '../css/horizontalPadding';
import { CenterAbsolutely } from '../layout/CenterAbsolutely';
import { Spinner } from '../loaders/Spinner';
import { getColor } from '../theme/getters';
import { match } from '../../utils/match';
import { getHoverVariant } from '../theme/getHoverVariant';
import { round } from '../css/round';

export const buttonSizes = ['xs', 's', 'm', 'l', 'xl'] as const;

type ButtonSize = (typeof buttonSizes)[number];

export const buttonKinds = ['primary', 'outlined'] as const;

export type ButtonKind = (typeof buttonKinds)[number];

interface ContainerProps {
  size: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  isRounded?: boolean;
  kind: ButtonKind;
}

const Container = styled(UnstyledButton)<ContainerProps>`
  ${centerContent};

  position: relative;

  white-space: nowrap;
  font-weight: 600;
  flex-shrink: 0;

  ${round};

  ${({ size }) =>
    match(size, {
      xs: () => css`
        ${horizontalPadding(8)}
        height: 28px;
        font-size: 12px;
      `,
      s: () => css`
        ${horizontalPadding(16)}
        height: 36px;
        font-size: 14px;
      `,
      m: () => css`
        ${horizontalPadding(20)}
        height: 40px;
        font-size: 16px;
      `,
      l: () => css`
        ${horizontalPadding(20)}
        height: 48px;
        font-size: 16px;
      `,
      xl: () => css`
        ${horizontalPadding(28)}
        height: 56px;
        font-size: 16px;
      `,
    })}

  ${({ kind }) =>
    match(kind, {
      primary: () => css`
        background: ${getColor('primary')};
        color: ${getColor('foreground')};
      `,
      outlined: () => css`
        font-weight: 700;
        color: ${getColor('primary')};
        background: ${getColor('foregroundExtra')};
        border: 1px solid ${getColor('primary')};
      `,
    })}
  
  ${({ isDisabled, isLoading, kind }) =>
    !isDisabled &&
    !isLoading &&
    css`
      &:hover {
        ${match(kind, {
          primary: () => css`
            background: ${getHoverVariant('primary')};
          `,
          outlined: () => css``,
        })}
      }
    `};

  cursor: ${({ isDisabled, isLoading }) =>
    isDisabled ? 'initial' : isLoading ? 'wait' : 'pointer'};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.8;
    `};
`;

export type ButtonProps = Omit<
  React.ComponentProps<typeof Container>,
  'size' | 'kind' | 'isDisabled'
> & {
  size?: ButtonSize;
  isDisabled?: boolean | string;
  isLoading?: boolean;
  isRounded?: boolean;
  kind?: ButtonKind;
  onClick?: () => void;
  as?: React.ElementType;
};

const Hide = styled.div`
  opacity: 0;
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size = 'm',
      isDisabled = false,
      isLoading = false,
      onClick,
      kind = 'primary',
      ...rest
    },
    ref
  ) => {
    const content = isLoading ? (
      <>
        <Hide>{children}</Hide>
        <CenterAbsolutely>
          <Spinner />
        </CenterAbsolutely>
      </>
    ) : (
      children
    );

    const containerProps = {
      kind,
      size,
      isDisabled: !!isDisabled,
      isLoading,
      onClick: isDisabled || isLoading ? undefined : onClick,
      ...rest,
    };

    return (
      <Container ref={ref} {...containerProps}>
        {content}
      </Container>
    );
  }
);

Button.displayName = 'Button';
