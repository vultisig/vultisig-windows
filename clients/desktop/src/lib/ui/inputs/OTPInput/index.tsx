import { forwardRef, Ref } from 'react';
import { ComponentProps } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '../../buttons/Button';
import { borderRadius } from '../../css/borderRadius';
import { HStack } from '../../layout/Stack';
import { getColor } from '../../theme/getters';
import { useOtp } from './useOTP';

export interface OTPInputProps
  extends ComponentProps<typeof InputBoxContainer> {
  length?: number;
  onCompleted?: (value: string) => void;
  onValueChange?: (value: string) => void;
  validation: 'invalid' | 'valid' | undefined;
}

export const OTPInput = forwardRef(function OTPInputInner(
  {
    length = 5,
    onValueChange,
    onCompleted,
    className,
    validation,
    ...props
  }: OTPInputProps,
  ref: Ref<HTMLInputElement> | null
) {
  const { otp, handleChange, handleKeyDown, handlePaste } = useOtp(
    length,
    onValueChange,
    onCompleted
  );

  return (
    <HStack alignItems="center" gap={10} className={className}>
      {otp.map((data, index) => (
        <InputBoxContainer
          validation={validation}
          autoFocus={index === 0}
          key={index}
          id={`otp-${index}`}
          type="text"
          value={data}
          onKeyDown={e => handleKeyDown(e, index)}
          onChange={e => handleChange(e, index)}
          maxLength={1}
          ref={index === 0 ? ref : null}
          {...props}
        />
      ))}
      <PasteButton onClick={handlePaste}>Paste</PasteButton>
    </HStack>
  );
});

const InputBoxContainer = styled.input<{
  validation?: 'invalid' | 'valid';
}>`
  width: 46px;
  height: 46px;
  text-align: center;
  font-size: 18px;
  border: 2px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
  ${borderRadius.m}
  outline: none;
  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }

  ${({ validation }) =>
    validation === 'valid'
      ? css`
          border-color: ${getColor('primary')};
          background-color: ${getColor('primary')};

          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : validation === 'invalid' &&
        css`
          border-color: ${getColor('danger')};

          &:focus,
          &:hover {
            border-color: ${getColor('danger')};
          }
        `}
`;

const PasteButton = styled(Button)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  cursor: pointer;
  color: ${getColor('text')};
  ${borderRadius.m}

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`;
